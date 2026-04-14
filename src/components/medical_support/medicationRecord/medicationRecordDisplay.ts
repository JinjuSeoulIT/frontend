import {
  formatActiveStatus,
  formatProgressStatus,
  getActiveStatusColor,
  getActiveStatusSx,
  getProgressStatusColor,
  normalizeActiveStatus,
  normalizeProgressStatus,
} from "@/components/medical_support/common/ExamDisplay";

const progressStatusSx = {
  fontWeight: 600,
} as const;

export const normalizeMedicationRecordProgressStatus = (value?: string | null) =>
  normalizeProgressStatus(value);

export const formatMedicationRecordProgressStatus = (value?: string | null) =>
  formatProgressStatus(value);

export const getMedicationRecordProgressStatusColor = (value?: string | null) =>
  getProgressStatusColor(value);

export const getMedicationRecordProgressStatusSx = () => progressStatusSx;

export const normalizeMedicationRecordActiveStatus = (value?: string | null) =>
  normalizeActiveStatus(value);

export const formatMedicationRecordActiveStatus = (value?: string | null) =>
  formatActiveStatus(value);

export const getMedicationRecordActiveStatusColor = (value?: string | null) =>
  getActiveStatusColor(value);

export const getMedicationRecordActiveStatusSx = (value?: string | null) =>
  getActiveStatusSx(value);

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

export const MEDICATION_RECORD_PROGRESS_STATUS_OPTIONS = [
  { value: "REQUESTED", label: "요청" },
  { value: "IN_PROGRESS", label: "진행 중" },
  { value: "COMPLETED", label: "완료" },
] as const;

export const MEDICATION_RECORD_ACTIVE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성" },
] as const;
