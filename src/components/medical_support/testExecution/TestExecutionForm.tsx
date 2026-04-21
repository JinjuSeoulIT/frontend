"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  TEST_EXECUTION_TYPE_OPTIONS,
  type TestExecution,
  type TestExecutionUpdatePayload,
} from "@/features/medical_support/testExecution/testExecutionType";
import {
  isExamProgressDropdownLocked,
  normalizeExamProgressStatus,
} from "@/lib/medical_support/examProgressStatus";
import { StaffIdNameSelectFields } from "@/components/medical_support/common/StaffIdNameSelectFields";
import type { StaffOption } from "@/lib/medical_support/staffLookupApi";
import { fetchStaffOptionsApi } from "@/lib/medical_support/staffLookupApi";

const EXAM_PERFORMER_EXAM_TYPES = new Set([
  "IMAGING",
  "PATHOLOGY",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
  "SPECIMEN",
]);

type TestExecutionFormData = {
  testExecutionId: string;
  orderItemId: string;
  detailCode: string;
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
  performerId: string;
  performerName: string;
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

const allProgressStatuses: ProgressStatus[] = [
  "WAITING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

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
  detailCode: toTextValue(value?.detailCode),
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
  performerId: value?.performerId ? String(value.performerId) : "",
  performerName: toTextValue(value?.performerName),
});

export const toTestExecutionPayload = (
  form: TestExecutionFormData
): TestExecution => ({
  testExecutionId: form.testExecutionId.trim() || "",
  orderItemId: toNullableNumber(form.orderItemId),
  detailCode: toNullableText(form.detailCode),
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
  performerId: toNullableText(form.performerId),
  performerName: toNullableText(form.performerName),
});

