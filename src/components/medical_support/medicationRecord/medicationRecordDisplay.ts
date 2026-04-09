import type { ChipProps } from "@mui/material";

export const normalizeMedicationRecordStatus = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

export const formatMedicationRecordStatus = (value?: string | null) => {
  const normalized = normalizeMedicationRecordStatus(value);

  if (normalized === "REQUESTED") return "요청";
  if (normalized === "IN_PROGRESS") return "진행 중";
  if (normalized === "COMPLETED") return "완료";
  if (normalized === "ACTIVE") return "활성";
  if (normalized === "INACTIVE") return "비활성";
  if (normalized === "CANCELLED") return "취소";

  return value?.trim() || "-";
};

export const getMedicationRecordStatusColor = (
  value?: string | null
): ChipProps["color"] => {
  const normalized = normalizeMedicationRecordStatus(value);

  if (normalized === "REQUESTED") return "warning";
  if (normalized === "IN_PROGRESS") return "info";
  if (normalized === "COMPLETED" || normalized === "ACTIVE") return "success";
  if (normalized === "INACTIVE" || normalized === "CANCELLED") return "default";

  return "default";
};

export const getMedicationRecordStatusSx = (value?: string | null) => {
  const normalized = normalizeMedicationRecordStatus(value);

  if (normalized === "INACTIVE" || normalized === "CANCELLED") {
    return {
      backgroundColor: "#eeeeee",
      color: "#616161",
      fontWeight: 500,
    };
  }

  return {
    fontWeight: 600,
  };
};

export const formatMedicationDose = (
  doseNumber?: string | number | null,
  doseUnit?: string | null
) => {
  const numberText =
    doseNumber === null ||
    doseNumber === undefined ||
    String(doseNumber).trim() === ""
      ? ""
      : String(doseNumber).trim();
  const unitText = doseUnit?.trim() ?? "";

  if (!numberText && !unitText) return "-";
  if (!numberText) return unitText;
  if (!unitText) return numberText;

  return `${numberText} ${unitText}`;
};

export const MEDICATION_RECORD_STATUS_OPTIONS = [
  { value: "REQUESTED", label: "요청" },
  { value: "IN_PROGRESS", label: "진행 중" },
  { value: "COMPLETED", label: "완료" },
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성" },
  { value: "CANCELLED", label: "취소" },
] as const;
