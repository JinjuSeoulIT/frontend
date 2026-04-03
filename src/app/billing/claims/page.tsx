"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  createBillingClaimRequest,
  setBillingClaimResult,
} from "@/features/billing/billingSlice";
import type { BillingClaimItemRequest } from "@/lib/billing/billingApi";

import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EventNoteIcon from "@mui/icons-material/EventNote";

export default function BillingClaimsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { billingClaimResult, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  /* ================================
     수정: 사용자 직접 입력은 visitId, patientId만 유지
  ================================ */
  const [visitId, setVisitId] = useState("");
  const [patientId, setPatientId] = useState("");

  /* ================================
     추가: 자동 생성/고정 표시용 상태
  ================================ */
  const [eventId, setEventId] = useState("");
  const [status] = useState("COMPLETED");
  const [occurredAt, setOccurredAt] = useState(getDefaultOccurredAt());

  /* ================================
     추가: submit 이후 성공 이동 제어용 상태
  ================================ */
  const [submitAttempted, setSubmitAttempted] = useState(false);

  /* ================================
     추가: 페이지 진입 시 이전 claims 결과 초기화
  ================================ */
  useEffect(() => {
    dispatch(setBillingClaimResult(null));

    return () => {
      dispatch(setBillingClaimResult(null));
    };
  }, [dispatch]);

  /* ================================
     추가: 페이지 진입 시 eventId 자동 생성
  ================================ */
  useEffect(() => {
    setEventId(createAutoEventId());
  }, []);

  /* ================================
     추가: claims 성공 시 bill 상세 페이지로 이동
  ================================ */
  useEffect(() => {
    if (!submitAttempted) return;
    if (!billingClaimResult?.billId) return;

    router.push(`/billing/${billingClaimResult.billId}`);
  }, [billingClaimResult, submitAttempted, router]);

  /* ================================
     수정: eventId/status/occurredAt 직접 검증 제거
     사용자 입력값인 visitId, patientId만 검증
  ================================ */
  const validationMessage = useMemo(() => {
    if (!visitId.trim()) return "진료 ID를 입력해주세요.";
    if (!patientId.trim()) return "환자 ID를 입력해주세요.";

    const visitIdNumber = Number(visitId);
    if (Number.isNaN(visitIdNumber) || visitIdNumber <= 0) {
      return "진료 ID는 0보다 큰 숫자여야 합니다.";
    }

    const patientIdNumber = Number(patientId);
    if (Number.isNaN(patientIdNumber) || patientIdNumber <= 0) {
      return "환자 ID는 0보다 큰 숫자여야 합니다.";
    }

    return "";
  }, [visitId, patientId]);

  const handleSubmit = () => {
    if (validationMessage) return;

    const autoEventId = createAutoEventId();
    const autoOccurredAt = new Date().toISOString();

    /* ================================
       추가: 제출 시 자동 세팅값 화면에도 반영
    ================================ */
    setEventId(autoEventId);
    setOccurredAt(toDatetimeLocal(autoOccurredAt));

    setSubmitAttempted(true);

    /* ================================
       추가: claims 테스트용 항목 배열
       현재 백엔드 claims는 items가 필수이므로
       화면에서도 items를 함께 전송하도록 반영
    ================================ */
    const items: BillingClaimItemRequest[] = [
      {
        itemName: "혈액검사",
        itemCode: "LAB001",
        orderType: "BLOOD",
        sourceId: 2001,
        sourceType: "CLINICAL_ORDER_ITEM",
      },
      {
        itemName: "",
        itemCode: "RX001",
        orderType: "PRESCRIPTION",
        sourceId: 2002,
        sourceType: "CLINICAL_ORDER_ITEM",
      },
    ];

    dispatch(
      createBillingClaimRequest({
        eventId: autoEventId,
        visitId: Number(visitId),
        patientId: Number(patientId),
        status: "COMPLETED",
        occurredAt: autoOccurredAt,
        items,
      })
    );
  };

  const handleReset = () => {
    setVisitId("");
    setPatientId("");
    setEventId(createAutoEventId());
    setOccurredAt(getDefaultOccurredAt());
    setSubmitAttempted(false);
    dispatch(setBillingClaimResult(null));
  };

  return (
    <MainLayout>
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          backgroundColor: "#f6f8fb",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ maxWidth: 980, mx: "auto" }}>
          <Stack spacing={3}>
            {/* ================================
                상단 헤더
            ================================= */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(123, 31, 162, 0.10)",
                      color: "#7b1fa2",
                    }}
                  >
                    <ReceiptLongIcon />
                  </Box>

                  <Box>
                    <Typography variant="h5" fontWeight={800}>
                      청구 요청 생성
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      진료 완료 이벤트 기준으로 청구 생성을 요청합니다.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* ================================
                입력 안내
            ================================= */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventNoteIcon sx={{ color: "#7b1fa2" }} />
                    <Typography variant="h6" fontWeight={700}>
                      입력 안내
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    현재 화면에서는 진료 ID와 환자 ID만 입력하고,
                    이벤트 ID / 처리 상태 / 발생 일시는 자동으로 세팅됩니다.
                  </Typography>

                  {/* ================================
                      추가: 현재는 테스트용 items를 같이 전송한다는 안내
                  ================================= */}
                  <Typography variant="body2" color="text.secondary">
                    현재 claims 화면에서는 백엔드 연동 검증을 위해 테스트용
                    청구 항목(items)이 함께 전송됩니다. 이후 clinical 연동이 완료되면
                    실제 Order / OrderItem 기반 데이터로 대체될 예정입니다.
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label="이벤트 ID 자동 생성" size="small" />
                    <Chip label="진료 ID 입력" size="small" />
                    <Chip label="환자 ID 입력" size="small" />
                    <Chip label="처리 상태 자동 고정" size="small" />
                    <Chip label="발생 일시 자동 세팅" size="small" />
                    <Chip label="테스트용 items 자동 포함" size="small" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {billingClaimResult && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                청구 요청 처리 결과: billId = {billingClaimResult.billId},{" "}
                alreadyProcessed ={" "}
                {billingClaimResult.alreadyProcessed ? "true" : "false"}
              </Alert>
            )}

            {/* ================================
                입력 폼
            ================================= */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.5}>
                  <Typography variant="h6" fontWeight={700}>
                    청구 요청 정보 입력
                  </Typography>

                  <Divider />

                  {/* ================================
                      수정: 자동 세팅값은 읽기 전용 표시
                  ================================= */}
                  <TextField
                    label="이벤트 ID"
                    value={eventId}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="제출 시 자동 생성되는 이벤트 식별값입니다."
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                      label="진료 ID"
                      value={visitId}
                      onChange={(e) => setVisitId(onlyNumber(e.target.value))}
                      fullWidth
                      placeholder="예: 101"
                      size="small"
                    />

                    <TextField
                      label="환자 ID"
                      value={patientId}
                      onChange={(e) => setPatientId(onlyNumber(e.target.value))}
                      fullWidth
                      placeholder="예: 1"
                      size="small"
                    />
                  </Stack>

                  {/* ================================
                      수정: 처리 상태는 고정값 표시
                  ================================= */}
                  <TextField
                    label="처리 상태"
                    value="완료 (COMPLETED)"
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="현재 청구 요청은 완료 이벤트 기준으로만 생성됩니다."
                  />

                  {/* ================================
                      수정: 발생 일시는 자동 세팅 표시
                  ================================= */}
                  <TextField
                    label="발생 일시"
                    value={occurredAt}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="제출 시 현재 시각 기준으로 자동 반영됩니다."
                  />

                  {validationMessage && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      {validationMessage}
                    </Alert>
                  )}

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      onClick={() => router.push("/billing")}
                      disabled={loading}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      대시보드로 돌아가기
                    </Button>

                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleReset}
                      disabled={loading}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      입력 초기화
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading || !!validationMessage}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                        boxShadow: "none",
                      }}
                    >
                      {loading ? "청구 요청 처리 중..." : "청구 요청 보내기"}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </MainLayout>
  );
}

/* ================================
   추가: 자동 이벤트 ID 생성
================================ */
function createAutoEventId() {
  return `EVT-${Date.now()}`;
}

/* ================================
   기본 datetime-local 값 생성
================================ */
function getDefaultOccurredAt() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${date}T${hours}:${minutes}`;
}

/* ================================
   추가: ISO 문자열을 화면 표시용 datetime-local 형식으로 변환
================================ */
function toDatetimeLocal(isoString: string) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/* ================================
   숫자만 입력되도록 처리
================================ */
function onlyNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}