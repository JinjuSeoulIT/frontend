"use client";

import type { ConsentType } from "@/lib/patient/consentApi";

export type ConsentFormState = {
  consentType: string;
  note: string;
  activeYn: boolean;
  agreedAt: string;
};

export function toOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function normalizeAgreedAtForInput(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.includes("T")) return trimmed.slice(0, 16);
  if (trimmed.includes(" ")) return trimmed.replace(" ", "T").slice(0, 16);
  return trimmed;
}

export function normalizeAgreedAtForSubmit(value: string) {
  const v = value.trim();
  if (!v) return undefined;
  return v.length === 16 ? `${v}:00` : v;
}

export function consentTypeKey(t: ConsentType, index?: number) {
  if (t.code) return `${t.code}:${t.id ?? "no-id"}`;
  if (t.id != null) return `id:${t.id}`;
  return `idx:${index ?? 0}`;
}

