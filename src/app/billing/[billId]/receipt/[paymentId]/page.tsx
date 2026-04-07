"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  fetchBillDetailApi,
  fetchPaymentsByBillApi,
  type BillDetail,
  type Payment,
} from "@/lib/billing/billingApi";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

const HOSPITAL_NAME = "서울IT병원";

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

const formatNumber = (value: number) => {
  return value.toLocaleString();
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export default function BillingReceiptPage() {
  const params = useParams<{ billId: string; paymentId: string }>();

  const billId = Number(params.billId);
  const paymentId = Number(params.paymentId);

  const [billingDetail, setBillingDetail] = useState<BillDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );
  const [issuedAt, setIssuedAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIssuedAt(formatDateTime(new Date().toISOString()));
  }, []);

  useEffect(() => {
    let active = true;

    const loadReceipt = async () => {
      try {
        setLoading(true);
        setError(null);

        const [detail, paymentList, patients] = await Promise.all([
          fetchBillDetailApi(billId),
          fetchPaymentsByBillApi(billId),
          fetchPatientsApi(),
        ]);

        if (!active) return;

        const byId = patients.reduce<Record<number, string>>(
          (acc, patient: Patient) => {
            if (patient.patientId && patient.name?.trim()) {
              acc[patient.patientId] = patient.name.trim();
            }
            return acc;
          },
          {}
        );

        setBillingDetail(detail);
        setPayments(paymentList);
        setPatientNameById(byId);
      } catch (err: any) {
        console.error("[billing/receipt] failed to load receipt", err);

        if (!active) return;
        setError(err?.message || "영수증 조회 중 오류가 발생했습니다.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    if (billId && paymentId) {
      loadReceipt();
    } else {
      setLoading(false);
      setError("잘못된 접근입니다.");
    }

    return () => {
      active = false;
    };
  }, [billId, paymentId]);

  const targetPayment = useMemo(() => {
    return payments.find((payment) => payment.paymentId === paymentId) ?? null;
  }, [payments, paymentId]);

  const billItemsTotal =
    billingDetail?.billItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  const patientName =
    billingDetail?.patientId != null
      ? patientNameById[billingDetail.patientId] || "-"
      : "-";

  const receiptGuideMessage = useMemo(() => {
    if (!targetPayment) return "";

    switch (targetPayment.status) {
      case "COMPLETED":
        return "정상 결제가 완료된 거래입니다.";
      case "REFUNDED":
        return "해당 거래는 부분 환불이 반영된 결제입니다.";
      case "CANCELED":
        return "해당 거래는 취소 처리된 결제입니다.";
      default:
        return "결제 상태를 확인해주세요.";
    }
  }, [targetPayment]);

  const receiptGuideColor = useMemo(() => {
    if (!targetPayment) return "#475569";

    switch (targetPayment.status) {
      case "COMPLETED":
        return "#166534";
      case "REFUNDED":
        return "#b45309";
      case "CANCELED":
        return "#b91c1c";
      default:
        return "#475569";
    }
  }, [targetPayment]);

  const receiptGuideBackground = useMemo(() => {
    if (!targetPayment) return "#f8fafc";

    switch (targetPayment.status) {
      case "COMPLETED":
        return "#f0fdf4";
      case "REFUNDED":
        return "#fff7ed";
      case "CANCELED":
        return "#fef2f2";
      default:
        return "#f8fafc";
    }
  }, [targetPayment]);

  const receiptGuideBorder = useMemo(() => {
    if (!targetPayment) return "1px solid #e2e8f0";

    switch (targetPayment.status) {
      case "COMPLETED":
        return "1px solid #86efac";
      case "REFUNDED":
        return "1px solid #fdba74";
      case "CANCELED":
        return "1px solid #fecaca";
      default:
        return "1px solid #e2e8f0";
    }
  }, [targetPayment]);

  return (
    <>
      <MainLayout>
        <main
          className="print-root"
          style={{
            padding: "24px",
            backgroundColor: "#f4f6f8",
            minHeight: "100vh",
          }}
        >
          <Stack
            className="print-hide"
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1976d2",
                  mb: 0.5,
                }}
              >
                {HOSPITAL_NAME}
              </Typography>

              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                결제 영수증 조회
              </Typography>

              <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                결제 건 기준 영수증 상세 정보입니다.
              </Typography>

              <Typography
                sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}
              >
                발행일시: {issuedAt || "-"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} className="print-hide">
              <Button
                component={Link}
                href={`/billing/${billId}`}
                variant="outlined"
              >
                청구 상세로 돌아가기
              </Button>

              <Button
                variant="contained"
                onClick={() => window.print()}
                disabled={loading || !!error || !targetPayment}
              >
                영수증 인쇄
              </Button>
            </Stack>
          </Stack>

          {loading && (
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography>로딩 중...</Typography>
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography sx={{ color: "error.main", fontWeight: 600 }}>
                  {error}
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loading && !error && billingDetail && !targetPayment && (
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography sx={{ color: "error.main", fontWeight: 600 }}>
                  해당 결제 건을 찾을 수 없습니다.
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loading && !error && billingDetail && targetPayment && (
            <Stack spacing={3}>
              <Card
                className="print-card"
                sx={{
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
                  >
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        영수증 대상 거래
                      </Typography>
                      <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                        결제 #{targetPayment.paymentId}
                      </Typography>
                    </Box>

                    <Chip
                      label={getPaymentStatusLabel(targetPayment.status)}
                      color={getPaymentStatusColor(targetPayment.status) as any}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card
                className="print-card"
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    영수증 요약
                  </Typography>

                  <Stack spacing={1.5}>
                    <Typography>병원명: {HOSPITAL_NAME}</Typography>
                    <Typography>청구 ID: {billingDetail.billId}</Typography>
                    <Typography>거래 ID: {targetPayment.paymentId}</Typography>
                    <Typography>환자명: {patientName}</Typography>
                    <Typography>환자 ID: {billingDetail.patientId}</Typography>

                    <Typography>
                      진료일시: {formatDateTime(billingDetail.treatmentDate)}
                    </Typography>

                    <Typography>
                      결제 처리일시: {formatDateTime(targetPayment.paidAt)}
                    </Typography>

                    <Typography>발행일시: {issuedAt || "-"}</Typography>

                    <Typography>
                      결제 수단: {getPaymentMethodLabel(targetPayment.method)}
                    </Typography>

                    <Typography>
                      결제 상태:
                      <Chip
                        label={getPaymentStatusLabel(targetPayment.status)}
                        color={getPaymentStatusColor(
                          targetPayment.status
                        ) as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: receiptGuideBackground,
                      border: receiptGuideBorder,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: receiptGuideColor,
                      }}
                    >
                      {receiptGuideMessage}
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        이번 거래 금액
                      </Typography>
                      <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                        {formatNumber(targetPayment.paymentAmount)} 원
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        청구 총액
                      </Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                        {formatNumber(billingDetail.totalAmount)} 원
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        누적 결제 금액
                      </Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                        {formatNumber(billingDetail.paidAmount)} 원
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        남은 금액
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 700,
                          color:
                            billingDetail.remainingAmount > 0
                              ? "#d32f2f"
                              : "#2e7d32",
                        }}
                      >
                        {formatNumber(billingDetail.remainingAmount)} 원
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                className="print-card"
                sx={{
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
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        청구 항목
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        현재 청구에 포함된 항목 목록입니다.
                      </Typography>
                    </Box>

                    <Box sx={{ mt: { xs: 1, md: 0 } }}>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        항목 합계
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                        {formatNumber(billItemsTotal)} 원
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
                              {formatNumber(item.amount)} 원
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
            </Stack>
          )}
        </main>
      </MainLayout>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-root,
          .print-root * {
            visibility: visible !important;
          }

          .print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .print-hide {
            display: none !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #dcdfe4 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          @page {
            size: auto;
            margin: 12mm;
          }
        }
      `}</style>
    </>
  );
}