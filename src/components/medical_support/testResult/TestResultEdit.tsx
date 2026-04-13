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
import {
  formatActiveStatus,
  formatDateTime,
  getActiveStatusColor,
  getActiveStatusSx,
  safeValue,
} from "@/components/medical_support/common/ExamDisplay";
import { TestResultActions } from "@/features/medical_support/testResult/testResultSlice";
import type {
  TestResult,
  TestResultDetailData,
  TestResultDetailValue,
  TestResultUpdatePayload,
} from "@/features/medical_support/testResult/testResultType";
import { TEST_RESULT_TYPE_OPTIONS } from "@/features/medical_support/testResult/testResultType";
import type { AppDispatch, RootState } from "@/store/store";

type FieldInputType = "text" | "textarea" | "datetime-local" | "biopsyYn";

type DetailFieldConfig = {
  key: string;
  label: string;
  inputType?: FieldInputType;
};

type DraftState = {
  sourceKey: string;
  values: Record<string, string>;
};

const TYPE_DETAIL_FIELDS: Record<string, DetailFieldConfig[]> = {
  IMAGING: [],
  SPECIMEN: [
    { key: "resultItemCode", label: "결과 항목 코드" },
    { key: "unit", label: "단위" },
    { key: "referenceRange", label: "참고범위" },
    { key: "judgement", label: "판정" },
  ],
  PATHOLOGY: [
    { key: "judgedAt", label: "판정일시", inputType: "datetime-local" },
    { key: "diagnosisName", label: "진단명" },
  ],
  ENDOSCOPY: [
    { key: "biopsyYn", label: "생검 여부", inputType: "biopsyYn" },
    { key: "readerId", label: "판독자 ID" },
  ],
  PHYSIOLOGICAL: [
    { key: "report", label: "보고서", inputType: "textarea" },
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

const toDateTimeInputValue = (value?: string | null) => {
  const normalized = value?.trim();
  if (!normalized) return "";

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
    if (normalized === "Y" || normalized === "YES" || normalized === "TRUE") {
      return "Y";
    }
    if (normalized === "N" || normalized === "NO" || normalized === "FALSE") {
      return "N";
    }
    return normalized;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const toNullableText = (value: string) => {
  const normalized = value.trim();
  return normalized || null;
};

const buildDetailFieldConfigs = (
  resultType: string,
  detail: TestResultDetailData | null | undefined
): DetailFieldConfig[] => {
  const knownFields = TYPE_DETAIL_FIELDS[resultType];

  if (knownFields) {
    return knownFields;
  }

  return Object.keys(detail ?? {}).map((key) => ({
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

export default function TestResultEdit() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const resultId = getRouteParam(params?.resultId).trim();
  const resultType = (searchParams.get("resultType") ?? "").trim().toUpperCase();
  const listHref = resultType
    ? `/medical_support/testResult/list?resultType=${encodeURIComponent(
        resultType
      )}&includeInactive=true`
    : "/medical_support/testResult/list";
  const detailHref =
    resultId && resultType
      ? `/medical_support/testResult/detail/${encodeURIComponent(
          resultId
        )}?resultType=${encodeURIComponent(resultType)}`
      : "/medical_support/testResult/list";

  const pendingSuccessMessageRef = useRef<string | null>(null);
  const [draftState, setDraftState] = useState<DraftState>({
    sourceKey: "",
    values: {},
  });

  const {
    detail,
    detailLoading,
    detailError,
    updateLoading,
    updateError,
    updateSuccess,
  } = useSelector((state: RootState) => state.testResults);

  const sourceKey = `${resultType}:${resultId}:${detail?.resultId ?? ""}:${
    detail?.resultAt ?? ""
  }:${
    detail?.status ?? ""
  }:${
    detail?.resultManagerId ?? ""
  }:${
    detail?.resultManagerName ?? ""
  }`;
  const draftValues = draftState.sourceKey === sourceKey ? draftState.values : {};
  const detailFields = useMemo(
    () => buildDetailFieldConfigs(resultType, detail?.detail),
    [detail?.detail, resultType]
  );
  const confirmedAtInitial = toDateTimeInputValue(detail?.resultAt);
  const confirmedAtValue = draftValues.confirmedAt ?? confirmedAtInitial;
  const resultManagerIdInitial =
    detail?.resultManagerId === null || detail?.resultManagerId === undefined
      ? ""
      : String(detail.resultManagerId);
  const resultManagerIdValue =
    draftValues.resultManagerId ?? resultManagerIdInitial;
  const resultManagerNameInitial = detail?.resultManagerName ?? "";
  const resultManagerNameValue =
    draftValues.resultManagerName ?? resultManagerNameInitial;
  const initialStatus = normalizeStatus(detail?.status);
  const draftStatus = normalizeStatus(draftValues.status ?? initialStatus);
  const nextStatus = draftStatus === "INACTIVE" ? "ACTIVE" : "INACTIVE";
  const toggleStatusLabel =
    nextStatus === "INACTIVE" ? "비활성화" : "활성화";
  const isSpecimenResult = resultType === "SPECIMEN";

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
    if (!updateSuccess) return;

    const message =
      pendingSuccessMessageRef.current ?? "검사 결과가 수정되었습니다.";

    alert(message);
    pendingSuccessMessageRef.current = null;
    dispatch(TestResultActions.resetUpdateSuccess());
    router.push(listHref);
  }, [dispatch, listHref, router, updateSuccess]);

  useEffect(() => {
    if (!updateError) return;

    pendingSuccessMessageRef.current = null;
    alert(updateError);
  }, [updateError]);

  const updateDraftValue = (key: string, value: string) => {
    setDraftState((current) => {
      const currentValues = current.sourceKey === sourceKey ? current.values : {};
      return {
        sourceKey,
        values: {
          ...currentValues,
          [key]: value,
        },
      };
    });
  };

  const getDetailFieldValue = (field: DetailFieldConfig) => {
    const initialValue = toEditableValue(
      detail?.detail?.[field.key],
      field.inputType
    );
    return draftValues[field.key] ?? initialValue;
  };

  const buildChangedDetail = () => {
    const changedDetail: TestResultDetailData = {};

    detailFields.forEach((field) => {
      const initialValue = toEditableValue(
        detail?.detail?.[field.key],
        field.inputType
      );
      const currentValue = getDetailFieldValue(field);

      if (currentValue !== initialValue) {
        changedDetail[field.key] = currentValue;
      }
    });

    return changedDetail;
  };

  const submitUpdate = (form: TestResultUpdatePayload) => {
    if (!resultId || !resultType || updateLoading) return;

    dispatch(
      TestResultActions.updateTestResultRequest({
        resultType,
        resultId,
        form,
      })
    );
  };

  const handleToggleStatus = () => {
    if (!detail || updateLoading) return;

    updateDraftValue("status", nextStatus);
  };

  const handleSubmit = () => {
    if (!detail || updateLoading) return;

    const changedDetail = buildChangedDetail();
    const form: TestResultUpdatePayload = {};

    if (draftStatus !== initialStatus) {
      form.status = draftStatus;
    }

    if (
      !isSpecimenResult &&
      confirmedAtValue &&
      confirmedAtValue !== confirmedAtInitial
    ) {
      form.confirmedAt = confirmedAtValue;
    }

    if (resultManagerIdValue !== resultManagerIdInitial) {
      form.resultManagerId = toNullableText(resultManagerIdValue);
    }

    if (resultManagerNameValue !== resultManagerNameInitial) {
      form.resultManagerName = toNullableText(resultManagerNameValue);
    }

    if (Object.keys(changedDetail).length > 0) {
      form.detail = changedDetail;
    }

    if (Object.keys(form).length === 0) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    pendingSuccessMessageRef.current = "검사 결과가 수정되었습니다.";
    submitUpdate(form);
  };

  const renderDetailInput = (field: DetailFieldConfig) => {
    const value = getDetailFieldValue(field);

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
        minRows={field.inputType === "textarea" ? 3 : undefined}
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
                검사 결과의 관리 정보와 타입별 상세 정보를 수정합니다.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button component={Link} href={detailHref} variant="outlined" size="small">
                상세로
              </Button>
              <Button
                variant="outlined"
                color={nextStatus === "INACTIVE" ? "warning" : "success"}
                size="small"
                onClick={handleToggleStatus}
                disabled={updateLoading}
              >
                {toggleStatusLabel}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                disabled={updateLoading}
              >
                수정완료
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
              <FieldGrid>
                <InfoField
                  label="검사종류"
                  value={getResultTypeLabel(detail, resultType)}
                />
                <InfoField label="결과 ID" value={safeValue(detail.resultId)} />
                <InfoField label="환자명" value={safeValue(detail.patientName)} />
                <InfoField label="진료과" value={safeValue(detail.departmentName)} />
                <InfoField
                  label="검사수행자"
                  value={safeValue(detail.performerName ?? detail.performerId)}
                />
                <InfoField
                  label="현재 상태"
                  value={
                    <Chip
                      label={formatActiveStatus(draftStatus)}
                      color={getActiveStatusColor(draftStatus)}
                      size="small"
                      sx={getActiveStatusSx(draftStatus)}
                    />
                  }
                />
                {!isSpecimenResult ? (
                  <InfoField
                    label="현재 검사일시"
                    value={formatDateTime(detail.resultAt)}
                  />
                ) : null}
              </FieldGrid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                수정 정보
              </Typography>
              <FieldGrid>
                {!isSpecimenResult ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="결과 확정 일시"
                    value={confirmedAtValue}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      updateDraftValue("confirmedAt", event.target.value)
                    }
                    disabled={updateLoading}
                  />
                ) : null}
                <TextField
                  fullWidth
                  size="small"
                  label="검사결과관리자 ID"
                  value={resultManagerIdValue}
                  onChange={(event) =>
                    updateDraftValue("resultManagerId", event.target.value)
                  }
                  disabled={updateLoading}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="검사결과관리자명"
                  value={resultManagerNameValue}
                  onChange={(event) =>
                    updateDraftValue("resultManagerName", event.target.value)
                  }
                  disabled={updateLoading}
                />
                {detailFields.map((field) => (
                  <Box key={field.key}>{renderDetailInput(field)}</Box>
                ))}
              </FieldGrid>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
