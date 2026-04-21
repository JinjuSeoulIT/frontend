"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MainLayout from "@/components/layout/MainLayout";
import {
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
  type BillingDeposit,
} from "@/lib/billing/billingDepositApi";
import {
  PAYMENT_METHOD_OPTIONS,
  type PaymentMethod,
} from "@/lib/billing/billingApi";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";

export default function BillingDepositsPage() {
  const router = useRouter();

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

      await createBillingDepositApi({
        patientId: Number(patientId),
        depositAmount: Number(depositAmount),
        paymentMethod,
        depositMemo: depositMemo.trim() || undefined,
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
            현재 1차 구현은 환자 기준 선수금 등록과 목록 조회까지 제공합니다.
            선수금 사용/차감/취소/상세는 다음 단계에서 확장합니다.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            선수금 등록 입력
          </Typography>

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
                <TableCell>메모</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.depositId}>
                  <TableCell>{deposit.depositId}</TableCell>
                  <TableCell>{resolvePatientName(deposit.patientId)}</TableCell>
                  <TableCell>{deposit.patientId}</TableCell>
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
                  <TableCell>{deposit.depositMemo || "-"}</TableCell>
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
