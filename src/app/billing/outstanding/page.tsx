"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Script from "next/script";
import toast from "react-hot-toast";
import { getSessionUser } from "@/lib/auth/session";

import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";

import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Button,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  fetchOutstandingBillsRequest,
  fetchBillingStatsRequest,
} from "@/features/billing/billingSlice";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  createPaymentApi,
  type BillSummary,
  type PaymentMethod,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/billing/billingApi";
import { getSessionUser } from "@/lib/auth/session";
import {
  getBillingStatusLabel,
  getBillingStatusColor,
} from "@/lib/billing/billingStatus";

declare global {
  interface Window {
    TossPayments?: any;
  }
}

interface TossOutstandingPaymentContext {
  billId: number;
  patientId: number;
  requestedAmount: number;
  orderId: string;
  staffId: string;
  returnTo: string;
  returnLabel: string;
}

export default function OutstandingBillingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const sessionUser = useMemo(() => getSessionUser(), []);

  const { billingList, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );
  const [amountByBillId, setAmountByBillId] = useState<Record<number, string>>({});
  const [methodByBillId, setMethodByBillId] = useState<
    Record<number, PaymentMethod>
  >({});
  const [processingBillId, setProcessingBillId] = useState<number | null>(null);

  const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  useEffect(() => {
    dispatch(fetchOutstandingBillsRequest());
  }, [dispatch]);

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
        console.error("[billing/outstanding] failed to load patients", err);

        if (!active) return;
        setPatientNameById({});
      }
    };

    loadPatients();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const nextAmounts: Record<number, string> = {};
    const nextMethods: Record<number, PaymentMethod> = {};

    (billingList ?? []).forEach((bill) => {
      nextAmounts[bill.billId] = String(bill.remainingAmount);
      nextMethods[bill.billId] = methodByBillId[bill.billId] ?? "CASH";
    });

    setAmountByBillId(nextAmounts);
    setMethodByBillId(nextMethods);
  }, [billingList]);

  const resolvePatientName = useCallback(
    (patientId: number) => {
      return patientNameById[patientId] || "-";
    },
    [patientNameById]
  );

  const sortedBillingList = useMemo(() => {
    return [...(billingList ?? [])].sort((a, b) => {
      return (
        new Date(b.treatmentDate).getTime() -
        new Date(a.treatmentDate).getTime()
      );
    });
  }, [billingList]);

  const createOrderId = (billId: number) => {
    return `bill-${billId}-${Date.now()}`;
  };

  const getBaseUrl = () => {
    return typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:8081`
      : "http://192.168.1.68:8081";
  };

  const resolveStaffId = () => {
    if (typeof window === "undefined") return "";

    return (
      sessionStorage.getItem("staffId") ||
      localStorage.getItem("staffId") ||
      sessionStorage.getItem("STAFF_ID") ||
      localStorage.getItem("STAFF_ID") ||
      getSessionUser()?.userId ||
      ""
    ).trim();
  };

  const refreshOutstanding = () => {
    dispatch(fetchOutstandingBillsRequest());
    dispatch(fetchBillingStatsRequest());
  };

  const requestTossCardPayment = async (
    bill: BillSummary,
    amount: number
  ) => {
    if (!tossClientKey) {
      toast.error("토스 클라이언트 키가 없습니다.");
      return;
    }

    if (!window.TossPayments) {
      toast.error("토스 SDK가 아직 로드되지 않았습니다.");
      return;
    }

    const staffId = resolveStaffId();

    if (!staffId) {
      toast.error("직원 ID를 확인할 수 없습니다.");
      return;
    }

    const orderId = createOrderId(bill.billId);

    const context: TossOutstandingPaymentContext = {
      billId: bill.billId,
      patientId: bill.patientId,
      requestedAmount: amount,
      orderId,
      staffId,
      returnTo: "/billing/outstanding",
      returnLabel: "미수금 목록",
    };

    sessionStorage.setItem("tossPaymentContext", JSON.stringify(context));

    try {
      const tossPayments = window.TossPayments(tossClientKey);
      const payment = tossPayments.payment({
        customerKey: `patient-${bill.patientId}`,
      });

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: amount,
        },
        orderId,
        orderName: `미수금 정산 - ${bill.billingNo ?? bill.billId}`,
        successUrl: `${window.location.origin}/billing/toss/success`,
        failUrl: `${window.location.origin}/billing/toss/fail`,
      });
    } catch (error) {
      console.error("[billing/outstanding] toss requestPayment error", error);
      toast.error("토스 결제창 호출 중 오류가 발생했습니다.");
    }
  };

  const validateAmount = (bill: BillSummary, amount: number) => {
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("정산 금액을 올바르게 입력하세요.");
      return false;
    }

    if (amount > bill.remainingAmount) {
      toast.error("미수금 금액보다 크게 입력할 수 없습니다.");
      return false;
    }

    return true;
  };

  const parseAmountInput = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, "");
    if (sanitized === "") return 0;
    return Number(sanitized);
  };

  const isPartialAmountValid = (bill: BillSummary) => {
    const amount = parseAmountInput(amountByBillId[bill.billId] ?? "");
    return amount > 0 && amount <= bill.remainingAmount;
  };

  const handleDirectSettlement = async (
    bill: BillSummary,
    amount: number,
    method: PaymentMethod
  ) => {
    if (!validateAmount(bill, amount)) return;

    if (processingBillId != null) {
      toast.error("현재 다른 정산을 처리 중입니다.");
      return;
    }

    if (!sessionUser?.userId) {
      toast.error("결제 처리 계정 정보를 확인할 수 없습니다.");
      return;
    }

    setProcessingBillId(bill.billId);

    try {
      if (method === "CARD") {
        await requestTossCardPayment(bill, amount);
        return;
      }

<<<<<<< HEAD
      const staffId = resolveStaffId();

      if (!staffId) {
        toast.error("직원 ID를 확인할 수 없습니다.");
        return;
      }

      await createPaymentApi(bill.billId, amount, method, staffId);
=======
      await createPaymentApi(bill.billId, amount, method, sessionUser.userId);
>>>>>>> develop
      toast.success("미수금 정산이 완료되었습니다.");
      refreshOutstanding();
    } catch (err: any) {
      toast.error(err?.message || "미수금 정산에 실패했습니다.");
    } finally {
      setProcessingBillId(null);
    }
  };

  const handleFullSettlement = async (bill: BillSummary) => {
    const method = methodByBillId[bill.billId] ?? "CASH";
    await handleDirectSettlement(bill, bill.remainingAmount, method);
  };

  const handlePartialSettlement = async (bill: BillSummary) => {
    const amount = parseAmountInput(amountByBillId[bill.billId] ?? "0");
    const method = methodByBillId[bill.billId] ?? "CASH";
    await handleDirectSettlement(bill, amount, method);
  };

  const isRowProcessing = useCallback(
    (billId: number) => processingBillId === billId,
    [processingBillId]
  );

  return (
    <MainLayout>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
      />

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
            미수금 목록
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
            미수금 정산 안내
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            미수금 목록에서 바로 전액 정산 또는 부분 정산을 진행할 수 있습니다.
            카드 결제는 토스 결제창으로 연결되며, 현금/계좌이체는 즉시 정산됩니다.
            상세 확인이 필요한 경우 청구번호 링크 또는 우측 상세 보기 버튼을 사용하세요.
          </Typography>
        </Paper>

        {loading && <Typography>로딩 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>청구번호</TableCell>
                <TableCell>환자명</TableCell>
                <TableCell>환자ID</TableCell>
                <TableCell>진료일</TableCell>
                <TableCell>총 금액</TableCell>
                <TableCell>미수금 금액</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="center">정산 처리</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedBillingList.map((bill) => (
                <TableRow key={bill.billId}>
                  <TableCell>
                    <Link
                      href={`/billing/${bill.billId}?returnTo=${encodeURIComponent(
                        "/billing/outstanding"
                      )}`}
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {bill.billingNo ?? bill.billId}
                    </Link>
                  </TableCell>

                  <TableCell>{resolvePatientName(bill.patientId)}</TableCell>
                  <TableCell>{bill.patientId}</TableCell>
                  <TableCell>{bill.treatmentDate}</TableCell>
                  <TableCell>{bill.totalAmount.toLocaleString()} 원</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, color: "#d32f2f" }}>
                      {bill.remainingAmount.toLocaleString()} 원
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getBillingStatusLabel(
                        bill.status,
                        bill.remainingAmount
                      )}
                      color={
                        getBillingStatusColor(
                          bill.status,
                          bill.remainingAmount
                        ) as any
                      }
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 1,
                        minWidth: 360,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={1}
                        alignItems={{ xs: "stretch", md: "center" }}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <TextField
                          size="small"
                          label="부분 정산 금액"
                          value={amountByBillId[bill.billId] ?? String(bill.remainingAmount)}
                          onChange={(e) => {
                            setAmountByBillId((prev) => ({
                              ...prev,
                              [bill.billId]: e.target.value.replace(/[^\d]/g, ""),
                            }));
                          }}
                          inputProps={{ inputMode: "numeric" }}
                          helperText={`최대 ${bill.remainingAmount.toLocaleString()}원`}
                          error={
                            (amountByBillId[bill.billId] ?? "").trim() !== "" &&
                            !isPartialAmountValid(bill)
                          }
                          sx={{ minWidth: 130 }}
                        />

                        <TextField
                          select
                          size="small"
                          label="결제 수단"
                          value={methodByBillId[bill.billId] ?? "CASH"}
                          onChange={(e) => {
                            setMethodByBillId((prev) => ({
                              ...prev,
                              [bill.billId]: e.target.value as PaymentMethod,
                            }));
                          }}
                          sx={{ minWidth: 120 }}
                        >
                          {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>

                        <Button
                          variant="outlined"
                          size="small"
                          disabled={
                            isRowProcessing(bill.billId) || !isPartialAmountValid(bill)
                          }
                          onClick={() => handlePartialSettlement(bill)}
                        >
                          부분 정산
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          disabled={
                            isRowProcessing(bill.billId) || bill.remainingAmount <= 0
                          }
                          onClick={() => handleFullSettlement(bill)}
                        >
                          전액 정산
                        </Button>
                      </Stack>

                      <Button
                        component={Link}
                        href={`/billing/${bill.billId}?returnTo=${encodeURIComponent(
                          "/billing/outstanding"
                        )}`}
                        variant="text"
                        size="small"
                        sx={{ px: 0.5 }}
                      >
                        상세 보기
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {sortedBillingList.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    미수금 데이터가 없습니다
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
