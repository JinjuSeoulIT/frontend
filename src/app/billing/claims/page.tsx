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
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const SOURCE_TYPE = "CLINICAL_ORDER_ITEM";
const ORDER_TYPE_OPTIONS = ["PRESCRIPTION", "BLOOD", "OTHER"] as const;

type ClaimItemForm = {
  itemName: string;
  itemCode: string;
  orderType: string;
  sourceId: string;
  sourceType: string;
};

export default function BillingClaimsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { billingClaimResult, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const [visitId, setVisitId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [eventId, setEventId] = useState("");
  const [occurredAt, setOccurredAt] = useState(getDefaultOccurredAt());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [items, setItems] = useState<ClaimItemForm[]>([createEmptyClaimItem()]);

  useEffect(() => {
    dispatch(setBillingClaimResult(null));

    return () => {
      dispatch(setBillingClaimResult(null));
    };
  }, [dispatch]);

  useEffect(() => {
    setEventId(createAutoEventId());
  }, []);

  useEffect(() => {
    if (!submitAttempted) return;
    if (!billingClaimResult?.billId) return;

    router.push(`/billing/${billingClaimResult.billId}`);
  }, [billingClaimResult, submitAttempted, router]);

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

    if (items.length === 0) {
      return "청구 항목은 최소 1건 이상 필요합니다.";
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const rowNumber = index + 1;

      if (!item.sourceId.trim()) {
        return `${rowNumber}번째 항목의 sourceId를 입력해주세요.`;
      }

      const sourceIdNumber = Number(item.sourceId);
      if (Number.isNaN(sourceIdNumber) || sourceIdNumber <= 0) {
        return `${rowNumber}번째 항목의 sourceId는 0보다 큰 숫자여야 합니다.`;
      }

      if (!item.orderType.trim()) {
        return `${rowNumber}번째 항목의 orderType을 선택해주세요.`;
      }

      if (!item.itemName.trim() && !item.itemCode.trim()) {
        return `${rowNumber}번째 항목은 itemName 또는 itemCode 중 하나는 입력해야 합니다.`;
      }
    }

    return "";
  }, [visitId, patientId, items]);

  const handleChangeItem = (
    index: number,
    field: keyof ClaimItemForm,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          [field]: field === "sourceId" ? onlyNumber(value) : value,
        };
      })
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyClaimItem()]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) {
        return [createEmptyClaimItem()];
      }

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmit = () => {
    if (validationMessage) return;

    const autoEventId = createAutoEventId();
    const autoOccurredAt = new Date().toISOString();

    setEventId(autoEventId);
    setOccurredAt(toDatetimeLocal(autoOccurredAt));
    setSubmitAttempted(true);

    const requestItems: BillingClaimItemRequest[] = items.map((item) => ({
      itemName: item.itemName.trim(),
      itemCode: item.itemCode.trim(),
      orderType: item.orderType.trim(),
      sourceId: Number(item.sourceId),
      sourceType: item.sourceType.trim() || SOURCE_TYPE,
    }));

    dispatch(
      createBillingClaimRequest({
        eventId: autoEventId,
        visitId: Number(visitId),
        patientId: Number(patientId),
        status: "COMPLETED",
        occurredAt: autoOccurredAt,
        items: requestItems,
      })
    );
  };

  const handleReset = () => {
    setVisitId("");
    setPatientId("");
    setEventId(createAutoEventId());
    setOccurredAt(getDefaultOccurredAt());
    setSubmitAttempted(false);
    setItems([createEmptyClaimItem()]);
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
                    현재 화면에서는 진료 ID, 환자 ID, 청구 항목(items)을 직접 입력하고,
                    이벤트 ID / 처리 상태 / 발생 일시는 자동으로 세팅됩니다.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    각 청구 항목은 sourceId가 필수이며, itemName이 비어 있어도 itemCode가
                    있으면 전송 가능합니다. sourceType은 현재 billing 기준으로
                    CLINICAL_ORDER_ITEM 고정값을 사용합니다.
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label="이벤트 ID 자동 생성" size="small" />
                    <Chip label="진료 ID 입력" size="small" />
                    <Chip label="환자 ID 입력" size="small" />
                    <Chip label="청구 항목 직접 입력" size="small" />
                    <Chip label="처리 상태 자동 고정" size="small" />
                    <Chip label="발생 일시 자동 세팅" size="small" />
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
                alreadyProcessed = {billingClaimResult.alreadyProcessed ? "true" : "false"}
              </Alert>
            )}

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

                  <TextField
                    label="처리 상태"
                    value="완료 (COMPLETED)"
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="현재 청구 요청은 완료 이벤트 기준으로만 생성됩니다."
                  />

                  <TextField
                    label="발생 일시"
                    value={occurredAt}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="제출 시 현재 시각 기준으로 자동 반영됩니다."
                  />

                  <Divider />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        청구 항목 입력
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        clinical에서 전달되는 items 구조를 기준으로 직접 입력합니다.
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={handleAddItem}
                      disabled={loading}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      항목 추가
                    </Button>
                  </Stack>

                  <Stack spacing={2}>
                    {items.map((item, index) => (
                      <Card
                        key={`claim-item-${index}`}
                        variant="outlined"
                        sx={{ borderRadius: 2.5, borderColor: "rgba(0,0,0,0.08)" }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack spacing={2}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="subtitle2" fontWeight={700}>
                                항목 {index + 1}
                              </Typography>

                              <IconButton
                                aria-label={`항목 ${index + 1} 삭제`}
                                onClick={() => handleRemoveItem(index)}
                                disabled={loading}
                                size="small"
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Stack>

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                              <TextField
                                label="항목명 (itemName)"
                                value={item.itemName}
                                onChange={(e) =>
                                  handleChangeItem(index, "itemName", e.target.value)
                                }
                                fullWidth
                                size="small"
                                placeholder="예: 혈액검사"
                              />

                              <TextField
                                label="항목코드 (itemCode)"
                                value={item.itemCode}
                                onChange={(e) =>
                                  handleChangeItem(index, "itemCode", e.target.value)
                                }
                                fullWidth
                                size="small"
                                placeholder="예: LAB001"
                              />
                            </Stack>

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                              <TextField
                                select
                                label="orderType"
                                value={item.orderType}
                                onChange={(e) =>
                                  handleChangeItem(index, "orderType", e.target.value)
                                }
                                fullWidth
                                size="small"
                              >
                                {ORDER_TYPE_OPTIONS.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>

                              <TextField
                                label="sourceId"
                                value={item.sourceId}
                                onChange={(e) =>
                                  handleChangeItem(index, "sourceId", e.target.value)
                                }
                                fullWidth
                                size="small"
                                placeholder="예: 2001"
                              />
                            </Stack>

                            <TextField
                              label="sourceType"
                              value={item.sourceType}
                              onChange={(e) =>
                                handleChangeItem(index, "sourceType", e.target.value)
                              }
                              fullWidth
                              size="small"
                              InputProps={{ readOnly: true }}
                              helperText="현재 billing 기준으로 CLINICAL_ORDER_ITEM 고정값을 사용합니다."
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>

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

function createAutoEventId() {
  return `EVT-${Date.now()}`;
}

function getDefaultOccurredAt() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${date}T${hours}:${minutes}`;
}

function toDatetimeLocal(isoString: string) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function onlyNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function createEmptyClaimItem(): ClaimItemForm {
  return {
    itemName: "",
    itemCode: "",
    orderType: "PRESCRIPTION",
    sourceId: "",
    sourceType: SOURCE_TYPE,
  };
}
