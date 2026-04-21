"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import toast from "react-hot-toast";
import Script from "next/script";
import { getSessionUser } from "@/lib/auth/session";
import MainLayout from "@/components/layout/MainLayout";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import InsurancePanel, {
  type InsuranceCalculationSummary,
} from "@/components/billing/detail/InsurancePanel";

declare global {
  interface Window {
    TossPayments?: any;
  }
}

import {
  fetchBillingDetailRequest,
  fetchCalculatedBillRequest,
  fetchBillHistoryRequest,
  fetchPaymentsByBillRequest,
  createPaymentRequest,
  confirmBillRequest,
  unconfirmBillRequest,
  cancelBillRequest,
  restoreBillRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
} from "@/features/billing/billingSlice";

import {
  fetchPaymentMethodsApi,
  type PaymentMethod,
  type PaymentMethodMaster,
} from "@/lib/billing/billingApi";
import {
  getDisplayBillingStatusLabel,
  getDisplayBillingStatusColor,
} from "@/lib/billing/billingStatus";

/* MUI UI */
import {
  Alert,
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

/* 청구 항목 분류 라벨 */
const getBillItemCategoryLabel = (category?: string) => {
  switch (category) {
    case "CONSULTATION":
      return "진찰료";
    case "MEDICATION":
      return "약제비";
    case "TEST":
      return "검사료";
    case "PROCEDURE":
      return "처치료";
    default:
      return "기타";
  }
};

/* 청구 항목 분류 순서 */
const getBillItemCategoryOrder = (category?: string) => {
  switch (category) {
    case "CONSULTATION":
      return 1;
    case "MEDICATION":
      return 2;
    case "TEST":
      return 3;
    case "PROCEDURE":
      return 4;
    default:
      return 99;
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

type PaymentMethodFilter = "ALL" | PaymentMethod;

export default function BillingDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ billId: string }>();
  const billId = Number(params.billId);

  const returnTo = searchParams.get("returnTo");

  const billingDetail = useSelector(
    (state: RootState) => state.billing.billingDetail
  );
  const calculatedBill = useSelector(
    (state: RootState) => state.billing.calculatedBill
  );
  const billHistory = useSelector(
    (state: RootState) => state.billing.billHistory
  );
  const payments = useSelector((state: RootState) => state.billing.payments);
  const loading = useSelector((state: RootState) => state.billing.loading);
  const error = useSelector((state: RootState) => state.billing.error);

  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodMaster[]>([]);
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState<PaymentMethodFilter>("ALL");
  const [refundTargetId, setRefundTargetId] = useState<number | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState<string>("");

  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );
  const [insuranceSummary, setInsuranceSummary] =
    useState<InsuranceCalculationSummary | null>(null);

  const [cancelTargetPayment, setCancelTargetPayment] = useState<{
    paymentId: number;
    paymentAmount: number;
    method: string;
  } | null>(null);

  const [cancelReasonInput, setCancelReasonInput] = useState<string>("");
  const [cancelConfirmText, setCancelConfirmText] = useState<string>("");

  const [cancelAcknowledgeChecked, setCancelAcknowledgeChecked] =
    useState<boolean>(false);
  const [cancelCountdown, setCancelCountdown] = useState<number>(3);

  const [openBillCancelDialog, setOpenBillCancelDialog] = useState<boolean>(false);
  const [openBillUnconfirmDialog, setOpenBillUnconfirmDialog] = useState<boolean>(false);
  const [openBillRestoreDialog, setOpenBillRestoreDialog] = useState<boolean>(false);

  const detailBackHref = useMemo(() => {
    return returnTo || "/billing/list";
  }, [returnTo]);

  const detailSelfHref = useMemo(() => {
    return returnTo
      ? `/billing/${billId}?returnTo=${encodeURIComponent(returnTo)}`
      : `/billing/${billId}`;
  }, [billId, returnTo]);

  useEffect(() => {
    if (billId) {
      dispatch(fetchBillingDetailRequest(billId));
      dispatch(fetchCalculatedBillRequest(billId));
      dispatch(fetchBillHistoryRequest(billId));
      dispatch(fetchPaymentsByBillRequest(billId));
    }
  }, [billId, dispatch]);

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

    const loadPaymentMethods = async () => {
      try {
        const methods = await fetchPaymentMethodsApi();

        if (!active) return;

        setPaymentMethods(methods);

        if (methods.length > 0) {
          setPaymentMethod(methods[0].methodCode);
        }
      } catch (err) {
        console.error("[billing/detail] failed to load payment methods", err);

        if (!active) return;
        setPaymentMethods([]);
      }
    };

    loadPatients();
    loadPaymentMethods();

    return () => {
      active = false;
    };
  }, []);

  const resolvePatientName = useCallback(
    (patientId: number) => {
      return patientNameById[patientId] || "-";
    },
    [patientNameById]
  );

  const linkedDepositRegistered = billingDetail?.linkedDepositRegisteredAmount ?? 0;
  const preDepositPaidDisplay =
    billingDetail != null
      ? billingDetail.preDepositPaidAmount ??
        Math.max(0, billingDetail.paidAmount - linkedDepositRegistered)
      : 0;
  const preDepositRemainingDisplay =
    billingDetail != null
      ? billingDetail.preDepositRemainingAmount ??
        billingDetail.remainingAmount + linkedDepositRegistered
      : 0;

  const applyInsurancePatientBurdenAmount = useCallback(() => {
    if (!billingDetail || !insuranceSummary) return;

    const nextAmount = normalizeAmount(
      insuranceSummary.patientBurdenAmount,
      billingDetail.remainingAmount
    );

    setPayAmount(nextAmount);
  }, [billingDetail, insuranceSummary]);

  const isInsurancePatientBurdenApplicable = useMemo(() => {
    return (
      !!billingDetail &&
      !!insuranceSummary &&
      insuranceSummary.patientBurdenAmount > 0 &&
      billingDetail.remainingAmount > 0
    );
  }, [billingDetail, insuranceSummary]);

  const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  const createOrderId = (billId: number) => {
    return `bill-${billId}-${Date.now()}`;
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

    const staffId = resolveStaffId();
    if (!staffId) {
      toast.error("직원 ID를 확인할 수 없습니다.");
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
        staffId,
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
    setPaymentMethod((prev) => {
      if (paymentMethods.some((method) => method.methodCode === prev)) {
        return prev;
      }

      return paymentMethods.length > 0 ? paymentMethods[0].methodCode : "CASH";
    });
    setPaymentMethodFilter("ALL");
    setRefundTargetId(null);
    setRefundAmountInput("");
    setCancelTargetPayment(null);
    setCancelReasonInput("");
    setCancelConfirmText("");
    setCancelAcknowledgeChecked(false);
    setCancelCountdown(3);
    setOpenBillCancelDialog(false);
    setOpenBillUnconfirmDialog(false);
    setOpenBillRestoreDialog(false);
  }, [billingDetail, paymentMethods]);

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

  const hasCalculatedMismatch =
    !!billingDetail &&
    !!calculatedBill &&
    billingDetail.totalAmount !== calculatedBill.calculatedAmount;

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

    const staffId = resolveStaffId();
    if (!staffId) {
      toast.error("직원 ID를 확인할 수 없습니다.");
      return;
    }

    dispatch(
      createPaymentRequest({
        billId: billingDetail.billId,
        amount: payAmount,
        patientId: billingDetail.patientId,
        method: paymentMethod,
        staffId,
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

    const staffId = resolveStaffId();
    if (!staffId) {
      toast.error("직원 ID를 확인할 수 없습니다.");
      return;
    }

    dispatch(
      cancelPaymentRequest({
        paymentId: cancelTargetPayment.paymentId,
        billId: billingDetail.billId,
        patientId: billingDetail.patientId,
        staffId,
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

    const staffId = resolveStaffId();
    if (!staffId) {
      toast.error("직원 ID를 확인할 수 없습니다.");
      return;
    }

    dispatch(
      createPaymentRequest({
        billId: billingDetail.billId,
        amount: billingDetail.remainingAmount,
        patientId: billingDetail.patientId,
        method: paymentMethod,
        staffId,
      })
    );
  };

  const handleOpenBillUnconfirmDialog = () => {
    if (!billingDetail) return;
    setOpenBillUnconfirmDialog(true);
  };

  const handleConfirmBillUnconfirm = () => {
    if (!billingDetail) return;
    dispatch(unconfirmBillRequest({ billId: billingDetail.billId }));
    setOpenBillUnconfirmDialog(false);
  };

  const handleOpenBillCancelDialog = () => {
    if (!billingDetail) return;
    setOpenBillCancelDialog(true);
  };

  const handleConfirmBillCancel = () => {
    if (!billingDetail) return;

    dispatch(cancelBillRequest({ billId: billingDetail.billId }));
    setOpenBillCancelDialog(false);
  };

  const handleOpenBillRestoreDialog = () => {
    if (!billingDetail) return;
    setOpenBillRestoreDialog(true);
  };

  const handleConfirmBillRestore = () => {
    if (!billingDetail) return;

    dispatch(restoreBillRequest({ billId: billingDetail.billId }));
    setOpenBillRestoreDialog(false);
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

  const sortedPayments = useMemo(() => {
    return [...payments].sort(
      (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    );
  }, [payments]);

  const filteredPayments = useMemo(() => {
    if (paymentMethodFilter === "ALL") {
      return sortedPayments;
    }

    return sortedPayments.filter((payment) => payment.method === paymentMethodFilter);
  }, [sortedPayments, paymentMethodFilter]);

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

  const filteredCompletedCount = filteredPayments.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  const filteredCanceledCount = filteredPayments.filter(
    (p) => p.status === "CANCELED"
  ).length;

  const filteredRefundedCount = filteredPayments.filter(
    (p) => p.status === "REFUNDED"
  ).length;

  const allMethodCount = sortedPayments.length;
  const cashMethodCount = sortedPayments.filter((p) => p.method === "CASH").length;
  const cardMethodCount = sortedPayments.filter((p) => p.method === "CARD").length;
  const transferMethodCount = sortedPayments.filter(
    (p) => p.method === "TRANSFER"
  ).length;

  const billItemsTotal =
    billingDetail?.billItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  const groupedBillItems = useMemo(() => {
    if (!billingDetail?.billItems?.length) {
      return [];
    }

    const groupedMap = billingDetail.billItems.reduce<
      Record<
        string,
        {
          category: string;
          items: typeof billingDetail.billItems;
          totalAmount: number;
        }
      >
    >((acc, item) => {
      const category = item.itemCategory || "ETC";

      if (!acc[category]) {
        acc[category] = {
          category,
          items: [],
          totalAmount: 0,
        };
      }

      acc[category].items.push(item);
      acc[category].totalAmount += item.amount;

      return acc;
    }, {});

    return Object.values(groupedMap).sort(
      (a, b) =>
        getBillItemCategoryOrder(a.category) - getBillItemCategoryOrder(b.category)
    );
  }, [billingDetail]);

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
            onClick={() => router.push(detailBackHref)}
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
                  {linkedDepositRegistered > 0 && (
                    <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>
                      실결제 {preDepositPaidDisplay.toLocaleString()}원 + 연결 선수금{" "}
                      {linkedDepositRegistered.toLocaleString()}원
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    남은 금액
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 24,
                      color:
                        billingDetail.remainingAmount > 0 ? "#d32f2f" : "#2e7d32",
                    }}
                  >
                    {billingDetail.remainingAmount.toLocaleString()} 원
                  </Typography>
                  {linkedDepositRegistered > 0 && (
                    <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>
                      선수금 반영 전 잔액 {preDepositRemainingDisplay.toLocaleString()}원 ·{" "}
                      <Link
                        href={`/billing/deposits?billId=${billId}`}
                        style={{ color: "#1976d2" }}
                      >
                        선수금 등록
                      </Link>
                    </Typography>
                  )}
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
                    href={`/billing/${billingDetail.billId}/statement?returnTo=${encodeURIComponent(
                      detailSelfHref
                    )}`}
                    variant="outlined"
                    size="small"
                  >
                    청구서 조회
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  <Typography>
                    청구 번호: {billingDetail.billingNo ?? billingDetail.billId}
                  </Typography>

                  <Typography>
                    환자명: {resolvePatientName(billingDetail.patientId)}
                  </Typography>

                  <Typography>환자 ID: {billingDetail.patientId}</Typography>

                  <Typography>
                    총 금액: {billingDetail.totalAmount.toLocaleString()} 원
                  </Typography>

                  <Typography>
                    결제 금액: {billingDetail.paidAmount.toLocaleString()} 원
                    {linkedDepositRegistered > 0 && (
                      <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 6 }}>
                        (실결제 {preDepositPaidDisplay.toLocaleString()} + 선수금{" "}
                        {linkedDepositRegistered.toLocaleString()})
                      </span>
                    )}
                  </Typography>

                  <Typography>
                    남은 금액:
                    <span
                      style={{
                        color:
                          billingDetail.remainingAmount > 0 ? "#d32f2f" : "#2e7d32",
                        fontWeight: "bold",
                        marginLeft: "6px",
                      }}
                    >
                      {billingDetail.remainingAmount.toLocaleString()} 원
                    </span>
                    {linkedDepositRegistered > 0 && (
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: 13,
                          marginLeft: 8,
                          color: "#666",
                        }}
                      >
                        반영 전 {preDepositRemainingDisplay.toLocaleString()}원
                      </span>
                    )}
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

                  {insuranceSummary && (
                    <>
                      <Divider sx={{ my: 1 }} />

                      <Typography>
                        보험 종류: {insuranceSummary.insuranceType ?? "미적용"}
                      </Typography>

                      <Typography>
                        보험 보장 비율: {(insuranceSummary.coverageRate * 100).toFixed(0)}%
                      </Typography>

                      <Typography sx={{ color: "#1976d2", fontWeight: 700 }}>
                        보험 적용 예정 금액: {insuranceSummary.insuranceAppliedAmount.toLocaleString()} 원
                      </Typography>

                      <Typography sx={{ color: "#d32f2f", fontWeight: 700 }}>
                        예상 본인부담금: {insuranceSummary.patientBurdenAmount.toLocaleString()} 원
                      </Typography>

                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        {insuranceSummary.note}
                      </Typography>
                    </>
                  )}
                </Stack>

                {calculatedBill && (
                  <Card
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      backgroundColor: hasCalculatedMismatch ? "#fff7f7" : "#f8fbff",
                      border: hasCalculatedMismatch
                        ? "1px solid #f5c2c7"
                        : "1px solid #dbeafe",
                      boxShadow: "none",
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                        자동 계산 진료비
                      </Typography>

                      <Stack spacing={1}>
                        <Typography>
                          원금액:{" "}
                          <strong>
                            {calculatedBill.originalAmount.toLocaleString()} 원
                          </strong>
                        </Typography>

                        <Typography>
                          계산 금액:{" "}
                          <strong
                            style={{
                              color: hasCalculatedMismatch ? "#d32f2f" : "#1976d2",
                            }}
                          >
                            {calculatedBill.calculatedAmount.toLocaleString()} 원
                          </strong>
                        </Typography>

                        <Typography
                          sx={{ fontSize: 13, color: "text.secondary" }}
                        >
                          {calculatedBill.calculationNote}
                        </Typography>

                        {hasCalculatedMismatch && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            청구 총액과 자동 계산 금액이 일치하지 않습니다. 금액을 확인한 뒤 청구 확정을 진행하세요.
                          </Alert>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {billingDetail.remainingAmount === 0 &&
                  billingDetail.status !== "CONFIRMED" &&
                  billingDetail.status !== "CANCELED" && (
                    <div style={{ marginTop: "12px" }}>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() =>
                          dispatch(confirmBillRequest({ billId: billingDetail.billId }))
                        }
                        disabled={loading || hasCalculatedMismatch}
                      >
                        {loading ? "처리 중..." : "청구 확정"}
                      </Button>

                      {hasCalculatedMismatch && (
                        <Typography
                          sx={{
                            mt: 1,
                            fontSize: 13,
                            color: "#d32f2f",
                            fontWeight: 600,
                          }}
                        >
                          자동 계산 금액이 일치하지 않아 청구 확정을 진행할 수 없습니다.
                        </Typography>
                      )}
                    </div>
                  )}

                {billingDetail.status === "CONFIRMED" &&
                  billingDetail.remainingAmount === 0 && (
                    <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleOpenBillUnconfirmDialog}
                        disabled={loading || paymentMethods.length === 0}
                      >
                        {loading ? "처리 중..." : "확정 해제"}
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleOpenBillCancelDialog}
                        disabled={loading}
                      >
                        {loading ? "처리 중..." : "청구 취소"}
                      </Button>
                    </Stack>
                  )}

                {billingDetail.status === "CANCELED" &&
                  billingDetail.remainingAmount === 0 && (
                    <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleOpenBillRestoreDialog}
                        disabled={loading}
                      >
                        {loading ? "처리 중..." : "청구 복원"}
                      </Button>
                    </Stack>
                  )}
              </CardContent>
            </Card>

            <InsurancePanel
              billId={billId}
              patientId={billingDetail.patientId}
              originalAmount={billingDetail.totalAmount}
              calculatedAmount={
                calculatedBill?.calculatedAmount ?? billingDetail.totalAmount
              }
              onCalculationChange={setInsuranceSummary}
            />

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
                  <Stack spacing={2}>
                    {groupedBillItems.map((group) => (
                      <Card
                        key={group.category}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: "#e5e7eb",
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            spacing={1}
                            sx={{ mb: 1.5 }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 700 }}>
                                {getBillItemCategoryLabel(group.category)}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: "text.secondary",
                                  mt: 0.5,
                                }}
                              >
                                분류별 청구 항목입니다.
                              </Typography>
                            </Box>

                            <Typography sx={{ fontWeight: 700, color: "#1976d2" }}>
                              소계 {group.totalAmount.toLocaleString()} 원
                            </Typography>
                          </Stack>

                          <Stack spacing={1.5}>
                            {group.items.map((item, index) => (
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

                                    <Stack
                                      direction={{ xs: "column", sm: "row" }}
                                      spacing={{ xs: 0.5, sm: 1.5 }}
                                      sx={{
                                        mt: 0.5,
                                        fontSize: 12,
                                        color: "text.secondary",
                                      }}
                                    >
                                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                        항목 ID: {item.billItemId}
                                      </Typography>
                                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                        수량: {item.quantity.toLocaleString()}
                                      </Typography>
                                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                        단가: {item.unitPrice.toLocaleString()} 원
                                      </Typography>
                                    </Stack>
                                  </Box>

                                  <Typography sx={{ fontWeight: 700 }}>
                                    {item.amount.toLocaleString()} 원
                                  </Typography>
                                </Stack>

                                {index !== group.items.length - 1 && <Divider />}
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
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

                            {history.changedBy && (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: "text.secondary",
                                  mt: 0.5,
                                }}
                              >
                                처리 담당 직원: {history.changedByName
                                  ? `${history.changedByName} (${history.changedBy})`
                                  : history.changedBy}
                              </Typography>
                            )}
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
                    {linkedDepositRegistered > 0 &&
                      " 서버에 반영된 연결 선수금이 남은 금액에 포함되어 있습니다."}
                  </Typography>

                  {insuranceSummary && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      보험 계산 기준 예상 본인부담금은 {insuranceSummary.patientBurdenAmount.toLocaleString()}원입니다.
                      필요한 경우 아래 버튼으로 입력 금액에 바로 반영할 수 있습니다.
                    </Alert>
                  )}
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

                {insuranceSummary && (
                  <Box sx={{ mt: 1.5, mb: 1.5 }}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "flex-start", md: "center" }}
                    >
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        예상 본인부담금: {insuranceSummary.patientBurdenAmount.toLocaleString()} 원
                      </Typography>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={applyInsurancePatientBurdenAmount}
                        disabled={!isInsurancePatientBurdenApplicable || loading}
                      >
                        예상 본인부담금 적용
                      </Button>
                    </Stack>
                  </Box>
                )}

                <div style={methodBoxStyle}>
                  {paymentMethods.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      사용 가능한 결제 수단이 없습니다.
                    </Typography>
                  ) : (
                    paymentMethods.map((method) => (
                      <label key={method.methodCode}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.methodCode}
                          checked={paymentMethod === method.methodCode}
                          onChange={() => setPaymentMethod(method.methodCode)}
                        />{" "}
                        {method.methodName}
                      </label>
                    ))
                  )}
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
                      paymentMethods.length === 0 ||
                      payAmount <= 0 ||
                      payAmount > billingDetail.remainingAmount
                    }
                  >
                    {loading ? "처리 중..." : "부분 수납"}
                  </Button>
                </Stack>
              </div>
            )}

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              sx={{ mb: 2, mt: 4 }}
            >
              <Typography variant="h6">수납 내역</Typography>

              <Chip
                label={`현재 표시 ${filteredPayments.length}건 / 전체 ${sortedPayments.length}건`}
                color="primary"
                variant="outlined"
              />
            </Stack>

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
                      남은 금액
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#d32f2f" }}>
                      {billingDetail.remainingAmount.toLocaleString()}원
                    </Typography>
                    {linkedDepositRegistered > 0 && (
                      <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}>
                        반영 전 {preDepositRemainingDisplay.toLocaleString()}원
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      전체 결제 완료 건수
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {completedCount}건
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      전체 수납 취소 건수
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {canceledCount}건
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      전체 부분 환불 건수
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

            <Card
              sx={{
                mb: 2,
                borderRadius: 3,
                boxShadow: 1,
                backgroundColor: "#ffffff",
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      결제 수단 필터
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}
                    >
                      청구 기준 결제 내역을 결제 수단별로 나눠서 조회할 수 있습니다.
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={`전체 (${allMethodCount})`}
                      clickable
                      color={paymentMethodFilter === "ALL" ? "primary" : "default"}
                      variant={
                        paymentMethodFilter === "ALL" ? "filled" : "outlined"
                      }
                      onClick={() => setPaymentMethodFilter("ALL")}
                    />

                    <Chip
                      label={`현금 (${cashMethodCount})`}
                      clickable
                      color={paymentMethodFilter === "CASH" ? "primary" : "default"}
                      variant={
                        paymentMethodFilter === "CASH" ? "filled" : "outlined"
                      }
                      onClick={() => setPaymentMethodFilter("CASH")}
                    />

                    <Chip
                      label={`카드 (${cardMethodCount})`}
                      clickable
                      color={paymentMethodFilter === "CARD" ? "primary" : "default"}
                      variant={
                        paymentMethodFilter === "CARD" ? "filled" : "outlined"
                      }
                      onClick={() => setPaymentMethodFilter("CARD")}
                    />

                    <Chip
                      label={`계좌이체 (${transferMethodCount})`}
                      clickable
                      color={
                        paymentMethodFilter === "TRANSFER" ? "primary" : "default"
                      }
                      variant={
                        paymentMethodFilter === "TRANSFER" ? "filled" : "outlined"
                      }
                      onClick={() => setPaymentMethodFilter("TRANSFER")}
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <Chip
                      label={`표시된 결제 완료 ${filteredCompletedCount}건`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={`표시된 수납 취소 ${filteredCanceledCount}건`}
                      color="error"
                      variant="outlined"
                    />
                    <Chip
                      label={`표시된 부분 환불 ${filteredRefundedCount}건`}
                      color="warning"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {filteredPayments.length === 0 && (
              <Card
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: 1,
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent>
                  <Typography sx={{ color: "text.secondary" }}>
                    선택한 결제 수단에 해당하는 수납 내역이 없습니다.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {filteredPayments.map((p) => {
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
                          href={`/billing/${billingDetail.billId}/receipt/${
                            p.paymentId
                          }?returnTo=${encodeURIComponent(detailSelfHref)}`}
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

                    {p.status === "COMPLETED" && p.createdBy && (
                      <Typography variant="body2" color="text.secondary">
                        결제 담당 직원: {p.createdByName
                          ? `${p.createdByName} (${p.createdBy})`
                          : p.createdBy}
                      </Typography>
                    )}

                    {p.status === "REFUNDED" && p.createdBy && (
                      <Typography variant="body2" color="text.secondary">
                        환불 처리 직원: {p.createdByName
                          ? `${p.createdByName} (${p.createdBy})`
                          : p.createdBy}
                      </Typography>
                    )}

                    {p.status === "CANCELED" && p.canceledBy && (
                      <Typography variant="body2" color="text.secondary">
                        취소 담당 직원: {p.canceledByName
                          ? `${p.canceledByName} (${p.canceledBy})`
                          : p.canceledBy}
                      </Typography>
                    )}

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

                                const staffId = resolveStaffId();
                                if (!staffId) {
                                  toast.error("직원 ID를 확인할 수 없습니다.");
                                  return;
                                }

                                dispatch(
                                  refundPaymentRequest({
                                    paymentId: p.paymentId,
                                    amount: parsedRefundAmount,
                                    billId: billingDetail.billId,
                                    patientId: billingDetail.patientId,
                                    staffId,
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
          open={openBillUnconfirmDialog}
          onClose={() => {
            if (loading) return;
            setOpenBillUnconfirmDialog(false);
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>청구 확정 해제 확인</DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                실수로 청구 확정한 경우, 확정 상태만 해제하고 다시 <strong>완납</strong> 상태로 되돌립니다.
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #93c5fd",
                }}
              >
                <Typography sx={{ fontWeight: 700, color: "#1d4ed8", mb: 1 }}>
                  확정 해제 후 변경 사항
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#1e3a8a" }}>
                  청구 상태만 청구 확정에서 완납으로 변경됩니다. 결제 금액, 잔액, 수납 이력은 그대로 유지됩니다.
                </Typography>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpenBillUnconfirmDialog(false)}
              disabled={loading}
            >
              닫기
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmBillUnconfirm}
              disabled={loading}
            >
              {loading ? "처리 중..." : "확정 해제"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openBillCancelDialog}
          onClose={() => {
            if (loading) return;
            setOpenBillCancelDialog(false);
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>청구 취소 확인</DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                확정된 청구를 취소하면 상태가 취소됨으로 변경됩니다.
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                <Typography sx={{ fontWeight: 700, color: "#b91c1c", mb: 1 }}>
                  청구 취소 전 확인
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#7f1d1d" }}>
                  청구 취소는 청구 확정 상태에서만 가능합니다.
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#7f1d1d", mt: 1 }}>
                  취소 후에는 청구 확정 목록 및 통계에도 반영됩니다.
                </Typography>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpenBillCancelDialog(false)}
              disabled={loading}
            >
              닫기
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmBillCancel}
              disabled={loading}
            >
              {loading ? "취소 처리 중..." : "청구 취소 진행"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openBillRestoreDialog}
          onClose={() => {
            if (loading) return;
            setOpenBillRestoreDialog(false);
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>청구 복원 확인</DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                취소된 청구를 다시 복원하면 상태가 완납으로 변경됩니다.
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #86efac",
                }}
              >
                <Typography sx={{ fontWeight: 700, color: "#166534", mb: 1 }}>
                  청구 복원 전 확인
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#166534" }}>
                  복원은 취소된 청구에만 가능하며, 복원 후 상태는 완납으로 변경됩니다.
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#166534", mt: 1 }}>
                  복원 후에는 상세 화면, 청구 이력, 통계에 다시 반영됩니다.
                </Typography>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpenBillRestoreDialog(false)}
              disabled={loading}
            >
              닫기
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmBillRestore}
              disabled={loading}
            >
              {loading ? "복원 처리 중..." : "청구 복원 진행"}
            </Button>
          </DialogActions>
        </Dialog>

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