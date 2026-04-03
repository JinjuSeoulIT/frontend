import axios from "axios";
import type { Patient } from "@/features/patients/patientTypes";
import type { PatientRestriction } from "@/lib/patient/restrictionApi";
import type { PatientFlag } from "@/lib/patient/flagApi";

export const API_BASE =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181";

export function resolveFileUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function sexLabel(g?: Patient["gender"]): string {
  if (g === "M") return "남(M)";
  if (g === "F") return "여(F)";
  return "-";
}

export type Option = { value: string; label: string };

export function restrictionLabel(type: string, options: Option[]): string {
  const found = options.find((opt) => opt.value === type);
  return found ? found.label : type;
}

export function flagLabel(type: string, options: Option[]): string {
  const found = options.find((opt) => opt.value === type);
  return found ? found.label : type;
}

export function flagColor(type: string): "default" | "warning" | "error" | "info" | "success" {
  switch (type) {
    case "VIOLENCE":
    case "INFECTIOUS":
      return "error";
    case "FALL_RISK":
    case "ALLERGY":
    case "SEIZURE":
    case "PSYCHIATRIC":
      return "warning";
    case "DNR":
    case "SPECIAL_CARE":
      return "info";
    default:
      return "default";
  }
}

export function buildFlags(
  p: Patient,
  restrictions: PatientRestriction[],
  flags: PatientFlag[],
  flagOptions: Option[],
  restrictionOptions: Option[]
): { key: string; label: string; color?: "default" | "warning" | "error" | "info" | "success" }[] {
  const chips: { key: string; label: string; color?: "default" | "warning" | "error" | "info" | "success" }[] = [];
  if (p.isVip) chips.push({ key: "vip", label: "VIP", color: "warning" });
  for (const r of restrictions) {
    if (!r.activeYn) continue;
    chips.push({ key: `restriction-${r.restrictionId}`, label: restrictionLabel(r.restrictionType, restrictionOptions), color: "default" });
  }
  for (const f of flags) {
    if (!f.activeYn) continue;
    chips.push({ key: `flag-${f.flagId}`, label: flagLabel(f.flagType, flagOptions), color: flagColor(f.flagType) });
  }
  return chips;
}

export function statusLabel(code?: string | null, options?: Option[]): string {
  if (!code) return "-";
  const found = options?.find((opt) => opt.value === code);
  if (found) return `${found.label}(${found.value})`;
  return code;
}

export function toApiDateTime(value?: string): string | undefined {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

export function toTodayDateTime(value?: string): string | undefined {
  if (!value) return undefined;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const timeWithSeconds = value.length === 5 ? `${value}:00` : value;
  return `${year}-${month}-${day}T${timeWithSeconds}`;
}

export function toLocalDateTime(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function resolveErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string; detail?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}

export type Department = { id: number; name: string; doctor: string; doctorId: number };
export type ReceptionForm = {
  deptCode: string;
  doctorId: string;
  visitType: string;
  arrivedAt: string;
  note: string;
};
export type ReservationForm = {
  deptCode: string;
  doctorId: string;
  scheduledAt: string;
  note: string;
};
export const departments: Department[] = [
  { id: 1, name: "내과", doctor: "송태민", doctorId: 1 },
  { id: 2, name: "외과", doctor: "이현석", doctorId: 2 },
  { id: 3, name: "정형외과", doctor: "성숙희", doctorId: 3 },
  { id: 4, name: "신경외과", doctor: "최효정", doctorId: 4 },
];
export const defaultDepartment = departments[0];
