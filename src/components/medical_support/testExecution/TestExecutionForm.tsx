"use client";

import type { ChangeEvent } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  TEST_EXECUTION_TYPE_OPTIONS,
  type TestExecution,
  type TestExecutionUpdatePayload,
} from "@/features/medical_support/testExecution/testExecutionType";

type TestExecutionFormData = {
  testExecutionId: string;
  orderItemId: string;
  patientId: string;
  patientName: string;
  departmentName: string;
  executionType: string;
  progressStatus: string;
  status: string;
  retryNo: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string;
  completedAt: string;
};

export type { TestExecutionFormData };

type Props = {
  mode: "create" | "edit";
  form: TestExecutionFormData;
  onChange: (form: TestExecutionFormData) => void;
  onSubmit: () => void;
  onNavigateList?: () => void;
  onCancelExecution?: () => void;
  onToggleActiveStatus?: () => void;
  toggleActiveStatusLabel?: string;
  toggleActiveStatusDisabled?: boolean;
  cancelExecutionDisabled?: boolean;
  submitDisabled?: boolean;
  loading?: boolean;
};

type ProgressStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

const editableProgressStatusOptions = ["WAITING", "IN_PROGRESS"] as const;

const progressStatusOptionLabels: Record<ProgressStatus, string> = {
  WAITING: "대기중",
  IN_PROGRESS: "검사중",
  COMPLETED: "검사완료",
  CANCELLED: "취소",
};

const toTextValue = (value?: string | null) => value?.trim() ?? "";

const toDateTimeInputValue = (value?: string | null) => {
  const normalized = value?.trim();
  if (!normalized) return "";
  return normalized.replace(" ", "T").slice(0, 16);
};

const formatReadOnlyDateTime = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return "-";

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return normalized.replace("T", " ");
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

const toNullableNumber = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const toNullableText = (value: string) => {
  const normalized = value.trim();
  return normalized || null;
};

const toNullableDateTime = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.length === 16 ? `${normalized}:00` : normalized;
};

const toActiveStatusValue = (value?: string | null) => {
  const normalized = value?.trim().toUpperCase() ?? "";
  return normalized === "INACTIVE" ? "INACTIVE" : "ACTIVE";
};

export const toTestExecutionFormData = (
  value?: Partial<TestExecution> | null
): TestExecutionFormData => ({
  testExecutionId: value?.testExecutionId ? String(value.testExecutionId) : "",
  orderItemId: value?.orderItemId ? String(value.orderItemId) : "",
  patientId: value?.patientId ? String(value.patientId) : "",
  patientName: toTextValue(value?.patientName),
  departmentName: toTextValue(value?.departmentName),
  executionType: value?.executionType ?? "",
  progressStatus: value?.progressStatus ?? "",
  status: toActiveStatusValue(value?.status),
  retryNo:
    value?.retryNo === 0 ? "0" : value?.retryNo ? String(value.retryNo) : "",
  createdAt: toDateTimeInputValue(value?.createdAt),
  updatedAt: toDateTimeInputValue(value?.updatedAt),
  startedAt: toDateTimeInputValue(value?.startedAt),
  completedAt: toDateTimeInputValue(value?.completedAt),
});

export const toTestExecutionPayload = (
  form: TestExecutionFormData
): TestExecution => ({
  testExecutionId: form.testExecutionId.trim() || "",
  orderItemId: toNullableNumber(form.orderItemId),
  patientId: toNullableText(form.patientId),
  patientName: toNullableText(form.patientName),
  departmentName: toNullableText(form.departmentName),
  executionType: form.executionType.trim() || null,
  progressStatus: form.progressStatus.trim() || null,
  status: toActiveStatusValue(form.status),
  retryNo: toNullableNumber(form.retryNo),
  createdAt: toNullableDateTime(form.createdAt),
  updatedAt: toNullableDateTime(form.updatedAt),
  startedAt: toNullableDateTime(form.startedAt),
  completedAt: toNullableDateTime(form.completedAt),
});

export const toTestExecutionUpdatePayload = (
  form: TestExecutionFormData,
  source?: Partial<TestExecution> | null
): TestExecutionUpdatePayload => {
  const patientName = toNullableText(form.patientName);
  const departmentName = toNullableText(form.departmentName);

  return {
    progressStatus: form.progressStatus.trim() || null,
    status: toActiveStatusValue(form.status || source?.status),
    retryNo: toNullableNumber(form.retryNo),
    patientId: source?.patientId,
    patientName: patientName ?? source?.patientName ?? undefined,
    departmentName: departmentName ?? source?.departmentName ?? undefined,
    performerId: source?.performerId,
  };
};

