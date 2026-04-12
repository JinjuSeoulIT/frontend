"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  formatActiveStatus,
  formatDateTime,
  formatYn,
  getActiveStatusColor,
  getActiveStatusSx,
  safeValue,
} from "@/components/medical_support/common/ExamDisplay";
import { TestResultActions } from "@/features/medical_support/testResult/testResultSlice";
import type {
  TestResult,
  TestResultDetailData,
  TestResultDetailValue,
} from "@/features/medical_support/testResult/testResultType";
import { TEST_RESULT_TYPE_OPTIONS } from "@/features/medical_support/testResult/testResultType";
import type { AppDispatch, RootState } from "@/store/store";

type DetailFieldConfig = {
  key: string;
  label: string;
  formatter?: (value: TestResultDetailValue) => ReactNode;
};

const TYPE_DETAIL_FIELDS: Record<string, DetailFieldConfig[]> = {
  IMAGING: [
    { key: "readingSummary", label: "판독 요약" },
    { key: "readingDetail", label: "판독 상세" },
  ],
  SPECIMEN: [
    { key: "resultItemCode", label: "결과 항목 코드" },
    { key: "resultValue", label: "결과값" },
    { key: "unit", label: "단위" },
    { key: "referenceRange", label: "참고범위" },
    { key: "judgement", label: "판정" },
  ],
  PATHOLOGY: [
    { key: "resultSummary", label: "결과 요약" },
    { key: "judgedAt", label: "판정일시", formatter: formatDetailDateTime },
    { key: "readerId", label: "판독자 ID" },
    { key: "diagnosisName", label: "진단명" },
  ],
  ENDOSCOPY: [
    { key: "finding", label: "소견" },
    { key: "biopsyYn", label: "생검 여부", formatter: formatDetailYn },
    { key: "readerId", label: "판독자 ID" },
  ],
  PHYSIOLOGICAL: [
    { key: "resultValue", label: "결과값" },
    { key: "report", label: "보고서" },
    { key: "measuredItemCode", label: "측정 항목 코드" },
  ],
};

function formatDetailValue(value: TestResultDetailValue) {
  if (typeof value === "boolean") {
    return value ? "예" : "아니오";
  }

  return safeValue(value);
}

function formatDetailDateTime(value: TestResultDetailValue) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return formatDateTime(String(value));
}

function formatDetailYn(value: TestResultDetailValue) {
  if (typeof value === "boolean") {
    return value ? "예" : "아니오";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return formatYn(String(value));
}

function getRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getResultTypeLabel(item: TestResult, resultType: string) {
  const resultTypeName = item.resultTypeName?.trim();
  if (resultTypeName) {
    return `${resultTypeName} (${resultType})`;
  }

  const option = TEST_RESULT_TYPE_OPTIONS.find(
    (typeOption) => typeOption.value === resultType
  );

  return option ? `${option.label} (${resultType})` : safeValue(resultType);
}

function buildDetailFieldConfigs(
  resultType: string,
  detail: TestResultDetailData | null | undefined
): DetailFieldConfig[] {
  const knownFields = TYPE_DETAIL_FIELDS[resultType];

  if (knownFields) {
    return knownFields;
  }

  return Object.keys(detail ?? {}).map<DetailFieldConfig>((key) => ({
    key,
    label: key,
  }));
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>
        {typeof value === "string" || typeof value === "number" ? (
          <Typography
            sx={{
              fontWeight: 600,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}

function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        mt: 1.5,
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
        },
      }}
    >
      {children}
    </Box>
  );
}

