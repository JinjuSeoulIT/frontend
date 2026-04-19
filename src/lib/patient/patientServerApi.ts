import "server-only";

import type { Patient } from "@/features/patients/patientTypes";
import { fetchJson } from "@/lib/server/http";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

const PATIENTS_API_BASE_URL =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL?.trim() || "http://192.168.1.60:8181";

export const fetchInitialPatients = async (accessToken: string): Promise<Patient[]> => {
  const payload = await fetchJson<ApiResponse<Patient[]>>(
    `${PATIENTS_API_BASE_URL.replace(/\/+$/, "")}/api/patients`,
    accessToken
  );

  if (!payload.success) {
    throw new Error(payload.message?.trim() || "환자 목록 조회에 실패했습니다.");
  }

  return payload.result ?? [];
};
