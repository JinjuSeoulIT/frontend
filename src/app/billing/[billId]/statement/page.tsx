"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { fetchBillDetailApi, type BillDetail } from "@/lib/billing/billingApi";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  getDisplayBillingStatusLabel,
  getDisplayBillingStatusColor,
} from "@/lib/billing/billingStatus";
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

export default function BillingStatementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ billId: string }>();
  const billId = Number(params.billId);

  // 수정: 상세 복귀용 returnTo
  const returnTo = searchParams.get("returnTo");

  // 수정: 청구서에서 돌아갈 상세 경로
  const detailHref = useMemo(() => {
    return returnTo
      ? `/billing/${billId}?returnTo=${encodeURIComponent(returnTo)}`
      : `/billing/${billId}`;
  }, [billId, returnTo]);

  const [billingDetail, setBillingDetail] = useState<BillDetail | null>(null);
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

    const loadStatement = async () => {
      try {
        setLoading(true);
        setError(null);

        const [detail, patients] = await Promise.all([
          fetchBillDetailApi(billId),
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
        setPatientNameById(byId);
      } catch (err: any) {
        console.error("[billing/statement] failed to load statement", err);

        if (!active) return;
        setError(err?.message || "청구서 조회 중 오류가 발생했습니다.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    if (billId) {
      loadStatement();
    } else {
      setLoading(false);
      setError("잘못된 접근입니다.");
    }

    return () => {
      active = false;
    };
  }, [billId]);

  const patientName =
    billingDetail?.patientId != null
      ? patientNameById[billingDetail.patientId] || "-"
      : "-";

  const billItemsTotal = useMemo(() => {
    return (
      billingDetail?.billItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0
    );
  }, [billingDetail]);

  const statementGuideMessage = useMemo(() => {
    if (!billingDetail) return "";

    if (billingDetail.remainingAmount > 0) {
      return "현재 미수금이 남아 있습니다. 추가 수납이 필요합니다.";
    }

    return "현재 청구는 모두 수납 완료된 상태입니다.";
  }, [billingDetail]);

  const statementGuideColor = useMemo(() => {
    if (!billingDetail) return "#475569";

    return billingDetail.remainingAmount > 0 ? "#b45309" : "#166534";
  }, [billingDetail]);

  const statementGuideBackground = useMemo(() => {
    if (!billingDetail) return "#f8fafc";

    return billingDetail.remainingAmount > 0 ? "#fff7ed" : "#f0fdf4";
  }, [billingDetail]);

  const statementGuideBorder = useMemo(() => {
    if (!billingDetail) return "1px solid #e2e8f0";

    return billingDetail.remainingAmount > 0
      ? "1px solid #fdba74"
      : "1px solid #86efac";
  }, [billingDetail]);

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
                청구서 조회
              </Typography>

              <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                청구 기준 상세 문서입니다.
              </Typography>

              <Typography
                sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}
              >
                발행일시: {issuedAt || "-"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} className="print-hide">
              <Button
                // 수정: Link 고정 이동 -> 상세 복귀 경로 사용
                onClick={() => router.push(detailHref)}
                variant="outlined"
              >
                청구 상세 보기
              </Button>

              <Button
                variant="contained"
                onClick={() => window.print()}
                disabled={loading || !!error || !billingDetail}
              >
                청구서 인쇄
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

          {!loading && !error && billingDetail && (
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
                        청구 문서 대상
                      </Typography>
                      <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                        청구 #{billingDetail.billId}
                      </Typography>
                    </Box>

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
                    청구 요약
                  </Typography>

                  <Stack spacing={1.5}>
                    <Typography>병원명: {HOSPITAL_NAME}</Typography>
                    <Typography>청구 ID: {billingDetail.billId}</Typography>
                    <Typography>환자명: {patientName}</Typography>
                    <Typography>환자 ID: {billingDetail.patientId}</Typography>

                    <Typography>
                      진료일시: {formatDateTime(billingDetail.treatmentDate)}
                    </Typography>

                    <Typography>발행일시: {issuedAt || "-"}</Typography>

                    <Typography component="div">
                      청구 상태:
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

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: statementGuideBackground,
                      border: statementGuideBorder,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: statementGuideColor,
                      }}
                    >
                      {statementGuideMessage}
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        총 청구 금액
                      </Typography>
                      <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
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