"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import toast from "react-hot-toast";
import Script from "next/script";
import MainLayout from "@/components/layout/MainLayout";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";

declare global {
  interface Window {
    TossPayments?: any;
  }
}

import {
  fetchBillingDetailRequest,
  fetchBillHistoryRequest,
  fetchPaymentsByBillRequest,
  createPaymentRequest,
  confirmBillRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
} from "@/features/billing/billingSlice";

import type { PaymentMethod } from "@/lib/billing/billingApi";
import {
  getDisplayBillingStatusLabel,
  getDisplayBillingStatusColor,
} from "@/lib/billing/billingStatus";

/* MUI UI */
import {
  Chip,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

/* 결제 상태 색상 */
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "REFUNDED":
      return "warning";
    case "CANCELED":
      return "error";
    default:
      return "default";
  }
};

/* 결제 상태 라벨 */
const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "결제 완료";
    case "REFUNDED":
      return "부분 환불";
    case "CANCELED":
      return "수납 취소";
    default:
      return status;
  }
};

/* 결제 상태별 금액 라벨 */
const getPaymentAmountLabel = (status: string) => {
  switch (status) {
    case "REFUNDED":
      return "환불 금액";
    case "CANCELED":
      return "취소 금액";
    default:
      return "결제 금액";
  }
};

/* 결제 상태별 설명 */
const getPaymentStatusDescription = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "정상 결제된 이력입니다.";
    case "REFUNDED":
      return "부분 환불이 반영된 이력입니다.";
    case "CANCELED":
      return "전체 취소된 결제 이력입니다.";
    default:
      return "";
  }
};

/* 결제 수단 라벨 */
const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case "CASH":
      return "현금";
    case "CARD":
      return "카드";
    case "TRANSFER":
      return "계좌이체";
    default:
      return method;
  }
};

/* 청구 이력 상태 색상 */
const getBillHistoryColor = (historyType: string) => {
  switch (historyType) {
    case "BILL_CREATED":
      return "default";
    case "PAYMENT_COMPLETED":
      return "success";
    case "PAYMENT_REFUNDED":
      return "warning";
    case "PAYMENT_CANCELED":
      return "error";
    default:
      return "default";
  }
};

/* 입력값 보정 */
const normalizeAmount = (value: number, remaining: number): number => {
  if (value < 0) return 0;
  if (value > remaining) return remaining;
  return value;
};

const formatNumber = (value: number) => {
  return value.toLocaleString();
};

const unformatNumber = (value: string) => {
  return Number(value.replace(/,/g, ""));
};

/* 숫자 입력 정리 */
const sanitizeNumberInput = (value: string) => {
  return value.replace(/[^\d]/g, "");
};

/* 스타일 */
const inputStyle: React.CSSProperties = {
  padding: "8px",
  marginRight: "8px",
  width: "160px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  backgroundColor: "#ffffff",
};

const paymentCardStyle: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  marginBottom: "8px",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

/* 결제 상태별 카드 스타일 */
const getPaymentCardStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case "REFUNDED":
      return {
        ...paymentCardStyle,
        border: "1px solid #f3c86a",
        backgroundColor: "#fffaf0",
      };
    case "CANCELED":
      return {
        ...paymentCardStyle,
        border: "1px solid #ef9a9a",
        backgroundColor: "#fff5f5",
      };
    default:
      return paymentCardStyle;
  }
};

// 결제수단 라디오 영역 스타일
const methodBoxStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  alignItems: "center",
  marginTop: "12px",
  marginBottom: "12px",
  backgroundColor: "#ffffff",
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

