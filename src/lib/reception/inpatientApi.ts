import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type VisitInpatient = {
  visitId: number;
  wardCode?: string | null;
  roomNo?: string | null;
  bedNo?: string | null;
  admissionAt?: string | null;
  note?: string | null;
};

export type VisitInpatientPayload = {
  wardCode?: string | null;
  roomNo?: string | null;
  bedNo?: string | null;
  admissionAt?: string | null;
  note?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

export const fetchVisitInpatientApi = async (
  visitId: number
): Promise<VisitInpatient | null> => {
  const res = await api.get<ApiResponse<VisitInpatient>>(
    `/api/inpatient-receptions/${visitId}`
  );
  if (!res.data.success) return null;
  return res.data.result;
};

export const saveVisitInpatientApi = async (
  visitId: number,
  payload: VisitInpatientPayload
): Promise<VisitInpatient> => {
  const res = await api.put<ApiResponse<VisitInpatient>>(
    `/api/inpatient-receptions/${visitId}`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "입원 정보 저장 실패");
  }
  return res.data.result;
};

export const deleteVisitInpatientApi = async (visitId: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(
    `/api/inpatient-receptions/${visitId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "입원 정보 삭제 실패");
  }
};