export default function TestResultDetail() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const searchParams = useSearchParams();
  const resultId = getRouteParam(params?.resultId).trim();
  const resultType = (searchParams.get("resultType") ?? "").trim().toUpperCase();
  const listHref = resultType
    ? `/medical_support/testResult/list?resultType=${encodeURIComponent(
        resultType
      )}`
    : "/medical_support/testResult/list";
  const editHref = `/medical_support/testResult/edit/${encodeURIComponent(
    resultId
  )}?resultType=${encodeURIComponent(resultType)}`;

  const { detail, detailLoading, detailError } = useSelector(
    (state: RootState) => state.testResults
  );

  useEffect(() => {
    if (!resultId || !resultType) {
      dispatch(TestResultActions.clearTestResultDetail());
      return;
    }

    dispatch(
      TestResultActions.fetchTestResultDetailRequest({
        resultType,
        resultId,
      })
    );

    return () => {
      dispatch(TestResultActions.clearTestResultDetail());
    };
  }, [dispatch, resultId, resultType]);

  if (!resultId || !resultType) {
    return (
      <Box sx={{ px: 3, py: 3, maxWidth: 1100, mx: "auto" }}>
        <Alert severity="error">
          검사 결과 상세 조회에 필요한 정보가 없습니다.
        </Alert>
        <Button
          component={Link}
          href="/medical_support/testResult/list"
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
        >
          목록으로
        </Button>
      </Box>
    );
  }

  if (detailLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (detailError) {
    return (
      <Box sx={{ px: 3, py: 3, maxWidth: 1100, mx: "auto" }}>
        <Alert severity="error">{detailError}</Alert>
        <Button
          component={Link}
          href={listHref}
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
        >
          목록으로
        </Button>
      </Box>
    );
  }

  if (!detail) {
    return (
      <Box sx={{ px: 3, py: 3, maxWidth: 1100, mx: "auto" }}>
        <Alert severity="info">검사 결과 상세 데이터를 찾을 수 없습니다.</Alert>
        <Button
          component={Link}
          href={listHref}
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
        >
          목록으로
        </Button>
      </Box>
    );
  }

  const detailFields = buildDetailFieldConfigs(resultType, detail.detail);

  return (
    <Box sx={{ px: 3, py: 3, maxWidth: 1100, mx: "auto" }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "#fff",
        }}
      >
        <Box sx={{ px: 3, py: 2.5, backgroundColor: "#fafafa" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                검사 결과 상세
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                검사 결과의 공통 정보와 타입별 상세 정보를 확인합니다.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button component={Link} href={listHref} variant="outlined" size="small">
                목록으로
              </Button>
              <Button component={Link} href={editHref} variant="contained" size="small">
                수정
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                공통 정보
              </Typography>
              <DetailGrid>
                <DetailField
                  label="검사종류"
                  value={getResultTypeLabel(detail, resultType)}
                />
                <DetailField label="결과 ID" value={safeValue(detail.resultId)} />
                <DetailField label="검사 ID" value={safeValue(detail.examId)} />
                <DetailField
                  label="검사 수행 ID"
                  value={safeValue(detail.testExecutionId)}
                />
                <DetailField label="상세코드" value={safeValue(detail.detailCode)} />
                <DetailField label="환자 ID" value={safeValue(detail.patientId)} />
                <DetailField label="환자명" value={safeValue(detail.patientName)} />
                <DetailField label="진료과" value={safeValue(detail.departmentName)} />
                <DetailField
                  label="검사수행자 ID"
                  value={safeValue(detail.performerId)}
                />
                <DetailField
                  label="검사수행자명"
                  value={safeValue(detail.performerName)}
                />
                <DetailField label="검사일시" value={formatDateTime(detail.resultAt)} />
                <DetailField label="생성일시" value={formatDateTime(detail.createdAt)} />
                <DetailField
                  label="상태"
                  value={
                    <Chip
                      label={formatActiveStatus(detail.status)}
                      color={getActiveStatusColor(detail.status)}
                      size="small"
                      sx={getActiveStatusSx(detail.status)}
                    />
                  }
                />
                <DetailField label="결과 요약" value={safeValue(detail.summary)} />
              </DetailGrid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                타입별 상세 정보
              </Typography>
              {detailFields.length > 0 ? (
                <DetailGrid>
                  {detailFields.map((field) => (
                    <DetailField
                      key={field.key}
                      label={field.label}
                      value={
                        field.formatter
                          ? field.formatter(detail.detail?.[field.key])
                          : formatDetailValue(detail.detail?.[field.key])
                      }
                    />
                  ))}
                </DetailGrid>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  타입별 상세 정보가 없습니다.
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
