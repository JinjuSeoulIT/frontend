"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { fetchBillingInsuranceSummaryApi } from "@/lib/billing/billingInsuranceApi";
import type {
  Insurance,
  InsuranceHistory,
} from "@/features/insurance/insuranceTypes";

export type InsuranceCalculationSummary = {
  insuranceType: string | null;
  coverageRate: number;
  insuranceAppliedAmount: number;
  patientBurdenAmount: number;
  note: string;
};

type Props = {
  billId: number;
  patientId: number;
  originalAmount: number;
  calculatedAmount: number;
  onCalculationChange?: (summary: InsuranceCalculationSummary | null) => void;
};

const normalizeInsuranceType = (insuranceType?: string | null) => {
  if (!insuranceType) return null;

  const value = insuranceType.trim().toUpperCase();

  if (
    value === "NATIONAL" ||
    value === "NHI" ||
    value === "NHI보험" ||
    value === "국민건강보험" ||
    value === "건강보험"
  ) {
    return "NATIONAL";
  }

  if (value === "MEDICAID" || value === "의료급여") {
    return "MEDICAID";
  }

  if (value === "INDUSTRIAL" || value === "산재보험") {
    return "INDUSTRIAL";
  }

  if (value === "AUTO" || value === "자동차보험") {
    return "AUTO";
  }

  if (value === "PRIVATE" || value === "실손보험" || value === "민간보험") {
    return "PRIVATE";
  }

  return insuranceType;
};

const getInsuranceTypeLabel = (insuranceType?: string | null) => {
  const normalized = normalizeInsuranceType(insuranceType);

  switch (normalized) {
    case "NATIONAL":
      return "건강보험";
    case "PRIVATE":
      return "실손보험";
    case "INDUSTRIAL":
      return "산재보험";
    case "AUTO":
      return "자동차보험";
    case "MEDICAID":
      return "의료급여";
    default:
      return insuranceType ?? "-";
  }
};

const isCurrentlyValidInsurance = (insurance: Insurance) => {
  if (!insurance.activeYn) return false;

  const today = new Date();
  const startDate = insurance.startDate ? new Date(insurance.startDate) : null;
  const endDate = insurance.endDate ? new Date(insurance.endDate) : null;

  if (startDate && today < startDate) return false;
  if (endDate && today > endDate) return false;

  return true;
};

const getInsuranceHistoryTypeLabel = (changeType: string) => {
  switch (changeType) {
    case "CREATE":
      return "보험 등록";
    case "UPDATE":
      return "보험 수정";
    case "DELETE":
      return "보험 삭제";
    case "ACTIVATE":
      return "보험 활성화";
    case "DEACTIVATE":
      return "보험 비활성화";
    default:
      return changeType;
  }
};

const getInsuranceHistoryTypeColor = (changeType: string) => {
  switch (changeType) {
    case "CREATE":
      return "success";
    case "UPDATE":
      return "info";
    case "DELETE":
      return "error";
    case "ACTIVATE":
      return "success";
    case "DEACTIVATE":
      return "warning";
    default:
      return "default";
  }
};