export default function BillingDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams<{ billId: string }>();
  const billId = Number(params.billId);

  const { billingDetail, billHistory, payments, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [refundTargetId, setRefundTargetId] = useState<number | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState<string>("");

  /**
   * 추가:
   * patientId -> patientName 매핑용 상태
   */
  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );

  /**
   * 추가:
   * 수납 취소 모달 상태
   */
  const [cancelTargetPayment, setCancelTargetPayment] = useState<{
    paymentId: number;
    paymentAmount: number;
    method: string;
  } | null>(null);

  /**
   * 추가:
   * 취소 사유 / 확인 문구 입력 상태
   */
  const [cancelReasonInput, setCancelReasonInput] = useState<string>("");
  const [cancelConfirmText, setCancelConfirmText] = useState<string>("");

  /**
   * 추가:
   * 체크박스 / 카운트다운 상태
   */
  const [cancelAcknowledgeChecked, setCancelAcknowledgeChecked] =
    useState<boolean>(false);
  const [cancelCountdown, setCancelCountdown] = useState<number>(3);

  useEffect(() => {
    if (billId) {
      dispatch(fetchBillingDetailRequest(billId));
      dispatch(fetchBillHistoryRequest(billId));
      dispatch(fetchPaymentsByBillRequest(billId));
    }
  }, [billId, dispatch]);

  /**
   * 추가:
   * 환자 목록 전체 조회 후 patientId -> name 매핑 생성
   */
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
        console.error("[billing/detail] failed to load patients", err);

        if (!active) return;
        setPatientNameById({});
      }
    };

    loadPatients();

    return () => {
      active = false;
    };
  }, []);

  /**
   * 추가:
   * patientId로 환자 이름 찾기
   */
  const resolvePatientName = useCallback(
    (patientId: number) => {
      return patientNameById[patientId] || "-";
    },
    [patientNameById]
  );

  const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  const createOrderId = (billId: number) => {
    return `bill-${billId}-${Date.now()}`;
  };

  const requestTossCardPayment = async (amount: number) => {
    if (!billingDetail) return;

    if (!tossClientKey) {
      toast.error("토스 클라이언트 키가 없습니다.");
      return;
    }

    if (!window.TossPayments) {
      toast.error("토스 SDK가 아직 로드되지 않았습니다.");
      return;
    }

    const orderId = createOrderId(billingDetail.billId);

    sessionStorage.setItem(
      "tossPaymentContext",
      JSON.stringify({
        billId: billingDetail.billId,
        patientId: billingDetail.patientId,
        requestedAmount: amount,
        orderId,
      })
    );

    try {
      const tossPayments = window.TossPayments(tossClientKey);
      const payment = tossPayments.payment({
        customerKey: `patient-${billingDetail.patientId}`,
      });

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: amount,
        },
        orderId,
        orderName: `진료비 수납 - bill ${billingDetail.billId}`,
        successUrl: `${window.location.origin}/billing/toss/success`,
        failUrl: `${window.location.origin}/billing/toss/fail`,
      });
    } catch (error) {
      console.error("[toss] requestPayment error", error);
      toast.error("토스 결제창 호출 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    setPayAmount(0);
    setPaymentMethod("CASH");
    setRefundTargetId(null);
    setRefundAmountInput("");
    setCancelTargetPayment(null);
    setCancelReasonInput("");
    setCancelConfirmText("");
    setCancelAcknowledgeChecked(false);
    setCancelCountdown(3);
  }, [billingDetail]);

  /**
   * 추가:
   * 취소 모달이 열리면 3초 카운트다운 시작
   */
  useEffect(() => {
    if (!cancelTargetPayment) {
      setCancelCountdown(3);
      return;
    }

    setCancelCountdown(3);

    const timer = setInterval(() => {
      setCancelCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cancelTargetPayment]);

  const handlePayment = () => {
    if (!billingDetail) return;

    if (payAmount <= 0) {
      toast.error("결제 금액을 입력하세요.");
      return;
    }

    if (payAmount > billingDetail.remainingAmount) {
      toast.error("남은 금액보다 클 수 없습니다.");
      return;
    }

    if (paymentMethod === "CARD") {
      requestTossCardPayment(payAmount);
      return;
    }

    dispatch(
      createPaymentRequest({
        billId: billingDetail.billId,
        amount: payAmount,
        patientId: billingDetail.patientId,
        method: paymentMethod,
      })
    );
  };

  const handleCancelPayment = (
    paymentId: number,
    paymentAmount: number,
    method: string
  ) => {
    setCancelReasonInput("");
    setCancelConfirmText("");
    setCancelAcknowledgeChecked(false);
    setCancelCountdown(3);

    setCancelTargetPayment({
      paymentId,
      paymentAmount,
      method,
    });
  };

  const handleCloseCancelDialog = () => {
    if (loading) return;
    setCancelTargetPayment(null);
    setCancelReasonInput("");
    setCancelConfirmText("");
    setCancelAcknowledgeChecked(false);
    setCancelCountdown(3);
  };

  const handleConfirmCancelPayment = () => {
    if (!billingDetail || !cancelTargetPayment) return;

    if (cancelReasonInput.trim() === "") {
      toast.error("취소 사유를 입력하세요.");
      return;
    }

    if (cancelConfirmText.trim() !== "취소") {
      toast.error("'취소' 문구를 정확히 입력해야 합니다.");
      return;
    }

    if (!cancelAcknowledgeChecked) {
      toast.error("안내 사항 확인 체크가 필요합니다.");
      return;
    }

    if (cancelCountdown > 0) {
      toast.error("잠시 후 다시 시도해주세요.");
      return;
    }

    dispatch(
      cancelPaymentRequest({
        paymentId: cancelTargetPayment.paymentId,
        billId: billingDetail.billId,
        patientId: billingDetail.patientId,
      })
    );

    setCancelTargetPayment(null);
    setCancelReasonInput("");
    setCancelConfirmText("");
    setCancelAcknowledgeChecked(false);
    setCancelCountdown(3);
  };

  const handleFullPayment = () => {
    if (!billingDetail) return;

    if (billingDetail.remainingAmount <= 0) {
      toast.error("이미 전액 수납 완료되었습니다.");
      return;
    }

    if (paymentMethod === "CARD") {
      requestTossCardPayment(billingDetail.remainingAmount);
      return;
    }

    dispatch(
      createPaymentRequest({
        billId: billingDetail.billId,
        amount: billingDetail.remainingAmount,
        patientId: billingDetail.patientId,
        method: paymentMethod,
      })
    );
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  );

  const sortedBillHistory = [...billHistory].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  const completedCount = sortedPayments.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  const canceledCount = sortedPayments.filter(
    (p) => p.status === "CANCELED"
  ).length;

  const refundedCount = sortedPayments.filter(
    (p) => p.status === "REFUNDED"
  ).length;

  const hasRefundHistory = sortedPayments.some(
    (p) => p.status === "REFUNDED"
  );

  const billItemsTotal =
    billingDetail?.billItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  const isCancelConfirmEnabled =
    !!cancelTargetPayment &&
    cancelReasonInput.trim() !== "" &&
    cancelConfirmText.trim() === "취소" &&
    cancelAcknowledgeChecked &&
    cancelCountdown === 0 &&
    !loading;

  return (
    <MainLayout>
      <main
        style={{
          padding: "24px",
          backgroundColor: "#f4f6f8",
          minHeight: "100vh",
        }}
      >
        <Script
          src="https://js.tosspayments.com/v2/standard"
          strategy="afterInteractive"
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 1 }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.back()}
            sx={{ borderRadius: 2 }}
          >
            뒤로 가기
          </Button>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            청구 상세
          </Typography>
        </Stack>

        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {billingDetail && (
          <Card
            sx={{
              mt: 3,
              mb: 3,
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    총 금액
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 24 }}>
                    {billingDetail.totalAmount.toLocaleString()} 원
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    결제 금액
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: 24, color: "#1976d2" }}
                  >
                    {billingDetail.paidAmount.toLocaleString()} 원
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    남은 금액
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: 24, color: "#d32f2f" }}
                  >
                    {billingDetail.remainingAmount.toLocaleString()} 원
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    현재 상태
                  </Typography>
                  <Chip
                    label={getDisplayBillingStatusLabel(
                      billingDetail.paidAmount,
                      billingDetail.remainingAmount,
                      billingDetail.status
                    )}
                    color={
                      getDisplayBillingStatusColor(
                        billingDetail.paidAmount,
                        billingDetail.remainingAmount,
                        billingDetail.status
                      ) as any
                    }
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {billingDetail && (
          <section style={{ marginTop: "24px" }}>
            <Card
              sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">청구 요약</Typography>

                  <Button
                    component={Link}
                    href={`/billing/${billingDetail.billId}/statement`}
                    variant="outlined"
                    size="small"
                  >
                    청구서 조회
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  <Typography>청구 ID: {billingDetail.billId}</Typography>

                  <Typography>
                    환자명: {resolvePatientName(billingDetail.patientId)}
                  </Typography>

                  <Typography>환자 ID: {billingDetail.patientId}</Typography>

                  <Typography>
                    총 금액: {billingDetail.totalAmount.toLocaleString()} 원
                  </Typography>

                  <Typography>
                    결제 금액: {billingDetail.paidAmount.toLocaleString()} 원
                  </Typography>

                  <Typography>
                    남은 금액:
                    <span
                      style={{
                        color:
                          billingDetail.remainingAmount > 0
                            ? "#d32f2f"
                            : "#2e7d32",
                        fontWeight: "bold",
                        marginLeft: "6px",
                      }}
                    >
                      {billingDetail.remainingAmount.toLocaleString()} 원
                    </span>
                  </Typography>

                  <Typography component="div">
                    상태:
                    <Chip
                      label={getDisplayBillingStatusLabel(
                        billingDetail.paidAmount,
                        billingDetail.remainingAmount,
                        billingDetail.status
                      )}
                      color={
                        getDisplayBillingStatusColor(
                          billingDetail.paidAmount,
                          billingDetail.remainingAmount,
                          billingDetail.status
                        ) as any
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Stack>

                {billingDetail.remainingAmount === 0 &&
                  billingDetail.status !== "CONFIRMED" &&
                  billingDetail.status !== "CANCELED" && (
                    <div style={{ marginTop: "12px" }}>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() =>
                          dispatch(confirmBillRequest(billingDetail.billId))
                        }
                        disabled={loading}
                      >
                        {loading ? "처리 중..." : "청구 확정"}
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card
              sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h6">청구 항목</Typography>
                    <Typography
                      sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}
                    >
                      현재 청구에 포함된 항목별 금액입니다.
                    </Typography>
                  </Box>

                  <Box sx={{ mt: { xs: 1, md: 0 } }}>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      항목 합계
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                      {billItemsTotal.toLocaleString()} 원
                    </Typography>
                  </Box>
                </Stack>

                {billingDetail.billItems.length === 0 ? (
                  <Typography sx={{ color: "text.secondary" }}>
                    등록된 청구 항목이 없습니다.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {billingDetail.billItems.map((item, index) => (
                      <Box key={item.billItemId}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", md: "center" }}
                          spacing={1}
                          sx={{ py: 1 }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              {item.itemName}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: "text.secondary",
                                mt: 0.5,
                              }}
                            >
                              항목 ID: {item.billItemId}
                            </Typography>
                          </Box>

                          <Typography sx={{ fontWeight: 700 }}>
                            {item.amount.toLocaleString()} 원
                          </Typography>
                        </Stack>

                        {index !== billingDetail.billItems.length - 1 && (
                          <Divider />
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Card
              sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h6">청구 이력</Typography>
                    <Typography
                      sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}
                    >
                      청구 생성, 수납, 취소, 환불 이력을 시간순으로 확인할 수 있습니다.
                    </Typography>
                  </Box>

                  <Box sx={{ mt: { xs: 1, md: 0 } }}>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      이력 건수
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                      {sortedBillHistory.length} 건
                    </Typography>
                  </Box>
                </Stack>

                {sortedBillHistory.length === 0 ? (
                  <Typography sx={{ color: "text.secondary" }}>
                    표시할 청구 이력이 없습니다.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {sortedBillHistory.map((history, index) => (
                      <Box
                        key={`${history.historyType}-${history.occurredAt}-${index}`}
                      >
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", md: "center" }}
                          spacing={1}
                          sx={{ py: 1 }}
                        >
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ mb: 0.5 }}
                            >
                              <Typography sx={{ fontWeight: 600 }}>
                                {history.title}
                              </Typography>

                              <Chip
                                label={history.historyType}
                                color={getBillHistoryColor(history.historyType) as any}
                                size="small"
                              />
                            </Stack>

                            <Typography
                              sx={{
                                fontSize: 13,
                                color: "text.secondary",
                                mt: 0.5,
                              }}
                            >
                              {history.description}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 12,
                                color: "text.secondary",
                                mt: 0.5,
                              }}
                            >
                              처리 일시: {formatDateTime(history.occurredAt)}
                            </Typography>
                          </Box>

                          <Typography sx={{ fontWeight: 700 }}>
                            {history.amount.toLocaleString()} 원
                          </Typography>
                        </Stack>

                        {index !== sortedBillHistory.length - 1 && (
                          <Divider />
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {billingDetail.remainingAmount > 0 && (
              <Card
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: 1,
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    수납 처리
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}
                  >
                    결제 금액 입력 후 전액 또는 부분 수납을 진행할 수 있습니다.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {billingDetail.remainingAmount > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <input
                  type="text"
                  value={payAmount === 0 ? "" : formatNumber(payAmount)}
                  onChange={(e) => {
                    const raw = unformatNumber(e.target.value);
                    if (isNaN(raw)) return;

                    setPayAmount(
                      normalizeAmount(raw, billingDetail.remainingAmount)
                    );
                  }}
                  placeholder="결제 금액 입력"
                  style={inputStyle}
                />

                <div style={methodBoxStyle}>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={paymentMethod === "CASH"}
                      onChange={() => setPaymentMethod("CASH")}
                    />{" "}
                    현금
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === "CARD"}
                      onChange={() => setPaymentMethod("CARD")}
                    />{" "}
                    카드
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="TRANSFER"
                      checked={paymentMethod === "TRANSFER"}
                      onChange={() => setPaymentMethod("TRANSFER")}
                    />{" "}
                    계좌이체
                  </label>
                </div>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleFullPayment}
                    disabled={loading}
                  >
                    전액 수납
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={handlePayment}
                    disabled={
                      loading ||
                      payAmount <= 0 ||
                      payAmount > billingDetail.remainingAmount
                    }
                  >
                    {loading ? "처리 중..." : "부분 수납"}
                  </Button>
                </Stack>
              </div>
            )}

            <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
              수납 내역
            </Typography>

            <Card
              sx={{
                mb: 2,
                borderRadius: 3,
                boxShadow: 1,
                backgroundColor: "#ffffff",
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      현재 유효 결제 금액
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {billingDetail.paidAmount.toLocaleString()}원
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      현재 잔액
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#d32f2f" }}>
                      {billingDetail.remainingAmount.toLocaleString()}원
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      총 결제 건수
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {completedCount}건
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      총 취소 건수
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {canceledCount}건
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      총 환불 건수
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {refundedCount}건
                    </Typography>
                  </Box>
                </Stack>

                {hasRefundHistory && (
                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: 13,
                      color: "#b26a00",
                      fontWeight: 600,
                    }}
                  >
                    부분 환불 이력이 있는 청구는 전체 수납 취소가 불가합니다.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {sortedPayments.map((p) => {
              const parsedRefundAmount =
                refundAmountInput.trim() === ""
                  ? 0
                  : unformatNumber(refundAmountInput);

              const isCancelDisabled =
                loading || hasRefundHistory || p.status !== "COMPLETED";

              const canShowReceiptButton =
                p.status === "COMPLETED" || p.status === "REFUNDED";

              return (
                <div key={p.paymentId} style={getPaymentCardStyle(p.status)}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle2">
                      거래 ID: {p.paymentId}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {canShowReceiptButton && (
                        <Button
                          component={Link}
                          href={`/billing/${billingDetail.billId}/receipt/${p.paymentId}`}
                          variant="outlined"
                          size="small"
                        >
                          영수증 조회
                        </Button>
                      )}

                      <Chip
                        label={getPaymentStatusLabel(p.status)}
                        color={getPaymentStatusColor(p.status) as any}
                        size="small"
                      />
                    </Stack>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography>
                      {getPaymentAmountLabel(p.status)}:
                      <strong style={{ marginLeft: "6px" }}>
                        {p.paymentAmount.toLocaleString()}원
                      </strong>
                    </Typography>

                    <Typography>
                      결제 수단: {getPaymentMethodLabel(p.method)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      처리 일시: {formatDateTime(p.paidAt)}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        color:
                          p.status === "REFUNDED"
                            ? "#b26a00"
                            : p.status === "CANCELED"
                            ? "#c62828"
                            : "#2e7d32",
                        fontWeight: 600,
                      }}
                    >
                      {getPaymentStatusDescription(p.status)}
                    </Typography>
                  </Stack>

                  {p.status === "COMPLETED" && (
                    <>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() =>
                            handleCancelPayment(
                              p.paymentId,
                              p.paymentAmount,
                              p.method
                            )
                          }
                          disabled={isCancelDisabled}
                        >
                          수납 취소
                        </Button>

                        <Button
                          variant="contained"
                          color="info"
                          size="small"
                          onClick={() => {
                            setRefundTargetId(p.paymentId);
                            setRefundAmountInput("");
                          }}
                          disabled={loading}
                        >
                          부분 환불
                        </Button>
                      </Stack>

                      {hasRefundHistory && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1,
                            color: "#c62828",
                            fontWeight: 500,
                          }}
                        >
                          같은 청구에 부분 환불 이력이 있어 전체 수납 취소는 비활성화됩니다.
                        </Typography>
                      )}

                      {refundTargetId === p.paymentId && (
                        <div style={{ marginTop: "8px" }}>
                          <input
                            type="text"
                            value={refundAmountInput}
                            onChange={(e) => {
                              const onlyNumber = sanitizeNumberInput(
                                e.target.value
                              );

                              if (onlyNumber === "") {
                                setRefundAmountInput("");
                                return;
                              }

                              const normalizedValue = normalizeAmount(
                                Number(onlyNumber),
                                p.paymentAmount
                              );

                              setRefundAmountInput(
                                formatNumber(normalizedValue)
                              );
                            }}
                            placeholder={`최대 ${formatNumber(
                              p.paymentAmount
                            )}원`}
                            style={inputStyle}
                          />

                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1, mb: 1 }}
                            onClick={() =>
                              setRefundAmountInput(
                                formatNumber(p.paymentAmount)
                              )
                            }
                          >
                            최대 금액 입력
                          </Button>

                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => {
                                if (parsedRefundAmount <= 0) {
                                  toast.error("환불 금액을 입력하세요.");
                                  return;
                                }

                                dispatch(
                                  refundPaymentRequest({
                                    paymentId: p.paymentId,
                                    amount: parsedRefundAmount,
                                    billId: billingDetail.billId,
                                    patientId: billingDetail.patientId,
                                  })
                                );

                                setRefundTargetId(null);
                                setRefundAmountInput("");
                              }}
                              disabled={loading || parsedRefundAmount <= 0}
                            >
                              환불 실행
                            </Button>

                            <Button
                              variant="outlined"
                              color="inherit"
                              size="small"
                              onClick={() => {
                                setRefundTargetId(null);
                                setRefundAmountInput("");
                              }}
                            >
                              입력 취소
                            </Button>
                          </Stack>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </section>
        )}

        <Dialog
          open={!!cancelTargetPayment}
          onClose={handleCloseCancelDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>수납 취소 확인</DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  취소 대상 결제 수단
                </Typography>
                <Typography sx={{ fontWeight: 700, mt: 0.5 }}>
                  {cancelTargetPayment
                    ? getPaymentMethodLabel(cancelTargetPayment.method)
                    : "-"}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#fff7ed",
                  border: "1px solid #fdba74",
                }}
              >
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  취소 예정 금액
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 24,
                    color: "#c2410c",
                    mt: 0.5,
                  }}
                >
                  {cancelTargetPayment
                    ? `${cancelTargetPayment.paymentAmount.toLocaleString()}원`
                    : "-"}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                <Typography sx={{ fontWeight: 700, color: "#b91c1c", mb: 1 }}>
                  취소 전 안내
                </Typography>

                <Typography sx={{ fontSize: 14, color: "#7f1d1d" }}>
                  카드 결제는 내부 상태만 변경되는 것이 아니라 토스 취소 API를 통해
                  실제 카드 취소가 함께 진행됩니다.
                </Typography>

                <Typography sx={{ fontSize: 14, color: "#7f1d1d", mt: 1 }}>
                  취소 완료 후에는 수납 상태, 남은 금액, 결제 이력이 함께
                  갱신됩니다.
                </Typography>
              </Box>

              <TextField
                label="취소 사유"
                placeholder="예: 사용자 요청, 입력 실수, 카드 변경 등"
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />

              <TextField
                label="확인 문구 입력"
                placeholder="취소"
                value={cancelConfirmText}
                onChange={(e) => setCancelConfirmText(e.target.value)}
                fullWidth
                helperText="수납 취소를 진행하려면 '취소'를 정확히 입력하세요."
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={cancelAcknowledgeChecked}
                    onChange={(e) =>
                      setCancelAcknowledgeChecked(e.target.checked)
                    }
                  />
                }
                label="안내 사항을 확인했으며, 실제 카드 취소가 진행된다는 점에 동의합니다."
              />

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: cancelCountdown > 0 ? "#eff6ff" : "#f0fdf4",
                  border:
                    cancelCountdown > 0
                      ? "1px solid #93c5fd"
                      : "1px solid #86efac",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: cancelCountdown > 0 ? "#1d4ed8" : "#166534",
                  }}
                >
                  {cancelCountdown > 0
                    ? `안전 확인 중... ${cancelCountdown}초 후 취소 진행이 가능합니다.`
                    : "취소 진행 버튼을 누를 수 있습니다."}
                </Typography>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCloseCancelDialog}
              disabled={loading}
            >
              닫기
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmCancelPayment}
              disabled={!isCancelConfirmEnabled}
            >
              {loading ? "취소 처리 중..." : "취소 진행"}
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </MainLayout>
  );
}