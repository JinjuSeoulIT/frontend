"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
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
  IMAGING: [
    { key: "readingDetail", label: "영상 판독 본문", fullWidth: true },
  ],
  SPECIMEN: [
    { key: "resultItemCode", label: "검사 항목 코드" },
    { key: "unit", label: "결과 단위" },
    { key: "referenceRange", label: "참고치 범위" },
    { key: "judgement", label: "판정값" },
  ],
  PATHOLOGY: [
    { key: "judgedAt", label: "병리 판정 시각", formatter: formatDetailDateTime },
    { key: "readerId", label: "판독자 ID" },
    { key: "diagnosisName", label: "병리 진단명" },
  ],
  ENDOSCOPY: [
    { key: "biopsyYn", label: "조직검사 여부", formatter: formatDetailYn },
    { key: "readerId", label: "판독자 ID" },
  ],
  PHYSIOLOGICAL: [
    { key: "report", label: "검사 리포트 본문", fullWidth: true },
    { key: "measuredItemCode", label: "측정 항목 코드" },
  ],
};

function safeValue(value?: TestResultDetailValue) {
  if (value === null || value === undefined) {
    return "-";
  }

  const text = String(value).trim();
  return text || "-";
}

function normalizeValue(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

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
  const normalized = String(value ?? "").trim().toUpperCase();

  if (!normalized) {
    return "-";
  }

  if (["Y", "YES", "TRUE"].includes(normalized)) {
    return "예";
  }

  if (["N", "NO", "FALSE"].includes(normalized)) {
    return "아니오";
  }

  return safeValue(value);
}

function formatStatus(value?: string | null) {
  const normalized = normalizeValue(value);

  if (normalized === "ACTIVE") {
    return "활성";
  }

  if (normalized === "INACTIVE") {
    return "비활성";
  }

  return safeValue(value);
}

function getStatusColor(value?: string | null) {
  return normalizeValue(value) === "ACTIVE" ? "success" : "default";
}

function formatProgressStatus(value?: string | null) {
  return normalizeValue(value) === "COMPLETED"
    ? "결과작성완료"
    : "결과작성중";
}

function getProgressStatusColor(value?: string | null) {
  return normalizeValue(value) === "COMPLETED" ? "success" : "warning";
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

  return Object.keys(detail ?? {}).map((key) => ({
    key,
    label: key,
  }));
}

