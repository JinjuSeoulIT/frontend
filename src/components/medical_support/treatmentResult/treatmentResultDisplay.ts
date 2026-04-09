import type { ChipProps } from "@mui/material";

export const normalizeTreatmentResultStatus = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

export const formatTreatmentResultStatus = (value?: string | null) => {
  const normalized = normalizeTreatmentResultStatus(value);

  if (normalized === "REQUESTED") return "요청";
  if (normalized === "IN_PROGRESS") return "진행 중";
  if (normalized === "COMPLETED") return "완료";
  if (normalized === "CANCELLED") return "취소";
  if (normalized === "ACTIVE") return "활성";
  if (normalized === "INACTIVE") return "비활성";

  return value?.trim() || "-";
};

export const getTreatmentResultStatusColor = (
  value?: string | null
): ChipProps["color"] => {
  const normalized = normalizeTreatmentResultStatus(value);

  if (normalized === "REQUESTED") return "warning";
  if (normalized === "IN_PROGRESS") return "info";
  if (normalized === "COMPLETED") return "success";
  if (normalized === "CANCELLED" || normalized === "INACTIVE") return "default";
  if (normalized === "ACTIVE") return "success";

  return "default";
};

export const getTreatmentResultStatusSx = (value?: string | null) => {
  const normalized = normalizeTreatmentResultStatus(value);

  if (normalized === "CANCELLED" || normalized === "INACTIVE") {
    return {
      backgroundColor: "#eeeeee",
      color: "#616161",
      fontWeight: 500,
    };
  }

  if (normalized === "REQUESTED") {
    return {
      fontWeight: 600,
    };
  }

  return {
    fontWeight: 600,
  };
};

export const TREATMENT_RESULT_STATUS_OPTIONS = [
  { value: "REQUESTED", label: "요청" },
  { value: "IN_PROGRESS", label: "진행 중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELLED", label: "취소" },
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성" },
] as const;
