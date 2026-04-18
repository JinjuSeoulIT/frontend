"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { TestResultActions } from "@/features/medical_support/testResult/testResultSlice";
import type {
  TestResult,
  TestResultDetailData,
  TestResultDetailValue,
  TestResultUpdatePayload,
} from "@/features/medical_support/testResult/testResultType";
import {
  TEST_RESULT_STATUS_OPTIONS,
  TEST_RESULT_TYPE_OPTIONS,
} from "@/features/medical_support/testResult/testResultType";
import type { AppDispatch, RootState } from "@/store/store";

type FieldInputType = "text" | "textarea" | "datetime-local" | "biopsyYn";

type DetailFieldConfig = {
  key: string;
  label: string;
  inputType?: FieldInputType;
};

const TYPE_DETAIL_FIELDS: Record<string, DetailFieldConfig[]> = {
  IMAGING: [
    { key: "readingDetail", label: "영상 판독 본문", inputType: "textarea" },
  ],
  SPECIMEN: [
    { key: "resultItemCode", label: "검사 항목 코드" },
    { key: "unit", label: "결과 단위" },
    { key: "referenceRange", label: "참고치 범위" },
    { key: "judgement", label: "판정값" },
  ],
  PATHOLOGY: [
    { key: "judgedAt", label: "병리 판정 시각", inputType: "datetime-local" },
    { key: "diagnosisName", label: "병리 진단명" },
  ],
  ENDOSCOPY: [
    { key: "biopsyYn", label: "조직검사 여부", inputType: "biopsyYn" },
  ],
  PHYSIOLOGICAL: [
    { key: "report", label: "검사 리포트 본문", inputType: "textarea" },
    { key: "measuredItemCode", label: "측정 항목 코드" },
  ],
};

const getRouteParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const normalizeStatus = (value?: string | null) =>
  value?.trim().toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";

const normalizeProgressStatus = (value?: string | null) =>
  value?.trim().toUpperCase() === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";

const normalizeValue = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

const safeValue = (value?: TestResultDetailValue) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const text = String(value).trim();
  return text || "-";
};

const formatDateTime = (value?: string | null) => {
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
};

const toDateTimeInputValue = (value?: string | null) => {
  const normalized = value?.trim();
  if (!normalized) {
    return "";
  }

  return normalized.replace(" ", "T").slice(0, 16);
};

