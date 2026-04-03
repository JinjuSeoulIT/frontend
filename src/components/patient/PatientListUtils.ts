import type { Patient } from "@/features/patients/patientTypes";

const API_BASE =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.70:8181";

export function resolvePhotoUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function sexLabel(g?: Patient["gender"]): string {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return "-";
}

export function safe(v?: string | null): string {
  return v && String(v).trim() ? v : "-";
}

export function statusChipLabel(statusCode?: string | null): string {
  return patientStatusMeta(statusCode).label;
}

export function patientStatusMeta(statusCode?: string | null): {
  label: string;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  variant: "filled" | "outlined";
} {
  const code = (statusCode ?? "ACTIVE").trim().toUpperCase();
  switch (code) {
    case "ACTIVE":
      return { label: "정상", color: "success", variant: "filled" };
    case "INACTIVE":
      return { label: "비활성", color: "warning", variant: "filled" };
    case "TRANSFERRED":
      return { label: "전원", color: "info", variant: "filled" };
    case "DECEASED":
      return { label: "사망", color: "error", variant: "filled" };
    case "OUTPATIENT":
      return { label: "외래", color: "default", variant: "outlined" };
    case "INPATIENT":
      return { label: "입원", color: "default", variant: "outlined" };
    default:
      return { label: code || "-", color: "default", variant: "outlined" };
  }
}

export function formatAddress(p?: Patient | null): string {
  if (!p) return "-";
  const a = p.address?.trim();
  const d = p.addressDetail?.trim();
  if (!a && !d) return "-";
  if (a && d) return `${a} ${d}`;
  return a || d || "-";
}
