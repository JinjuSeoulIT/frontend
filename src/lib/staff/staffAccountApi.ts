"use client";

import axios from "axios";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { STAFF_API_BASE_URL } from "@/lib/common/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result?: T;
  data?: T;
};

type StaffPasswordResetDetailRaw = Partial<{
  staffId: number | string | null;
  id: number | string | null;
  username: string | null;
  fullName: string | null;
  name: string | null;
  birthDate: string | null;
  genderCode: string | null;
  phone: string | null;
  email: string | null;
}>;

export type StaffPasswordResetDetail = {
  staffId: number | null;
  username: string | null;
  fullName: string | null;
  birthDate: string | null;
  genderCode: string | null;
  phone: string | null;
  email: string | null;
};

const api = axios.create({
  baseURL: STAFF_API_BASE_URL,
});

applyAuthInterceptors(api);

const toNullableString = (value: unknown) => {
  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

const toNullableNumber = (value: unknown) => {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeDetail = (
  raw: StaffPasswordResetDetailRaw
): StaffPasswordResetDetail => ({
  staffId: toNullableNumber(raw.staffId ?? raw.id),
  username: toNullableString(raw.username),
  fullName: toNullableString(raw.fullName) ?? toNullableString(raw.name),
  birthDate: toNullableString(raw.birthDate),
  genderCode: toNullableString(raw.genderCode),
  phone: toNullableString(raw.phone),
  email: toNullableString(raw.email),
});

const resolvePayload = <T,>(payload: ApiResponse<T>) => payload.result ?? payload.data;

export const resetStaffPasswordApi = async (
  staffId: number,
  newPassword: string
): Promise<void> => {
  const res = await api.patch<ApiResponse<void>>(`/api/jpa/medical-staff/${staffId}/password`, {
    newPassword,
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "비밀번호 초기화에 실패했습니다.");
  }
};

export const fetchStaffPasswordResetDetailApi = async (
  staffId: number
): Promise<StaffPasswordResetDetail> => {
  const res = await api.get<ApiResponse<StaffPasswordResetDetailRaw>>(`/api/staff/detail/${staffId}`);
  const payload = resolvePayload(res.data);

  if (!res.data.success || !payload) {
    throw new Error(res.data.message || "직원 상세 정보를 불러오지 못했습니다.");
  }

  return normalizeDetail(payload);
};

const resolveCenturyPrefix = (genderCode: string | null | undefined) => {
  switch ((genderCode ?? "").trim()) {
    case "1":
    case "2":
    case "5":
    case "6":
      return "19";
    case "3":
    case "4":
    case "7":
    case "8":
      return "20";
    case "9":
    case "0":
      return "18";
    default:
      return null;
  }
};

export const resolveBirthDatePassword = (
  birthDate: string | null | undefined,
  genderCode: string | null | undefined
) => {
  const digits = (birthDate ?? "").replace(/\D/g, "");

  if (digits.length === 8) {
    return digits;
  }

  if (digits.length === 6) {
    const centuryPrefix = resolveCenturyPrefix(genderCode);
    return centuryPrefix ? `${centuryPrefix}${digits}` : null;
  }

  return null;
};

export const formatBirthDateLabel = (
  birthDate: string | null | undefined,
  genderCode: string | null | undefined
) => {
  const resolved = resolveBirthDatePassword(birthDate, genderCode);

  if (resolved) {
    return `${resolved.slice(0, 4)}-${resolved.slice(4, 6)}-${resolved.slice(6, 8)}`;
  }

  const digits = (birthDate ?? "").replace(/\D/g, "");
  if (digits.length === 6) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
  }

  const fallback = toNullableString(birthDate);
  return fallback ?? "-";
};