const toEditableValue = (
  value: TestResultDetailValue,
  inputType?: FieldInputType
) => {
  if (inputType === "datetime-local") {
    return toDateTimeInputValue(value == null ? null : String(value));
  }

  if (inputType === "biopsyYn") {
    const normalized = String(value ?? "").trim().toUpperCase();

    if (["Y", "YES", "TRUE"].includes(normalized)) {
      return "Y";
    }

    if (["N", "NO", "FALSE"].includes(normalized)) {
      return "N";
    }

    return normalized;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const buildDetailFieldConfigs = (
  resultType: string,
  detail: TestResultDetailData | null | undefined
): DetailFieldConfig[] => {
  const knownFields = TYPE_DETAIL_FIELDS[resultType];

  if (knownFields) {
    return knownFields;
  }

  return Object.keys(detail ?? {})
    .filter((key) => key !== "resultSummary")
    .map((key) => ({
      key,
      label: key,
    }));
};

const getResultTypeLabel = (item: TestResult | null, resultType: string) => {
  const resultTypeName = item?.resultTypeName?.trim();
  if (resultTypeName) {
    return `${resultTypeName} (${resultType})`;
  }

  const option = TEST_RESULT_TYPE_OPTIONS.find(
    (typeOption) => typeOption.value === resultType
  );

  return option ? `${option.label} (${resultType})` : safeValue(resultType);
};

const formatStatus = (value?: string | null) => {
  const normalized = normalizeValue(value);

  if (normalized === "ACTIVE") {
    return "활성";
  }

  if (normalized === "INACTIVE") {
    return "비활성";
  }

  return safeValue(value);
};

const getStatusColor = (value?: string | null) =>
  normalizeValue(value) === "ACTIVE" ? "success" : "default";

const formatProgressStatus = (value?: string | null) =>
  normalizeProgressStatus(value) === "COMPLETED"
    ? "결과작성완료"
    : "결과작성중";

const getProgressStatusColor = (value?: string | null) =>
  normalizeProgressStatus(value) === "COMPLETED" ? "success" : "warning";

const buildInitialValues = (
  detail: TestResult | null,
  detailFields: DetailFieldConfig[]
) => {
  if (!detail) {
    return {};
  }

  const values: Record<string, string> = {
    status: normalizeStatus(detail.status),
    progressStatus: normalizeProgressStatus(detail.progressStatus),
    confirmedAt: toDateTimeInputValue(detail.resultAt),
    resultManagerId:
      detail.resultManagerId === null || detail.resultManagerId === undefined
        ? ""
        : String(detail.resultManagerId),
    resultManagerName: detail.resultManagerName ?? "",
    resultSummary: detail.summary ?? "",
  };

  detailFields.forEach((field) => {
    values[field.key] = toEditableValue(
      detail.detail?.[field.key],
      field.inputType
    );
  });

  return values;
};

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>
        {typeof value === "string" || typeof value === "number" ? (
          <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}

function FieldGrid({ children }: { children: ReactNode }) {
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

export default function TestResultEdit() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const resultId = getRouteParam(params?.resultId).trim();
  const resultType = (searchParams.get("resultType") ?? "").trim().toUpperCase();
  const listHref = "/medical_support/testResult/list";
  const detailHref =
    resultId && resultType
      ? `/medical_support/testResult/detail/${encodeURIComponent(
          resultId
        )}?resultType=${encodeURIComponent(resultType)}`
      : "/medical_support/testResult/list";

  const pendingSuccessMessageRef = useRef<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const {
    detail,
    detailLoading,
    detailError,
    updateLoading,
    updateError,
    updateSuccess,
  } = useSelector((state: RootState) => state.testResults);

  const detailFields = useMemo(
    () => buildDetailFieldConfigs(resultType, detail?.detail),
    [detail?.detail, resultType]
  );
  const initialValues = useMemo(
    () => buildInitialValues(detail, detailFields),
    [detail, detailFields]
  );
  const currentStatus = draftValues.status ?? initialValues.status ?? "ACTIVE";
  const currentProgressStatus =
    draftValues.progressStatus ?? initialValues.progressStatus ?? "IN_PROGRESS";
  const isImaging = resultType === "IMAGING";
  const isSpecimen = resultType === "SPECIMEN";
  const isPathology = resultType === "PATHOLOGY";
  const isEndoscopy = resultType === "ENDOSCOPY";
  const isPhysiological = resultType === "PHYSIOLOGICAL";

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
    setDraftValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!updateSuccess) {
      return;
    }

    const message =
      pendingSuccessMessageRef.current ?? "검사 결과가 수정되었습니다.";

    alert(message);
    pendingSuccessMessageRef.current = null;
    dispatch(TestResultActions.resetUpdateSuccess());
    router.push(listHref);
  }, [dispatch, listHref, router, updateSuccess]);

  useEffect(() => {
    if (!updateError) {
      return;
    }

    pendingSuccessMessageRef.current = null;
    alert(updateError);
  }, [updateError]);

  const updateDraftValue = (key: string, value: string) => {
    setDraftValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const getValue = (key: string) => draftValues[key] ?? initialValues[key] ?? "";

  const buildChangedDetail = () => {
    const changedDetail: TestResultDetailData = {};

    if (getValue("resultSummary") !== (initialValues.resultSummary ?? "")) {
      changedDetail.resultSummary = getValue("resultSummary");
    }

    detailFields.forEach((field) => {
      const currentValue = getValue(field.key);
      const initialValue = initialValues[field.key] ?? "";

      if (currentValue !== initialValue) {
        changedDetail[field.key] = currentValue;
      }
    });

    return changedDetail;
  };

  const buildUpdateForm = (forceComplete = false): TestResultUpdatePayload | null => {
    const changedDetail = buildChangedDetail();
    const form: TestResultUpdatePayload = {};

    if (getValue("status") !== (initialValues.status ?? "ACTIVE")) {
      form.status = getValue("status");
    }

    if (getValue("confirmedAt") !== (initialValues.confirmedAt ?? "")) {
      form.confirmedAt = getValue("confirmedAt");
    }

    if (getValue("resultManagerId") !== (initialValues.resultManagerId ?? "")) {
      form.resultManagerId = getValue("resultManagerId");
    }

    if (
      getValue("resultManagerName") !== (initialValues.resultManagerName ?? "")
    ) {
      form.resultManagerName = getValue("resultManagerName");
    }

    if (
      forceComplete &&
      normalizeProgressStatus(initialValues.progressStatus) !== "COMPLETED"
    ) {
      form.progressStatus = "COMPLETED";
    }

    if (Object.keys(changedDetail).length > 0) {
      form.detail = changedDetail;
    }

    return Object.keys(form).length > 0 ? form : null;
  };

  const handleSubmit = () => {
    if (!detail || updateLoading || !resultId || !resultType) {
      return;
    }

    const form = buildUpdateForm();

    if (!form) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    pendingSuccessMessageRef.current = "검사 결과가 수정되었습니다.";
    dispatch(
      TestResultActions.updateTestResultRequest({
        resultType,
        resultId,
        form,
      })
    );
  };

  const handleCompleteWriting = () => {
    if (!detail || updateLoading || !resultId || !resultType) {
      return;
    }

    if (normalizeProgressStatus(initialValues.progressStatus) === "COMPLETED") {
      alert("이미 결과작성완료 상태입니다.");
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

  const renderDetailInput = (field: DetailFieldConfig) => {
    const value = getValue(field.key);

    if (field.inputType === "biopsyYn") {
      return (
        <FormControl fullWidth size="small">
          <InputLabel id={`test-result-${field.key}-label`}>
            {field.label}
          </InputLabel>
          <Select
            labelId={`test-result-${field.key}-label`}
            label={field.label}
            value={value}
            onChange={(event) =>
              updateDraftValue(field.key, String(event.target.value))
            }
            disabled={updateLoading}
          >
            <MenuItem value="">선택</MenuItem>
            <MenuItem value="Y">예</MenuItem>
            <MenuItem value="N">아니오</MenuItem>
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        type={field.inputType === "datetime-local" ? "datetime-local" : "text"}
        label={field.label}
        value={value}
        multiline={field.inputType === "textarea"}
        minRows={field.inputType === "textarea" ? 4 : undefined}
        InputLabelProps={
          field.inputType === "datetime-local" ? { shrink: true } : undefined
        }
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          updateDraftValue(field.key, event.target.value)
        }
        disabled={updateLoading}
      />
    );
  };

  if (!resultId || !resultType) {
    return (
      <Box sx={{ px: 3, py: 3, maxWidth: 1000, mx: "auto" }}>
        <Alert severity="error">
          검사 결과 수정에 필요한 정보가 없습니다.
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
      <Box sx={{ px: 3, py: 3, maxWidth: 1000, mx: "auto" }}>
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
      <Box sx={{ px: 3, py: 3, maxWidth: 1000, mx: "auto" }}>
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
                검사 결과 수정
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                통합 검사 결과의 공통 수정 필드와 도메인별 상세 필드를 수정합니다.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button component={Link} href={detailHref} variant="outlined" size="small">
                상세로
              </Button>
              <Button
                component={Link}
                href={listHref}
                variant="outlined"
                size="small"
              >
                목록으로
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                disabled={updateLoading}
              >
                수정 완료
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
                description="검사유형, 검사코드, 환자 및 수행 정보를 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <InfoField label="검사코드" value={safeValue(detail.detailCode)} />
                  <InfoField label="환자명" value={safeValue(detail.patientName)} />
                  <InfoField label="환자 ID" value={safeValue(detail.patientId)} />
                  <InfoField label="진료과" value={safeValue(detail.departmentName)} />
                  <InfoField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 수정 및 확인합니다."
              >
                <FieldGrid>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="결과등록일시"
                    value={getValue("confirmedAt")}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      updateDraftValue("confirmedAt", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <InfoField label="생성일시" value={formatDateTime(detail.createdAt)} />
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      검사결과관리자
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.75,
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, minmax(0, 1fr))",
                        },
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자 ID"
                        value={getValue("resultManagerId")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerId", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자명"
                        value={getValue("resultManagerName")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerName", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                    </Box>
                  </Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="test-result-status-label">상태</InputLabel>
                    <Select
                      labelId="test-result-status-label"
                      label="상태"
                      value={getValue("status")}
                      onChange={(event) =>
                        updateDraftValue("status", String(event.target.value))
                      }
                      disabled={updateLoading}
                    >
                      {TEST_RESULT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InfoField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(currentProgressStatus)}
                        color={getProgressStatusColor(currentProgressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="영상 판독 정보"
                description="실제 저장되는 결과 요약과 판독 본문을 수정합니다."
              >
                <FieldGrid>
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="결과 요약"
                      value={getValue("resultSummary")}
                      multiline
                      minRows={3}
                      onChange={(event) =>
                        updateDraftValue("resultSummary", event.target.value)
                      }
                      disabled={updateLoading}
                      helperText="저장 시 detail.resultSummary 필드로 전송됩니다."
                    />
                  </Box>
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="영상 판독 본문"
                      value={getValue("readingDetail")}
                      multiline
                      minRows={6}
                      onChange={(event) =>
                        updateDraftValue("readingDetail", event.target.value)
                      }
                      disabled={updateLoading}
                    />
                  </Box>
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 영상검사, 검사수행 식별값을 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField label="결과 ID" value={safeValue(detail.resultId)} />
                  <InfoField label="영상검사 ID" value={safeValue(detail.examId)} />
                  <InfoField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </FieldGrid>
              </SectionCard>
            </Stack>
          ) : isSpecimen ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <InfoField label="검사코드" value={safeValue(detail.detailCode)} />
                  <InfoField label="환자명" value={safeValue(detail.patientName)} />
                  <InfoField label="환자 ID" value={safeValue(detail.patientId)} />
                  <InfoField label="진료과" value={safeValue(detail.departmentName)} />
                  <InfoField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 수정 및 확인합니다."
              >
                <FieldGrid>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="결과등록일시"
                    value={getValue("confirmedAt")}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      updateDraftValue("confirmedAt", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <InfoField label="생성일시" value={formatDateTime(detail.createdAt)} />
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      검사결과관리자
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.75,
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, minmax(0, 1fr))",
                        },
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자 ID"
                        value={getValue("resultManagerId")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerId", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자명"
                        value={getValue("resultManagerName")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerName", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                    </Box>
                  </Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="test-result-status-label">상태</InputLabel>
                    <Select
                      labelId="test-result-status-label"
                      label="상태"
                      value={getValue("status")}
                      onChange={(event) =>
                        updateDraftValue("status", String(event.target.value))
                      }
                      disabled={updateLoading}
                    >
                      {TEST_RESULT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InfoField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(currentProgressStatus)}
                        color={getProgressStatusColor(currentProgressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="검체검사 결과 정보"
                description="결과 요약과 검체검사 항목별 값을 수정합니다."
              >
                <FieldGrid>
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="결과 요약"
                      value={getValue("resultSummary")}
                      multiline
                      minRows={3}
                      onChange={(event) =>
                        updateDraftValue("resultSummary", event.target.value)
                      }
                      disabled={updateLoading}
                      helperText="저장 시 detail.resultSummary 필드로 전송됩니다."
                    />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    label="검사 항목 코드"
                    value={getValue("resultItemCode")}
                    onChange={(event) =>
                      updateDraftValue("resultItemCode", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="결과 단위"
                    value={getValue("unit")}
                    onChange={(event) =>
                      updateDraftValue("unit", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="참고치 범위"
                    value={getValue("referenceRange")}
                    onChange={(event) =>
                      updateDraftValue("referenceRange", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="판정값"
                    value={getValue("judgement")}
                    onChange={(event) =>
                      updateDraftValue("judgement", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 검체검사, 검사수행 식별값을 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField label="결과 ID" value={safeValue(detail.resultId)} />
                  <InfoField label="검체검사 ID" value={safeValue(detail.examId)} />
                  <InfoField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </FieldGrid>
              </SectionCard>
            </Stack>
          ) : isPathology ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <InfoField label="검사코드" value={safeValue(detail.detailCode)} />
                  <InfoField label="환자명" value={safeValue(detail.patientName)} />
                  <InfoField label="환자 ID" value={safeValue(detail.patientId)} />
                  <InfoField label="진료과" value={safeValue(detail.departmentName)} />
                  <InfoField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 수정 및 확인합니다."
              >
                <FieldGrid>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="결과등록일시"
                    value={getValue("confirmedAt")}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      updateDraftValue("confirmedAt", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <InfoField label="생성일시" value={formatDateTime(detail.createdAt)} />
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      검사결과관리자
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.75,
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, minmax(0, 1fr))",
                        },
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자 ID"
                        value={getValue("resultManagerId")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerId", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자명"
                        value={getValue("resultManagerName")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerName", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                    </Box>
                  </Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="test-result-status-label">상태</InputLabel>
                    <Select
                      labelId="test-result-status-label"
                      label="상태"
                      value={getValue("status")}
                      onChange={(event) =>
                        updateDraftValue("status", String(event.target.value))
                      }
                      disabled={updateLoading}
                    >
                      {TEST_RESULT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InfoField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(currentProgressStatus)}
                        color={getProgressStatusColor(currentProgressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="병리 판정 정보"
                description="결과 요약과 병리 판정 정보를 수정합니다."
              >
                <FieldGrid>
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="결과 요약"
                      value={getValue("resultSummary")}
                      multiline
                      minRows={3}
                      onChange={(event) =>
                        updateDraftValue("resultSummary", event.target.value)
                      }
                      disabled={updateLoading}
                      helperText="저장 시 detail.resultSummary 필드로 전송됩니다."
                    />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="병리판정일시"
                    value={getValue("judgedAt")}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      updateDraftValue("judgedAt", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="병리진단명"
                    value={getValue("diagnosisName")}
                    onChange={(event) =>
                      updateDraftValue("diagnosisName", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 병리검사, 검사수행 식별값을 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField label="결과 ID" value={safeValue(detail.resultId)} />
                  <InfoField label="병리검사 ID" value={safeValue(detail.examId)} />
                  <InfoField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </FieldGrid>
              </SectionCard>
            </Stack>
          ) : isEndoscopy ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <InfoField label="검사코드" value={safeValue(detail.detailCode)} />
                  <InfoField label="환자명" value={safeValue(detail.patientName)} />
                  <InfoField label="환자 ID" value={safeValue(detail.patientId)} />
                  <InfoField label="진료과" value={safeValue(detail.departmentName)} />
                  <InfoField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 수정 및 확인합니다."
              >
                <FieldGrid>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="결과등록일시"
                    value={getValue("confirmedAt")}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      updateDraftValue("confirmedAt", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <InfoField label="생성일시" value={formatDateTime(detail.createdAt)} />
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      검사결과관리자
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.75,
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, minmax(0, 1fr))",
                        },
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자 ID"
                        value={getValue("resultManagerId")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerId", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자명"
                        value={getValue("resultManagerName")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerName", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                    </Box>
                  </Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="test-result-status-label">상태</InputLabel>
                    <Select
                      labelId="test-result-status-label"
                      label="상태"
                      value={getValue("status")}
                      onChange={(event) =>
                        updateDraftValue("status", String(event.target.value))
                      }
                      disabled={updateLoading}
                    >
                      {TEST_RESULT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InfoField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(currentProgressStatus)}
                        color={getProgressStatusColor(currentProgressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="내시경 결과 정보"
                description="결과 요약과 내시경 결과 정보를 수정합니다."
              >
                <FieldGrid>
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="결과 요약"
                      value={getValue("resultSummary")}
                      multiline
                      minRows={3}
                      onChange={(event) =>
                        updateDraftValue("resultSummary", event.target.value)
                      }
                      disabled={updateLoading}
                      helperText="저장 시 detail.resultSummary 필드로 전송됩니다."
                    />
                  </Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="test-result-biopsy-yn-label">
                      조직검사 여부
                    </InputLabel>
                    <Select
                      labelId="test-result-biopsy-yn-label"
                      label="조직검사 여부"
                      value={getValue("biopsyYn")}
                      onChange={(event) =>
                        updateDraftValue("biopsyYn", String(event.target.value))
                      }
                      disabled={updateLoading}
                    >
                      <MenuItem value="">선택</MenuItem>
                      <MenuItem value="Y">예</MenuItem>
                      <MenuItem value="N">아니오</MenuItem>
                    </Select>
                  </FormControl>
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 내시경검사, 검사수행 식별값을 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField label="결과 ID" value={safeValue(detail.resultId)} />
                  <InfoField label="내시경검사 ID" value={safeValue(detail.examId)} />
                  <InfoField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </FieldGrid>
              </SectionCard>
            </Stack>
          ) : isPhysiological ? (
            <Stack spacing={3}>
              <SectionCard
                title="기본 정보"
                description="검사유형, 검사코드, 환자 및 수행 정보를 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField
                    label="검사유형"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <InfoField label="검사코드" value={safeValue(detail.detailCode)} />
                  <InfoField label="환자명" value={safeValue(detail.patientName)} />
                  <InfoField label="환자 ID" value={safeValue(detail.patientId)} />
                  <InfoField label="진료과" value={safeValue(detail.departmentName)} />
                  <InfoField
                    label="검사수행자"
                    value={formatNameWithId(detail.performerName, detail.performerId)}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="결과 관리 정보"
                description="결과등록일시, 생성일시, 검사결과관리자와 상태를 수정 및 확인합니다."
              >
                <FieldGrid>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="결과등록일시"
                    value={getValue("confirmedAt")}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      updateDraftValue("confirmedAt", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <InfoField label="생성일시" value={formatDateTime(detail.createdAt)} />
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      검사결과관리자
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.75,
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, minmax(0, 1fr))",
                        },
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자 ID"
                        value={getValue("resultManagerId")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerId", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="관리자명"
                        value={getValue("resultManagerName")}
                        onChange={(event) =>
                          updateDraftValue("resultManagerName", event.target.value)
                        }
                        disabled={updateLoading}
                      />
                    </Box>
                  </Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="test-result-status-label">상태</InputLabel>
                    <Select
                      labelId="test-result-status-label"
                      label="상태"
                      value={getValue("status")}
                      onChange={(event) =>
                        updateDraftValue("status", String(event.target.value))
                      }
                      disabled={updateLoading}
                    >
                      {TEST_RESULT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InfoField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(currentProgressStatus)}
                        color={getProgressStatusColor(currentProgressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="생리기능검사 결과 정보"
                description="결과 요약과 생리기능검사 결과 정보를 수정합니다."
              >
                <FieldGrid>
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="결과 요약"
                      value={getValue("resultSummary")}
                      multiline
                      minRows={3}
                      onChange={(event) =>
                        updateDraftValue("resultSummary", event.target.value)
                      }
                      disabled={updateLoading}
                      helperText="저장 시 detail.resultSummary 필드로 전송됩니다."
                    />
                  </Box>
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="검사 리포트 본문"
                      value={getValue("report")}
                      multiline
                      minRows={6}
                      onChange={(event) =>
                        updateDraftValue("report", event.target.value)
                      }
                      disabled={updateLoading}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    label="측정 항목 코드"
                    value={getValue("measuredItemCode")}
                    onChange={(event) =>
                      updateDraftValue("measuredItemCode", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard
                title="식별 정보"
                description="결과, 생리기능검사, 검사수행 식별값을 읽기 전용으로 확인합니다."
              >
                <FieldGrid>
                  <InfoField label="결과 ID" value={safeValue(detail.resultId)} />
                  <InfoField
                    label="생리기능검사 ID"
                    value={safeValue(detail.examId)}
                  />
                  <InfoField
                    label="검사수행 ID"
                    value={safeValue(detail.testExecutionId)}
                  />
                </FieldGrid>
              </SectionCard>
            </Stack>
          ) : (
            <Stack spacing={4}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  기본 정보
                </Typography>
                <FieldGrid>
                  <InfoField
                    label="검사 종류"
                    value={getResultTypeLabel(detail, resultType)}
                  />
                  <InfoField label="결과 ID" value={safeValue(detail.resultId)} />
                  <InfoField label="환자명" value={safeValue(detail.patientName)} />
                  <InfoField label="진료과" value={safeValue(detail.departmentName)} />
                  <InfoField
                    label="검사 시행자"
                    value={safeValue(detail.performerName ?? detail.performerId)}
                  />
                  <InfoField
                    label="현재 상태"
                    value={
                      <Chip
                        label={formatStatus(currentStatus)}
                        color={getStatusColor(currentStatus)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <InfoField
                    label="현재 결과 확정 시각"
                    value={formatDateTime(detail.resultAt)}
                  />
                  <InfoField label="검사코드" value={safeValue(detail.detailCode)} />
                </FieldGrid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  공통 수정 정보
                </Typography>
                <FieldGrid>
                  <FormControl fullWidth size="small">
                    <InputLabel id="test-result-status-label">상태</InputLabel>
                    <Select
                      labelId="test-result-status-label"
                      label="상태"
                      value={getValue("status")}
                      onChange={(event) =>
                        updateDraftValue("status", String(event.target.value))
                      }
                      disabled={updateLoading}
                    >
                      {TEST_RESULT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InfoField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatProgressStatus(currentProgressStatus)}
                        color={getProgressStatusColor(currentProgressStatus)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="결과 확정 시각"
                    value={getValue("confirmedAt")}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      updateDraftValue("confirmedAt", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="결과 관리자 ID"
                    value={getValue("resultManagerId")}
                    onChange={(event) =>
                      updateDraftValue("resultManagerId", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="결과 관리자명"
                    value={getValue("resultManagerName")}
                    onChange={(event) =>
                      updateDraftValue("resultManagerName", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="결과 요약"
                      value={getValue("resultSummary")}
                      multiline
                      minRows={3}
                      onChange={(event) =>
                        updateDraftValue("resultSummary", event.target.value)
                      }
                      disabled={updateLoading}
                      helperText="저장 시 detail.resultSummary 필드로 전송됩니다."
                    />
                  </Box>
                </FieldGrid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  도메인별 상세 정보
                </Typography>
                {detailFields.length > 0 ? (
                  <FieldGrid>
                    {detailFields.map((field) => (
                      <Box
                        key={field.key}
                        sx={{
                          gridColumn:
                            field.inputType === "textarea"
                              ? { md: "1 / -1" }
                              : undefined,
                        }}
                      >
                        {renderDetailInput(field)}
                      </Box>
                    ))}
                  </FieldGrid>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                    수정할 상세 정보가 없습니다.
                  </Typography>
                )}
              </Box>
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
              disabled={
                updateLoading ||
                normalizeProgressStatus(initialValues.progressStatus) === "COMPLETED"
              }
            >
              작성완료
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