export const toTestExecutionUpdatePayload = (
  form: TestExecutionFormData,
  source?: Partial<TestExecution> | null
): TestExecutionUpdatePayload => {
  const patientName = toNullableText(form.patientName);
  const departmentName = toNullableText(form.departmentName);
  const performerId = toNullableText(form.performerId);
  const performerName = toNullableText(form.performerName);

  return {
    progressStatus: form.progressStatus.trim() || null,
    status: toActiveStatusValue(form.status || source?.status),
    retryNo: toNullableNumber(form.retryNo),
    patientId: source?.patientId,
    patientName: patientName ?? source?.patientName ?? undefined,
    departmentName: departmentName ?? source?.departmentName ?? undefined,
    performerId: performerId ?? source?.performerId ?? undefined,
    performerName: performerName ?? source?.performerName ?? undefined,
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
  const progressDropdownLocked =
    loading || (isEditMode && isExamProgressDropdownLocked(form.progressStatus));

  const handleChange =
    (field: keyof TestExecutionFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...form,
        [field]: event.target.value,
      });
    };

  const showPatientNameField = isEditMode || Boolean(form.patientName);
  const showDepartmentField = isEditMode || Boolean(form.departmentName);
  const showDetailCodeField = isEditMode || Boolean(form.detailCode);
  const showHistorySection = isEditMode;

  const [performerStaffOptions, setPerformerStaffOptions] = useState<
    StaffOption[]
  >([]);

  useEffect(() => {
    if (!isEditMode) {
      setPerformerStaffOptions([]);
      return;
    }

    const executionKey = form.executionType.trim().toUpperCase();
    if (!executionKey) {
      setPerformerStaffOptions([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const fetchParams = EXAM_PERFORMER_EXAM_TYPES.has(executionKey)
        ? {
            role: "EXAM_PERFORMER",
            examType: executionKey,
          }
        : {
            role: "EXAM_RECEPTION_MANAGER",
          };

      const opts = await fetchStaffOptionsApi(fetchParams);
      if (!cancelled) {
        setPerformerStaffOptions(opts);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, form.executionType]);

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto", px: { xs: 2, md: 3 }, py: 3, pb: 2 }}>
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "#fff",
        }}
      >
        <CardContent sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
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
                  ? "검사 시작 전 필요한 식별 정보와 수행 상태를 확인하고 등록합니다."
                  : "검사 수행에 필요한 기본 정보와 상태를 입력합니다."}
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
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "#fff",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fafafa",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            기본 식별 정보
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            검사 수행과 오더를 식별하는 기준 정보를 확인합니다.
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gap: 1.75,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
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

            <TextField
              label="오더항목 ID"
              value={form.orderItemId}
              onChange={handleChange("orderItemId")}
              size="small"
              fullWidth
              {...(isEditMode ? readOnlyTextFieldProps : {})}
            />
          </Box>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "#fff",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fafafa",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            검사 및 환자 정보
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            검사 종류와 대상 환자 정보를 묶어서 확인합니다.
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gap: 1.75,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            {showDetailCodeField ? (
              <TextField
                label="검사코드"
                value={form.detailCode}
                size="small"
                fullWidth
                {...readOnlyTextFieldProps}
              />
            ) : null}

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

            {showPatientNameField ? (
              <TextField
                label="환자명"
                value={form.patientName}
                size="small"
                fullWidth
                {...readOnlyTextFieldProps}
              />
            ) : null}

            {showDepartmentField ? (
              <TextField
                label="진료과"
                value={form.departmentName}
                size="small"
                fullWidth
                {...readOnlyTextFieldProps}
              />
            ) : null}
          </Box>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "#fff",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fafafa",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            수행 상태 및 담당자 정보
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            검사실 접수 담당자는 진료 오더 의사와 자동으로 채워지지 않을 수 있습니다. 접수
            업무 처리 후 실제 접수 담당 직원 정보를 입력해 주세요.
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gap: 1.75,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            <TextField
              select
              label="진행상태"
              value={form.progressStatus}
              onChange={handleChange("progressStatus")}
              size="small"
              fullWidth
              disabled={progressDropdownLocked}
              helperText={
                isEditMode && isExamProgressDropdownLocked(form.progressStatus)
                  ? "대기중일 때만 직접 변경할 수 있습니다. 그 외는 하단 버튼을 사용하세요."
                  : undefined
              }
            >
              {!isEditMode ? <MenuItem value="">선택</MenuItem> : null}
              {(isEditMode ? allProgressStatuses : (["WAITING", "IN_PROGRESS"] as const)).map(
                (option) => {
                  const optionKey = option as ProgressStatus;
                  const greyOutTerminalInWaiting =
                    isEditMode &&
                    !progressDropdownLocked &&
                    normalizeExamProgressStatus(form.progressStatus) === "WAITING" &&
                    (optionKey === "COMPLETED" || optionKey === "CANCELLED");
                  return (
                    <MenuItem key={option} value={option} disabled={greyOutTerminalInWaiting}>
                      {progressStatusOptionLabels[optionKey]}
                    </MenuItem>
                  );
                }
              )}
            </TextField>

            {isEditMode ? (
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
            ) : null}

            <TextField
              label="재시도횟수"
              value={form.retryNo}
              onChange={handleChange("retryNo")}
              size="small"
              fullWidth
              inputProps={{ inputMode: "numeric", min: 0 }}
            />

            {isEditMode ? (
              <>
                <StaffIdNameSelectFields
                  staffOptions={performerStaffOptions}
                  staffId={form.performerId}
                  fullName={form.performerName}
                  onChange={(next) =>
                    onChange({
                      ...form,
                      performerId: next.staffId,
                      performerName: next.fullName,
                    })
                  }
                  idLabel="검사접수담당자 ID"
                  nameLabel="검사접수담당자"
                  disabled={loading}
                  idHelperText="진료 의사 ID가 아닙니다. 검사실에서 접수를 처리한 직원의 사용자 ID입니다."
                  nameHelperText="비어 있으면 접수 담당이 아직 확정되지 않은 상태로 볼 수 있습니다."
                />
              </>
            ) : null}
          </Box>
        </CardContent>
      </Card>

      {showHistorySection ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2,
              borderBottom: "1px solid",
              borderColor: "grey.200",
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              처리 및 이력 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              생성과 수정 이력은 시작 화면에서 조회 전용으로 제공합니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gap: 1.75,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
              }}
            >
              <TextField
                label="생성일시"
                value={formatReadOnlyDateTime(form.createdAt)}
                size="small"
                fullWidth
                {...readOnlyTextFieldProps}
              />

              <TextField
                label="수정일시"
                value={formatReadOnlyDateTime(form.updatedAt)}
                size="small"
                fullWidth
                {...readOnlyTextFieldProps}
                helperText="감사 이력 컬럼으로 시작 화면에서는 읽기 전용입니다."
              />
            </Box>
          </CardContent>
        </Card>
      ) : null}

      <Box
        sx={{
          position: "sticky",
          bottom: 16,
          zIndex: 20,
          mt: 2,
        }}
      >
        <Card
          elevation={6}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
          }}
        >
          <CardContent
            sx={{
              px: { xs: 2, md: 2.5 },
              py: 1.5,
              "&:last-child": { pb: 1.5 },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              gap={1.5}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  작업 실행
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  접수 담당 정보는 검사실 업무 후 저장하는 것을 권장합니다.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
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
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