const formatInsuranceHistoryData = (value: unknown) => {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return value.trim() === "" ? "-" : value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
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

const formatMoney = (value: number) => {
  return value.toLocaleString();
};

const emptyCalculationSummary: InsuranceCalculationSummary = {
  insuranceType: null,
  coverageRate: 0,
  insuranceAppliedAmount: 0,
  patientBurdenAmount: 0,
  note: "현재 유효 보험이 없어 본인부담금 전액 기준으로 표시합니다.",
};

export default function InsurancePanel({
  billId,
  patientId,
  originalAmount,
  calculatedAmount,
  onCalculationChange,
}: Props) {
  const [insuranceList, setInsuranceList] = useState<Insurance[]>([]);
  const [validInsurance, setValidInsurance] = useState<Insurance | null>(null);
  const [insuranceLoading, setInsuranceLoading] = useState<boolean>(false);
  const [insuranceError, setInsuranceError] = useState<string | null>(null);

  const [insuranceHistories, setInsuranceHistories] = useState<InsuranceHistory[]>([]);
  const [insuranceHistoryLoading, setInsuranceHistoryLoading] =
    useState<boolean>(false);
  const [insuranceHistoryError, setInsuranceHistoryError] = useState<string | null>(null);

  const [insuranceCalculation, setInsuranceCalculation] =
    useState<InsuranceCalculationSummary>(emptyCalculationSummary);

  useEffect(() => {
    let active = true;

    const loadInsuranceSummary = async () => {
      if (!billId || !patientId) {
        setInsuranceList([]);
        setValidInsurance(null);
        setInsuranceError(null);
        setInsuranceHistories([]);
        setInsuranceHistoryError(null);
        setInsuranceCalculation(emptyCalculationSummary);
        return;
      }

      try {
        setInsuranceLoading(true);
        setInsuranceHistoryLoading(true);
        setInsuranceError(null);
        setInsuranceHistoryError(null);

        const summary = await fetchBillingInsuranceSummaryApi(billId);

        if (!active) return;

        setValidInsurance(summary.validInsurance ?? null);
        setInsuranceList(summary.insuranceList ?? []);
        setInsuranceHistories(summary.insuranceHistories ?? []);
        setInsuranceError(summary.insuranceError ?? null);
        setInsuranceHistoryError(summary.insuranceHistoryError ?? null);
        setInsuranceCalculation(summary.calculation ?? emptyCalculationSummary);
      } catch (err: any) {
        console.error("[billing/detail] failed to load billing insurance summary", err);

        if (!active) return;

        setInsuranceList([]);
        setValidInsurance(null);
        setInsuranceError(err?.message || "보험 정보 조회 실패");
        setInsuranceHistories([]);
        setInsuranceHistoryError(err?.message || "보험 이력 조회 실패");
        setInsuranceCalculation(emptyCalculationSummary);
      } finally {
        if (!active) return;
        setInsuranceLoading(false);
        setInsuranceHistoryLoading(false);
      }
    };

    loadInsuranceSummary();

    return () => {
      active = false;
    };
  }, [billId, patientId]);

  const sortedInsuranceHistories = useMemo(() => {
    return [...insuranceHistories].sort((a, b) => {
      const aTime = a.changedAt ? new Date(a.changedAt).getTime() : 0;
      const bTime = b.changedAt ? new Date(b.changedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [insuranceHistories]);

  useEffect(() => {
    if (!onCalculationChange) return;

    onCalculationChange(insuranceCalculation);

    return () => {
      onCalculationChange(null);
    };
  }, [insuranceCalculation, onCalculationChange]);

  return (
    <>
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#ffffff" }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6">환자 보험 정보</Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                billing 백엔드 보험 요약 API 기준으로 현재 유효 보험과 등록된 보험 정보를 조회합니다.
              </Typography>
            </Box>

            <Box sx={{ mt: { xs: 1, md: 0 } }}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>등록 보험 수</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{insuranceList.length} 건</Typography>
            </Box>
          </Stack>

          {insuranceLoading && (
            <Typography sx={{ color: "text.secondary" }}>보험 정보를 불러오는 중입니다...</Typography>
          )}

          {insuranceError && (
            <Typography sx={{ color: "#d32f2f", fontWeight: 600 }}>{insuranceError}</Typography>
          )}

          {!insuranceLoading && !insuranceError && (
            <>
              <Card sx={{ mb: 2, borderRadius: 2, backgroundColor: "#f8fbff", border: "1px solid #dbeafe", boxShadow: "none" }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    현재 유효 보험
                  </Typography>

                  {validInsurance ? (
                    <Stack spacing={1}>
                      <Typography>
                        보험 종류: <strong>{getInsuranceTypeLabel(validInsurance.insuranceType)}</strong>
                      </Typography>

                      <Typography>
                        증권번호: <strong>{validInsurance.policyNo ?? "-"}</strong>
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip size="small" color={validInsurance.activeYn ? "success" : "default"} label={validInsurance.activeYn ? "사용" : "중지"} />
                        <Chip size="small" color={validInsurance.verifiedYn ? "info" : "default"} label={validInsurance.verifiedYn ? "검증 완료" : "미검증"} />
                        <Chip
                          size="small"
                          color={isCurrentlyValidInsurance(validInsurance) ? "success" : "default"}
                          label={isCurrentlyValidInsurance(validInsurance) ? "현재 유효" : "유효기간 확인 필요"}
                        />
                      </Stack>

                      <Typography>
                        적용 기간: <strong>{validInsurance.startDate ?? "-"} ~ {validInsurance.endDate ?? "-"}</strong>
                      </Typography>

                      <Typography>
                        비고: <strong>{validInsurance.note ?? "-"}</strong>
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography sx={{ color: "text.secondary" }}>현재 유효 보험이 없습니다.</Typography>
                  )}
                </CardContent>
              </Card>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                등록 보험 목록
              </Typography>

              {insuranceList.length === 0 ? (
                <Typography sx={{ color: "text.secondary" }}>등록된 보험 정보가 없습니다.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {insuranceList.map((insurance, index) => (
                    <Box key={insurance.insuranceId}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={1}
                        sx={{ py: 1 }}
                      >
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: "wrap" }}>
                            <Typography sx={{ fontWeight: 600 }}>{getInsuranceTypeLabel(insurance.insuranceType)}</Typography>
                            <Chip size="small" color={insurance.activeYn ? "success" : "default"} label={insurance.activeYn ? "사용" : "중지"} />
                            <Chip size="small" color={insurance.verifiedYn ? "info" : "default"} label={insurance.verifiedYn ? "검증" : "미검증"} />
                            <Chip
                              size="small"
                              color={isCurrentlyValidInsurance(insurance) ? "success" : "default"}
                              label={isCurrentlyValidInsurance(insurance) ? "유효" : "만료/비활성"}
                            />
                          </Stack>

                          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                            증권번호: {insurance.policyNo ?? "-"}
                          </Typography>

                          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                            적용 기간: {insurance.startDate ?? "-"} ~ {insurance.endDate ?? "-"}
                          </Typography>

                          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                            비고: {insurance.note ?? "-"}
                          </Typography>
                        </Box>
                      </Stack>

                      {index !== insuranceList.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Stack>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#ffffff" }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6">보험 계산 결과</Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                billing 백엔드 보험 요약 API 기준으로 계산한 결과입니다.
              </Typography>
            </Box>

            <Box sx={{ mt: { xs: 1, md: 0 } }}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>보장 비율</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                {(insuranceCalculation.coverageRate * 100).toFixed(0)}%
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1}>
            <Typography>
              보험 종류: <strong>{insuranceCalculation.insuranceType ? getInsuranceTypeLabel(insuranceCalculation.insuranceType) : "미적용"}</strong>
            </Typography>

            <Typography>
              청구 원금액: <strong>{formatMoney(originalAmount)} 원</strong>
            </Typography>

            <Typography>
              자동 계산 진료비: <strong>{formatMoney(calculatedAmount)} 원</strong>
            </Typography>

            <Typography sx={{ color: "#1976d2", fontWeight: 700 }}>
              보험 적용 금액: {formatMoney(insuranceCalculation.insuranceAppliedAmount)} 원
            </Typography>

            <Typography sx={{ color: "#d32f2f", fontWeight: 700 }}>
              본인 부담 예정 금액: {formatMoney(insuranceCalculation.patientBurdenAmount)} 원
            </Typography>

            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
              {insuranceCalculation.note}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#ffffff" }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6">보험 이력</Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                billing 백엔드 보험 요약 API 기준으로 보험 변경 이력을 조회합니다.
              </Typography>
            </Box>

            <Box sx={{ mt: { xs: 1, md: 0 } }}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>보험 이력 수</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{sortedInsuranceHistories.length} 건</Typography>
            </Box>
          </Stack>

          {insuranceHistoryLoading && (
            <Typography sx={{ color: "text.secondary" }}>보험 이력을 불러오는 중입니다...</Typography>
          )}

          {insuranceHistoryError && (
            <Typography sx={{ color: "#d32f2f", fontWeight: 600 }}>{insuranceHistoryError}</Typography>
          )}

          {!insuranceHistoryLoading && !insuranceHistoryError && sortedInsuranceHistories.length === 0 && (
            <Typography sx={{ color: "text.secondary" }}>보험 이력이 없습니다.</Typography>
          )}

          {!insuranceHistoryLoading && !insuranceHistoryError && sortedInsuranceHistories.length > 0 && (
            <Stack spacing={1.5}>
              {sortedInsuranceHistories.map((history, index) => (
                <Box key={`${history.historyId}-${history.changedAt}-${index}`}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1}
                    sx={{ py: 1 }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {getInsuranceHistoryTypeLabel(history.changeType)}
                        </Typography>

                        <Chip
                          size="small"
                          color={getInsuranceHistoryTypeColor(history.changeType) as any}
                          label={history.changeType}
                        />
                      </Stack>

                      <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                        변경자: {history.changedBy ?? "-"}
                      </Typography>

                      <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                        변경 일시: {history.changedAt ? formatDateTime(history.changedAt) : "-"}
                      </Typography>

                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
                          이전 데이터
                        </Typography>
                        <Typography
                          component="pre"
                          sx={{
                            fontSize: 12,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color: "text.secondary",
                            mb: 1.5,
                            fontFamily: "inherit",
                          }}
                        >
                          {formatInsuranceHistoryData(history.beforeData)}
                        </Typography>

                        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
                          변경 후 데이터
                        </Typography>
                        <Typography
                          component="pre"
                          sx={{
                            fontSize: 12,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color: "text.secondary",
                            fontFamily: "inherit",
                          }}
                        >
                          {formatInsuranceHistoryData(history.afterData)}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  {index !== sortedInsuranceHistories.length - 1 && <Divider />}
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </>
  );
}
