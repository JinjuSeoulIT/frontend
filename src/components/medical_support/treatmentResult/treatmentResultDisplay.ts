import {
  formatActiveStatus,
  getActiveStatusColor,
  getActiveStatusSx,
  getProgressStatusColor,
  normalizeActiveStatus,
  normalizeProgressStatus,
  safeValue,
} from "@/components/medical_support/common/ExamDisplay";

const progressStatusSx = {
  fontWeight: 600,
} as const;

export const normalizeTreatmentResultProgressStatus = (value?: string | null) =>
  normalizeProgressStatus(value);

export const formatTreatmentResultProgressStatus = (value?: string | null) => {
  const normalized = normalizeProgressStatus(value);
  if (normalized === "WAITING" || normalized === "REQUESTED") return "요청";
  if (normalized === "IN_PROGRESS") return "진행중";
  if (normalized === "COMPLETED") return "완료";
  if (normalized === "CANCELLED") return "취소";
  return safeValue(value);
};

export const getTreatmentResultProgressStatusColor = (value?: string | null) =>
  getProgressStatusColor(value);

export const getTreatmentResultProgressStatusSx = () => progressStatusSx;

export const normalizeTreatmentResultActiveStatus = (value?: string | null) =>
  normalizeActiveStatus(value);

export const formatTreatmentResultActiveStatus = (value?: string | null) =>
  formatActiveStatus(value);

export const getTreatmentResultActiveStatusColor = (value?: string | null) =>
  getActiveStatusColor(value);

export const getTreatmentResultActiveStatusSx = (value?: string | null) =>
  getActiveStatusSx(value);

export const TREATMENT_RESULT_PROGRESS_STATUS_OPTIONS = [
  { value: "REQUESTED", label: "요청" },
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료" },
] as const;

export const TREATMENT_RESULT_ACTIVE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성" },
] as const;
