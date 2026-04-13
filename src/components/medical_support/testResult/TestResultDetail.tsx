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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  fullWidth?: boolean;
};

const TYPE_DETAIL_FIELDS: Record<string, DetailFieldConfig[]> = {
  IMAGING: [{ key: "readingDetail", label: "판독 상세", fullWidth: true }],
  SPECIMEN: [
    { key: "resultItemCode", label: "결과 항목 코드" },
    { key: "unit", label: "단위" },
    { key: "referenceRange", label: "참고범위" },
    { key: "judgement", label: "판정" },
  ],
  PATHOLOGY: [
    { key: "diagnosisName", label: "진단명" },
    { key: "judgedAt", label: "판정일시", formatter: formatDetailDateTime },
    { key: "readerId", label: "판독자 ID" },
  ],
  ENDOSCOPY: [
    { key: "biopsyYn", label: "생검 여부", formatter: formatDetailYn },
    { key: "readerId", label: "판독자 ID" },
  ],
  PHYSIOLOGICAL: [
    { key: "measuredItemCode", label: "측정 항목 코드" },
    { key: "report", label: "보고서", fullWidth: true },
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

function getSummaryLabel(resultType: string) {
  switch (resultType) {
    case "IMAGING":
      return "판독 요약";
    case "SPECIMEN":
      return "결과값";
    case "PATHOLOGY":
      return "병리 결과 요약";
    case "ENDOSCOPY":
      return "내시경 소견";
    case "PHYSIOLOGICAL":
      return "결과 요약";
    default:
      return "결과 요약";
  }
}

function getDetailSectionTitle(resultType: string) {
  switch (resultType) {
    case "IMAGING":
      return "판독 정보";
    case "SPECIMEN":
      return "검체 결과";
    case "PATHOLOGY":
      return "병리 판정 정보";
    case "ENDOSCOPY":
      return "내시경 결과 정보";
    case "PHYSIOLOGICAL":
      return "생리기능 결과 정보";
    default:
      return "타입별 상세 정보";
  }
}

function formatNameWithId(
  name?: string | null,
  id?: string | number | null
) {
  const displayName = safeValue(name);
  const displayId = safeValue(id);

  if (displayName !== "-" && displayId !== "-") {
    return `${displayName} (${displayId})`;
  }

  return displayName !== "-" ? displayName : displayId;
}

function DetailField({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <Box sx={{ minWidth: 0, gridColumn: fullWidth ? { md: "1 / -1" } : undefined }}>
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

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {children}
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

function SpecimenResultTable({
  detail,
  summary,
}: {
  detail: TestResultDetailData | null | undefined;
  summary?: string | null;
}) {
  return (
    <TableContainer
      component={Box}
      sx={{
        mt: 1.5,
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 1,
        overflowX: "auto",
      }}
    >
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            {["결과 항목 코드", "결과값", "단위", "참고범위", "판정"].map(
              (header) => (
                <TableCell
                  key={header}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "#f8f9fa",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align="center">
              {formatDetailValue(detail?.resultItemCode)}
            </TableCell>
            <TableCell align="center">{safeValue(summary)}</TableCell>
            <TableCell align="center">{formatDetailValue(detail?.unit)}</TableCell>
            <TableCell align="center">
              {formatDetailValue(detail?.referenceRange)}
            </TableCell>
            <TableCell align="center">
              {formatDetailValue(detail?.judgement)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
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
  const isSpecimenResult = resultType === "SPECIMEN";
  const detailSectionTitle = getDetailSectionTitle(resultType);
  const summaryLabel = getSummaryLabel(resultType);

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
                결과 요약과 검사별 판독 정보를 확인합니다.
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
            <Section title={isSpecimenResult ? detailSectionTitle : "결과 요약"}>
              {isSpecimenResult ? (
                <SpecimenResultTable
                  detail={detail.detail}
                  summary={detail.summary}
                />
              ) : (
                <DetailGrid>
                  <DetailField
                    label={summaryLabel}
                    value={safeValue(detail.summary)}
                    fullWidth
                  />
                </DetailGrid>
              )}
            </Section>

            {!isSpecimenResult ? (
              <>
                <Divider />

                <Section title={detailSectionTitle}>
                  {detailFields.length > 0 ? (
                    <DetailGrid>
                      {detailFields.map((field) => (
                        <DetailField
                          key={field.key}
                          label={field.label}
                          fullWidth={field.fullWidth}
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
                      등록된 상세 정보가 없습니다.
                    </Typography>
                  )}
                </Section>
              </>
            ) : null}

            <Divider />

            <Section title="검사 정보">
              <DetailGrid>
                <DetailField
                  label="검사종류"
                  value={getResultTypeLabel(detail, resultType)}
                />
                <DetailField
                  label="환자"
                  value={formatNameWithId(detail.patientName, detail.patientId)}
                />
                <DetailField label="진료과" value={safeValue(detail.departmentName)} />
                <DetailField
                  label="결과확정일시"
                  value={formatDateTime(detail.resultAt)}
                />
                <DetailField
                  label="검사수행자"
                  value={formatNameWithId(detail.performerName, detail.performerId)}
                />
                <DetailField
                  label="검사결과관리자"
                  value={formatNameWithId(
                    detail.resultManagerName,
                    detail.resultManagerId
                  )}
                />
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
              </DetailGrid>
            </Section>

            <Divider />

            <Section title="관리 정보">
              <DetailGrid>
                <DetailField label="결과 ID" value={safeValue(detail.resultId)} />
                <DetailField label="검사 ID" value={safeValue(detail.examId)} />
                <DetailField
                  label="검사 수행 ID"
                  value={safeValue(detail.testExecutionId)}
                />
                <DetailField label="상세코드" value={safeValue(detail.detailCode)} />
              </DetailGrid>
            </Section>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