export default function TestExecutionForm({
  mode,
  form,
  onChange,
  onSubmit,
  onNavigateList,
  onCancelExecution,
  onToggleActiveStatus,
  toggleActiveStatusLabel,
  toggleActiveStatusDisabled = false,
  cancelExecutionDisabled = false,
  submitDisabled = false,
  loading = false,
}: Props) {
  const isEditMode = mode === "edit";
  const readOnlyTextFieldProps = {
    InputProps: { readOnly: true },
  } as const;
  const normalizedProgressStatus = form.progressStatus.trim().toUpperCase();
  const shouldShowReadOnlyStatus =
    Boolean(normalizedProgressStatus) &&
    !editableProgressStatusOptions.includes(
      normalizedProgressStatus as (typeof editableProgressStatusOptions)[number]
    );
  const visibleProgressStatusOptions = shouldShowReadOnlyStatus
    ? [
        normalizedProgressStatus as ProgressStatus,
        ...editableProgressStatusOptions,
      ]
    : [...editableProgressStatusOptions];

  const handleChange =
    (field: keyof TestExecutionFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...form,
        [field]: event.target.value,
      });
    };

  return (
    <Box sx={{ px: 3, py: 3, maxWidth: 1040, mx: "auto" }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "grey.200",
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
                검사 수행 등록
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {isEditMode
                  ? "검사 시작 전 식별 정보와 진행 상태를 확인하고 필요한 값만 등록합니다."
                  : "검사 수행 정보를 입력하고 등록합니다."}
              </Typography>
            </Box>

            {isEditMode ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {onToggleActiveStatus && toggleActiveStatusLabel ? (
                  <Button
                    variant="outlined"
                    size="small"
                    color={toggleActiveStatusLabel === "활성화" ? "success" : "warning"}
                    onClick={onToggleActiveStatus}
                    disabled={loading || toggleActiveStatusDisabled}
                  >
                    {toggleActiveStatusLabel}
                  </Button>
                ) : null}
                {onNavigateList ? (
                  <Button variant="outlined" size="small" onClick={onNavigateList}>
                    목록으로
                  </Button>
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                기본 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                공통 식별 정보와 업무 식별 정보를 확인합니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="검사수행 ID"
                    value={form.testExecutionId}
                    onChange={handleChange("testExecutionId")}
                    size="small"
                    fullWidth
                    {...(isEditMode ? readOnlyTextFieldProps : {})}
                    helperText={
                      isEditMode
                        ? "시작 화면에서는 검사수행 ID를 변경하지 않습니다."
                        : "자동 생성되면 비워둬도 됩니다."
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="오더항목 ID"
                    value={form.orderItemId}
                    onChange={handleChange("orderItemId")}
                    size="small"
                    fullWidth
                    {...(isEditMode ? readOnlyTextFieldProps : {})}
                  />
                </Grid>

                {isEditMode && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="환자명"
                      value={form.patientName}
                      size="small"
                      fullWidth
                      {...readOnlyTextFieldProps}
                    />
                  </Grid>
                )}

                {isEditMode && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="진료과"
                      value={form.departmentName}
                      size="small"
                      fullWidth
                      {...readOnlyTextFieldProps}
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="검사유형"
                    value={form.executionType}
                    onChange={handleChange("executionType")}
                    size="small"
                    fullWidth
                    disabled={isEditMode}
                  >
                    <MenuItem value="">선택</MenuItem>
                    {TEST_EXECUTION_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="진행상태"
                    value={form.progressStatus}
                    onChange={handleChange("progressStatus")}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="">선택</MenuItem>
                    {visibleProgressStatusOptions.map((option) => {
                      const isReadOnlyStatus =
                        !editableProgressStatusOptions.includes(
                          option as (typeof editableProgressStatusOptions)[number]
                        );

                      return (
                        <MenuItem key={option} value={option} disabled={isReadOnlyStatus}>
                          {progressStatusOptionLabels[option]}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>
                {isEditMode && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      label="활성여부"
                      value={form.status}
                      onChange={handleChange("status")}
                      size="small"
                      fullWidth
                      helperText="비활성 상태에서는 검사 시작이 제한됩니다."
                    >
                      <MenuItem value="ACTIVE">활성</MenuItem>
                      <MenuItem value="INACTIVE">비활성</MenuItem>
                    </TextField>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                처리 및 이력 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                진행상태와 재시도 횟수는 조정할 수 있고, 나머지 이력 컬럼은 읽기 전용으로
                보여집니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="재시도횟수"
                    value={form.retryNo}
                    onChange={handleChange("retryNo")}
                    size="small"
                    fullWidth
                    inputProps={{ inputMode: "numeric", min: 0 }}
                  />
                </Grid>

                {isEditMode && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="생성일시"
                      value={formatReadOnlyDateTime(form.createdAt)}
                      size="small"
                      fullWidth
                      {...readOnlyTextFieldProps}
                    />
                  </Grid>
                )}

                {isEditMode && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="수정일시"
                      value={formatReadOnlyDateTime(form.updatedAt)}
                      size="small"
                      fullWidth
                      {...readOnlyTextFieldProps}
                      helperText="감사 이력 컬럼으로 시작 화면에서는 읽기 전용입니다."
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
              {isEditMode && onCancelExecution ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={onCancelExecution}
                  disabled={loading || cancelExecutionDisabled}
                >
                  검사 취소
                </Button>
              ) : null}
              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={loading || submitDisabled}
              >
                {loading
                  ? isEditMode
                    ? "검사 시작 준비 중..."
                    : "등록 중..."
                  : isEditMode
                    ? "검사 시작"
                    : "등록"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
