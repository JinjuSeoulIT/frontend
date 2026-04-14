import type { ChipProps } from "@mui/material";

const normalizeValue = (value?: string | null) => value?.trim().toUpperCase() ?? "";

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

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

export const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

export const formatYn = (value?: string | null) => {
  const normalized = normalizeValue(value);

  if (normalized === "Y") return "예";
  if (normalized === "N") return "아니오";

  return safeValue(value);
};

export const normalizeProgressStatus = (value?: string | null) => normalizeValue(value);

export const formatProgressStatus = (value?: string | null) => {
  const normalized = normalizeProgressStatus(value);

  if (normalized === "WAITING" || normalized === "REQUESTED") return "요청";
  if (normalized === "IN_PROGRESS") return "진행 중";
  if (normalized === "COMPLETED") return "완료";
  if (normalized === "CANCELLED") return "취소";

  return safeValue(value);
};

export const getProgressStatusColor = (
  value?: string | null
): ChipProps["color"] => {
  const normalized = normalizeProgressStatus(value);

  if (normalized === "WAITING" || normalized === "REQUESTED") return "warning";
  if (normalized === "IN_PROGRESS") return "info";
  if (normalized === "COMPLETED") return "success";
  if (normalized === "CANCELLED") return "default";

  return "default";
};

export const normalizeActiveStatus = (value?: string | null) => normalizeValue(value);

export const formatActiveStatus = (value?: string | null) => {
  const normalized = normalizeActiveStatus(value);

  if (normalized === "ACTIVE") return "활성";
  if (normalized === "INACTIVE") return "비활성";

  return safeValue(value);
};

export const getActiveStatusColor = (
  value?: string | null
): ChipProps["color"] => {
  const normalized = normalizeActiveStatus(value);

  if (normalized === "ACTIVE") return "success";

  return "default";
};

export const getActiveStatusSx = (value?: string | null) => {
  const normalized = normalizeActiveStatus(value);

  if (normalized === "ACTIVE") {
    return {
      fontWeight: 600,
    };
  }

  return {
    backgroundColor: "#eeeeee",
    color: "#757575",
    fontWeight: 500,
  };
};