function getDetailSectionTitle(resultType: string) {
  switch (resultType) {
    case "IMAGING":
      return "영상 판독 정보";
    case "SPECIMEN":
      return "검체검사 결과";
    case "PATHOLOGY":
      return "병리 판정 정보";
    case "ENDOSCOPY":
      return "내시경 결과 정보";
    case "PHYSIOLOGICAL":
      return "생리기능 결과 정보";
    default:
      return "도메인별 상세 정보";
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

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 2.5 },
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "#fafafa",
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, md: 2.5 } }}>{children}</Box>
    </Paper>
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
  const listHref = "/medical_support/testResult/list";
  const editHref = `/medical_support/testResult/edit/${encodeURIComponent(
    resultId
  )}?resultType=${encodeURIComponent(resultType)}`;

  const pendingSuccessMessageRef = useRef<string | null>(null);

  const { detail, detailLoading, detailError, updateLoading, updateError, updateSuccess } =
    useSelector(
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
      dispatch(TestResultActions.resetUpdateSuccess());
    };
  }, [dispatch, resultId, resultType]);

  useEffect(() => {
    if (!updateSuccess) {
      return;
    }

    const message =
      pendingSuccessMessageRef.current ?? "검사 결과가 작성완료 처리되었습니다.";

    alert(message);
    pendingSuccessMessageRef.current = null;
    dispatch(TestResultActions.resetUpdateSuccess());
  }, [dispatch, updateSuccess]);

  useEffect(() => {
    if (!updateError) {
      return;
    }

    pendingSuccessMessageRef.current = null;
    alert(updateError);
  }, [updateError]);

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
  const detailSectionTitle = getDetailSectionTitle(resultType);
  const isCompleted = normalizeValue(detail.progressStatus) === "COMPLETED";
  const isImaging = resultType === "IMAGING";
  const isSpecimen = resultType === "SPECIMEN";
  const isPathology = resultType === "PATHOLOGY";
  const isEndoscopy = resultType === "ENDOSCOPY";
  const isPhysiological = resultType === "PHYSIOLOGICAL";

  const handleCompleteWriting = () => {
    if (!resultId || updateLoading || isCompleted) {
      return;
    }

    pendingSuccessMessageRef.current = "검사 결과가 작성완료 처리되었습니다.";
    dispatch(
      TestResultActions.updateTestResultProgressStatusRequest({
        resultId,
        progressStatus: "COMPLETED",
      })
    );
  };

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
                통합 검사 결과의 공통 정보와 도메인별 상세 정보를 확인합니다.
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
          {isImaging ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 먼저 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <DetailField label="검사코드" value={safeValue(detail.detailCode)} />
                  <DetailField label="환자명" value={safeValue(detail.patientName)} />
                  <DetailField label="환자 ID" value={safeValue(detail.patientId)} />
                  <DetailField label="진료과" value={safeValue(detail.departmentName)} />
                  <DetailField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과등록일시"
                    value={formatDateTime(detail.resultAt)}
                  />
                  <DetailField label="생성일시" value={formatDateTime(detail.createdAt)} />
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
                        label={formatStatus(detail.status)}
                        color={getStatusColor(detail.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <DetailField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(detail.progressStatus)}
                        color={getProgressStatusColor(detail.progressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="영상 판독 정보"
                description="실제 결과 요약과 판독 본문을 중심으로 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과 요약"
                    value={safeValue(detail.summary)}
                    fullWidth
                  />
                  <DetailField
                    label="영상 판독 본문"
                    value={formatDetailValue(detail.detail?.readingDetail)}
                    fullWidth
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 영상검사, 검사수행 식별값을 확인합니다."
              >
                <DetailGrid>
                  <DetailField label="결과 ID" value={safeValue(detail.resultId)} />
                  <DetailField label="영상검사 ID" value={safeValue(detail.examId)} />
                  <DetailField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </DetailGrid>
              </SectionCard>
            </Stack>
          ) : isSpecimen ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 먼저 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <DetailField label="검사코드" value={safeValue(detail.detailCode)} />
                  <DetailField label="환자명" value={safeValue(detail.patientName)} />
                  <DetailField label="환자 ID" value={safeValue(detail.patientId)} />
                  <DetailField label="진료과" value={safeValue(detail.departmentName)} />
                  <DetailField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과등록일시"
                    value={formatDateTime(detail.resultAt)}
                  />
                  <DetailField label="생성일시" value={formatDateTime(detail.createdAt)} />
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
                        label={formatStatus(detail.status)}
                        color={getStatusColor(detail.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <DetailField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(detail.progressStatus)}
                        color={getProgressStatusColor(detail.progressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="검체검사 결과 정보"
                description="검체검사 결과 요약과 항목별 결과 정보를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과 요약"
                    value={safeValue(detail.summary)}
                    fullWidth
                  />
                  <DetailField
                    label="검사 항목 코드"
                    value={formatDetailValue(detail.detail?.resultItemCode)}
                  />
                  <DetailField
                    label="결과 단위"
                    value={formatDetailValue(detail.detail?.unit)}
                  />
                  <DetailField
                    label="참고치 범위"
                    value={formatDetailValue(detail.detail?.referenceRange)}
                  />
                  <DetailField
                    label="판정값"
                    value={formatDetailValue(detail.detail?.judgement)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 검체검사, 검사수행 식별값을 확인합니다."
              >
                <DetailGrid>
                  <DetailField label="결과 ID" value={safeValue(detail.resultId)} />
                  <DetailField label="검체검사 ID" value={safeValue(detail.examId)} />
                  <DetailField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </DetailGrid>
              </SectionCard>
            </Stack>
          ) : isPathology ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 먼저 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <DetailField label="검사코드" value={safeValue(detail.detailCode)} />
                  <DetailField label="환자명" value={safeValue(detail.patientName)} />
                  <DetailField label="환자 ID" value={safeValue(detail.patientId)} />
                  <DetailField label="진료과" value={safeValue(detail.departmentName)} />
                  <DetailField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과등록일시"
                    value={formatDateTime(detail.resultAt)}
                  />
                  <DetailField label="생성일시" value={formatDateTime(detail.createdAt)} />
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
                        label={formatStatus(detail.status)}
                        color={getStatusColor(detail.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <DetailField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(detail.progressStatus)}
                        color={getProgressStatusColor(detail.progressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="병리 판정 정보"
                description="결과 요약과 병리 판정 정보를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과 요약"
                    value={safeValue(detail.summary)}
                    fullWidth
                  />
                  <DetailField
                    label="병리판정일시"
                    value={formatDetailDateTime(detail.detail?.judgedAt)}
                  />
                  <DetailField
                    label="판독자 ID"
                    value={formatDetailValue(detail.detail?.readerId)}
                  />
                  <DetailField
                    label="병리진단명"
                    value={formatDetailValue(detail.detail?.diagnosisName)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 병리검사, 검사수행 식별값을 확인합니다."
              >
                <DetailGrid>
                  <DetailField label="결과 ID" value={safeValue(detail.resultId)} />
                  <DetailField label="병리검사 ID" value={safeValue(detail.examId)} />
                  <DetailField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </DetailGrid>
              </SectionCard>
            </Stack>
          ) : isEndoscopy ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 먼저 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <DetailField label="검사코드" value={safeValue(detail.detailCode)} />
                  <DetailField label="환자명" value={safeValue(detail.patientName)} />
                  <DetailField label="환자 ID" value={safeValue(detail.patientId)} />
                  <DetailField label="진료과" value={safeValue(detail.departmentName)} />
                  <DetailField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과등록일시"
                    value={formatDateTime(detail.resultAt)}
                  />
                  <DetailField label="생성일시" value={formatDateTime(detail.createdAt)} />
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
                        label={formatStatus(detail.status)}
                        color={getStatusColor(detail.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <DetailField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(detail.progressStatus)}
                        color={getProgressStatusColor(detail.progressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="내시경 결과 정보"
                description="결과 요약과 내시경 결과 정보를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과 요약"
                    value={safeValue(detail.summary)}
                    fullWidth
                  />
                  <DetailField
                    label="조직검사 여부"
                    value={formatDetailYn(detail.detail?.biopsyYn)}
                  />
                  <DetailField
                    label="판독자 ID"
                    value={formatDetailValue(detail.detail?.readerId)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 내시경검사, 검사수행 식별값을 확인합니다."
              >
                <DetailGrid>
                  <DetailField label="결과 ID" value={safeValue(detail.resultId)} />
                  <DetailField label="내시경검사 ID" value={safeValue(detail.examId)} />
                  <DetailField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </DetailGrid>
              </SectionCard>
            </Stack>
          ) : isPhysiological ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 먼저 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <DetailField label="검사코드" value={safeValue(detail.detailCode)} />
                  <DetailField label="환자명" value={safeValue(detail.patientName)} />
                  <DetailField label="환자 ID" value={safeValue(detail.patientId)} />
                  <DetailField label="진료과" value={safeValue(detail.departmentName)} />
                  <DetailField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과등록일시"
                    value={formatDateTime(detail.resultAt)}
                  />
                  <DetailField label="생성일시" value={formatDateTime(detail.createdAt)} />
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
                        label={formatStatus(detail.status)}
                        color={getStatusColor(detail.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <DetailField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(detail.progressStatus)}
                        color={getProgressStatusColor(detail.progressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="생리기능검사 결과 정보"
                description="결과 요약과 생리기능검사 결과 정보를 확인합니다."
              >
                <DetailGrid>
                  <DetailField
                    label="결과 요약"
                    value={safeValue(detail.summary)}
                    fullWidth
                  />
                  <DetailField
                    label="검사 리포트 본문"
                    value={formatDetailValue(detail.detail?.report)}
                    fullWidth
                  />
                  <DetailField
                    label="측정 항목 코드"
                    value={formatDetailValue(detail.detail?.measuredItemCode)}
                  />
                </DetailGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 생리기능검사, 검사수행 식별값을 확인합니다."
              >
                <DetailGrid>
                  <DetailField label="결과 ID" value={safeValue(detail.resultId)} />
                  <DetailField
                    label="생리기능검사 ID"
                    value={safeValue(detail.examId)}
                  />
                  <DetailField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </DetailGrid>
              </SectionCard>
            </Stack>
          ) : (
            <Stack spacing={4}>
              <Section title="결과 요약">
                <DetailGrid>
                  <DetailField
                    label="목록 결과 요약"
                    value={safeValue(detail.summary)}
                    fullWidth
                  />
                </DetailGrid>
              </Section>

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

              <Divider />

              <Section title="검사 정보">
                <DetailGrid>
                  <DetailField
                    label="검사 종류"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <DetailField
                    label="환자"
                    value={formatNameWithId(detail.patientName, detail.patientId)}
                  />
                  <DetailField label="진료과" value={safeValue(detail.departmentName)} />
                  <DetailField
                    label="결과 확정 시각"
                    value={formatDateTime(detail.resultAt)}
                  />
                  <DetailField
                    label="검사 시행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                  <DetailField
                    label="결과 관리자"
                    value={formatNameWithId(
                      detail.resultManagerName,
                      detail.resultManagerId
                    )}
                  />
                  <DetailField
                    label="상태"
                    value={
                      <Chip
                        label={formatStatus(detail.status)}
                        color={getStatusColor(detail.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <DetailField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(detail.progressStatus)}
                        color={getProgressStatusColor(detail.progressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <DetailField label="생성 시각" value={formatDateTime(detail.createdAt)} />
                </DetailGrid>
              </Section>

              <Divider />

              <Section title="관리 정보">
                <DetailGrid>
                  <DetailField label="결과 ID" value={safeValue(detail.resultId)} />
                  <DetailField label="원본 검사 실행 ID" value={safeValue(detail.examId)} />
                  <DetailField
                    label="상위 검사 실행 묶음 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                  <DetailField label="검사코드" value={safeValue(detail.detailCode)} />
                </DetailGrid>
              </Section>
            </Stack>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={handleCompleteWriting}
              disabled={updateLoading || isCompleted}
            >
              작성완료
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
