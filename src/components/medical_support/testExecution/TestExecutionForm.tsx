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
import type { TestExecution } from "@/features/medical_support/testExecution/testExecutionType";

type TestExecutionFormData = {
  testExecutionId: string;
  orderItemId: string;
  executionType: string;
  progressStatus: string;
  retryNo: string;
  startedAt: string;
  completedAt: string;
  performerId: string;
  updatedAt: string;
};

export type { TestExecutionFormData };

type Props = {
  mode: "create" | "edit";
  form: TestExecutionFormData;
  onChange: (form: TestExecutionFormData) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export const toTestExecutionFormData = (
  value?: Partial<TestExecution> | null
): TestExecutionFormData => ({
  testExecutionId: value?.testExecutionId ? String(value.testExecutionId) : "",
  orderItemId: value?.orderItemId ? String(value.orderItemId) : "",
  executionType: value?.executionType ?? "",
  progressStatus: value?.progressStatus ?? "",
  retryNo: value?.retryNo === 0 ? "0" : value?.retryNo ? String(value.retryNo) : "",
  startedAt: toDateTimeInputValue(value?.startedAt),
  completedAt: toDateTimeInputValue(value?.completedAt),
  performerId: value?.performerId ? String(value.performerId) : "",
  updatedAt: toDateTimeInputValue(value?.updatedAt),
});

const executionTypeOptions = [
  "SPECIMEN",
  "IMAGING",
  "PATHOLOGY",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
] as const;

const progressStatusOptions = [
  "WAITING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

const toDateTimeInputValue = (value?: string | null) => {
  const normalized = value?.trim();
  if (!normalized) return "";
  return normalized.replace(" ", "T").slice(0, 16);
};

const toNullableNumber = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const toNullableDateTime = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.length === 16 ? `${normalized}:00` : normalized;
};

export const toTestExecutionPayload = (
  form: TestExecutionFormData
): TestExecution => ({
  testExecutionId: form.testExecutionId.trim() || "",
  orderItemId: toNullableNumber(form.orderItemId),
  executionType: form.executionType.trim() || null,
  progressStatus: form.progressStatus.trim() || null,
  retryNo: toNullableNumber(form.retryNo),
  startedAt: toNullableDateTime(form.startedAt),
  completedAt: toNullableDateTime(form.completedAt),
  performerId: toNullableNumber(form.performerId),
  updatedAt: toNullableDateTime(form.updatedAt),
});

export default function TestExecutionForm({
  mode,
  form,
  onChange,
  onSubmit,
  loading = false,
}: Props) {
  const isEditMode = mode === "edit";

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
          <Typography variant="h6" fontWeight={700}>
            {isEditMode ? "검사 수행 수정" : "검사 수행 등록"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isEditMode
              ? "검사 수행 정보를 수정하고 저장할 수 있습니다."
              : "검사 수행 정보를 입력하고 등록할 수 있습니다."}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                기본 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                검사 수행 식별 정보와 진행 상태를 입력합니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="검사수행 ID"
                    value={form.testExecutionId}
                    onChange={handleChange("testExecutionId")}
                    size="small"
                    fullWidth
                    disabled={isEditMode}
                    helperText={
                      isEditMode
                        ? "수정 화면에서는 검사수행 ID를 변경하지 않습니다."
                        : "신규 등록 시 자동 생성이라면 비워둘 수 있습니다."
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
                    disabled={isEditMode}
                  />
                </Grid>
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
                    {executionTypeOptions.map((option) => (
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
                    {progressStatusOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                수행 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                수행자, 재시도 횟수, 시작 및 완료 일시를 입력합니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="수행자 ID"
                    value={form.performerId}
                    onChange={handleChange("performerId")}
                    size="small"
                    fullWidth
                  />
                </Grid>
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="시작일시"
                    type="datetime-local"
                    value={form.startedAt}
                    onChange={handleChange("startedAt")}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="완료일시"
                    type="datetime-local"
                    value={form.completedAt}
                    onChange={handleChange("completedAt")}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="수정일시"
                    type="datetime-local"
                    value={form.updatedAt}
                    onChange={handleChange("updatedAt")}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    helperText="보통 수정 화면에서만 확인 또는 조정합니다."
                  />
                </Grid>
              </Grid>
            </Box>

            <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button variant="contained" onClick={onSubmit} disabled={loading}>
                {loading ? "처리 중..." : isEditMode ? "수정 저장" : "등록"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
