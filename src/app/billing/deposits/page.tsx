"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MainLayout from "@/components/layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  createBillingDepositApi,
  fetchBillingDepositsApi,
  updateBillingDepositMemoApi,
  type BillingDeposit,
} from "@/lib/billing/billingDepositApi";
import {
  PAYMENT_METHOD_OPTIONS,
  type PaymentMethod,
} from "@/lib/billing/billingApi";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  parseDepositLinkedBillId,
  stripDepositBillTag,
  withDepositBillTag,
} from "@/lib/billing/depositBillLink";

const DEPOSITS_PATH = "/billing/deposits";

function DepositMemoEditor({
  deposit,
  onRefresh,
}: {
  deposit: BillingDeposit;
  onRefresh: () => Promise<void>;
}) {
  const linkedBillId = useMemo(
    () => parseDepositLinkedBillId(deposit.depositMemo),
    [deposit.depositMemo]
  );
  const serverUserMemo = stripDepositBillTag(deposit.depositMemo ?? "");

  const [value, setValue] = useState(serverUserMemo);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const maxUserChars = useMemo(() => {
    if (linkedBillId == null) return 500;
    return Math.max(0, 500 - `__BILL__|${linkedBillId}\n`.length);
  }, [linkedBillId]);

  useEffect(() => {
    setValue(stripDepositBillTag(deposit.depositMemo ?? ""));
    setLocalError(null);
  }, [deposit.depositMemo, deposit.depositId, deposit.updatedAt]);

  const trimmed = value.trim();
  const dirty = trimmed !== serverUserMemo.trim();

  const handleSave = async () => {
    try {
      setSaving(true);
      setLocalError(null);
      const payloadMemo =
        linkedBillId != null
          ? withDepositBillTag(linkedBillId, trimmed)
          : trimmed.length > 0
            ? trimmed
            : null;
      await updateBillingDepositMemoApi(deposit.depositId, {
        depositMemo: payloadMemo,
      });
      await onRefresh();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "메모 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={0.5} sx={{ minWidth: 220, maxWidth: 360 }}>
      <TextField
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="메모"
        multiline
        maxRows={3}
        inputProps={{ maxLength: maxUserChars }}
        error={Boolean(localError)}
        helperText={
          localError ??
          (linkedBillId != null
            ? `${trimmed.length}/${maxUserChars} (청구 #${linkedBillId} 연결)`
            : `${trimmed.length}/500`)
        }
      />
      <Button
        size="small"
        variant="outlined"
        onClick={handleSave}
        disabled={!dirty || saving}
      >
        저장
      </Button>
    </Stack>
  );
}

function BillingDepositsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedBillIdRaw = searchParams.get("billId");
  const linkedBillIdParsed = linkedBillIdRaw ? Number(linkedBillIdRaw) : NaN;
  const linkedBillIdFromQuery =
    Number.isFinite(linkedBillIdParsed) && linkedBillIdParsed > 0
      ? linkedBillIdParsed
      : null;

  const memoFieldMax =
    linkedBillIdFromQuery != null
      ? Math.max(0, 500 - `__BILL__|${linkedBillIdFromQuery}\n`.length)
      : 500;

  const [patientId, setPatientId] = useState("");
  const [listPatientIdFilter, setListPatientIdFilter] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [depositMemo, setDepositMemo] = useState("");

  const [deposits, setDeposits] = useState<BillingDeposit[]>([]);
  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadDeposits = useCallback(async (patientIdFilter?: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchBillingDepositsApi(patientIdFilter);
      setDeposits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "선수금 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  useEffect(() => {
    let active = true;

    const loadPatients = async () => {
      try {
        const patients: Patient[] = await fetchPatientsApi();

        if (!active) return;

        const byId = patients.reduce<Record<number, string>>((acc, patient) => {
          if (patient.patientId && patient.name?.trim()) {
            acc[patient.patientId] = patient.name.trim();
          }
          return acc;
        }, {});

        setPatientNameById(byId);
      } catch (err) {
        console.error("[billing/deposits] failed to load patients", err);
        if (!active) return;
        setPatientNameById({});
      }
    };

    loadPatients();

    return () => {
      active = false;
    };
  }, []);

  const resolvePatientName = useCallback(
    (id: number) => patientNameById[id] || "-",
    [patientNameById]
  );

  const canSubmit = useMemo(() => {
    return Number(patientId) > 0 && Number(depositAmount) > 0;
  }, [patientId, depositAmount]);

  const paymentMethodLabelByValue = useMemo(() => {
    return PAYMENT_METHOD_OPTIONS.reduce<Record<PaymentMethod, string>>(
      (acc, option) => {
        acc[option.value] = option.label;
        return acc;
      },
      {
        CASH: "현금",
        CARD: "카드",
        TRANSFER: "계좌이체",
      }
    );
  }, []);

  const formatDateTime = useCallback((value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString("ko-KR");
  }, []);

  const handleSearchDeposits = async () => {
    const patientIdFilter = Number(listPatientIdFilter);

    if (listPatientIdFilter.trim() !== "" && (!patientIdFilter || patientIdFilter <= 0)) {
      setError("조회용 환자 ID는 0보다 큰 숫자여야 합니다.");
      return;
    }

    setSuccessMessage(null);
    await loadDeposits(listPatientIdFilter.trim() === "" ? undefined : patientIdFilter);
  };

  const handleResetDepositsFilter = async () => {
    setListPatientIdFilter("");
    setSuccessMessage(null);
    await loadDeposits();
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("환자 ID와 선수금 금액을 올바르게 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const userMemo = depositMemo.trim();
      const memoPayload =
        linkedBillIdFromQuery != null
          ? withDepositBillTag(linkedBillIdFromQuery, userMemo)
          : userMemo || undefined;
      if (memoPayload && memoPayload.length > 500) {
        setError("메모는 청구 연결 정보 포함 500자까지 입력할 수 있습니다.");
        setSaving(false);
        return;
      }

      await createBillingDepositApi({
        patientId: Number(patientId),
        depositAmount: Number(depositAmount),
        paymentMethod,
        depositMemo: memoPayload,
      });

      setSuccessMessage("선수금이 등록되었습니다.");
      setPatientId("");
      setDepositAmount("");
      setPaymentMethod("CASH");
      setDepositMemo("");
      await loadDeposits();
    } catch (err) {
      setError(err instanceof Error ? err.message : "선수금 등록 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => router.push("/billing")}
          >
            뒤로 가기
          </Button>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            선수금 등록
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f8fafc",
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
            선수금 등록 안내
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            환자 기준 선수금 등록·목록 조회와, 목록에서 메모 수정을 제공합니다.
            선수금 사용/차감/취소/상세는 다음 단계에서 확장합니다.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            선수금 등록 입력
          </Typography>

          {linkedBillIdFromQuery != null && (
            <Alert severity="info" sx={{ mb: 2 }}>
              청구 #{linkedBillIdFromQuery}에 연결해 등록합니다. 해당 청구 상세에
              선수금 합계로 표시됩니다.
            </Alert>
          )}

          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="환자 ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value.replace(/[^0-9]/g, ""))}
                fullWidth
              />
              <TextField
                label="선수금 금액"
                value={depositAmount}
                onChange={(e) =>
                  setDepositAmount(e.target.value.replace(/[^0-9]/g, ""))
                }
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                label="결제 수단"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                fullWidth
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="메모"
                value={depositMemo}
                onChange={(e) => setDepositMemo(e.target.value)}
                fullWidth
                inputProps={{ maxLength: memoFieldMax }}
                helperText={
                  linkedBillIdFromQuery != null
                    ? `${depositMemo.trim().length}/${memoFieldMax} (청구 연결 태그 제외)`
                    : undefined
                }
              />
            </Stack>

            {error && <Typography color="error">{error}</Typography>}
            {successMessage && (
              <Typography sx={{ color: "success.main", fontWeight: 600 }}>
                {successMessage}
              </Typography>
            )}

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving || !canSubmit}
              >
                선수금 등록
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <TextField
              label="목록 조회용 환자 ID"
              value={listPatientIdFilter}
              onChange={(e) =>
                setListPatientIdFilter(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="비우면 전체 조회"
              size="small"
              sx={{ minWidth: { md: 260 } }}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={handleSearchDeposits}
                disabled={loading}
              >
                조회
              </Button>
              <Button
                variant="text"
                onClick={handleResetDepositsFilter}
                disabled={loading}
              >
                필터 초기화
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>선수금 ID</TableCell>
                <TableCell>환자명</TableCell>
                <TableCell>환자ID</TableCell>
                <TableCell>선수금 금액</TableCell>
                <TableCell>결제 수단</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>수납 시각</TableCell>
                <TableCell sx={{ minWidth: 240 }}>메모</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.depositId}>
                  <TableCell>{deposit.depositId}</TableCell>
                  <TableCell>
                    <Link
                      href={`/billing/patients/${deposit.patientId}/latest?returnTo=${encodeURIComponent(
                        DEPOSITS_PATH
                      )}`}
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {resolvePatientName(deposit.patientId)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/billing/patients/${deposit.patientId}/latest?returnTo=${encodeURIComponent(
                        DEPOSITS_PATH
                      )}`}
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {deposit.patientId}
                    </Link>
                  </TableCell>
                  <TableCell>{deposit.depositAmount.toLocaleString()} 원</TableCell>
                  <TableCell>{paymentMethodLabelByValue[deposit.paymentMethod]}</TableCell>
                  <TableCell>
                    <Chip
                      label={deposit.depositStatus === "REGISTERED" ? "등록" : "취소"}
                      color={deposit.depositStatus === "REGISTERED" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(deposit.receivedAt)}</TableCell>
                  <TableCell align="left" sx={{ verticalAlign: "top" }}>
                    <DepositMemoEditor
                      deposit={deposit}
                      onRefresh={async () => {
                        const patientIdFilter = Number(listPatientIdFilter);
                        await loadDeposits(
                          listPatientIdFilter.trim() === ""
                            ? undefined
                            : patientIdFilter
                        );
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {deposits.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    등록된 선수금이 없습니다.
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    로딩 중...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainLayout>
  );
}

export default function BillingDepositsPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <Box sx={{ p: 3 }}>선수금 화면을 불러오는 중…</Box>
        </MainLayout>
      }
    >
      <BillingDepositsPageInner />
    </Suspense>
  );
}
