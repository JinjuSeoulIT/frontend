import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type VisitEmergency = {
  visitId: number;
  triageLevel?: string | null;
  ambulanceYn?: boolean | null;
  traumaYn?: boolean | null;
  note?: string | null;
};

export type VisitEmergencyPayload = {
  triageLevel?: string | null;
  ambulanceYn?: boolean | null;
  traumaYn?: boolean | null;
  note?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

export const fetchVisitEmergencyApi = async (
  visitId: number
): Promise<VisitEmergency | null> => {
  const res = await api.get<ApiResponse<VisitEmergency>>(
    `/api/emergency-receptions/${visitId}`
  );
  if (!res.data.success) return null;
  return res.data.result;
};

export const saveVisitEmergencyApi = async (
  visitId: number,
  payload: VisitEmergencyPayload
): Promise<VisitEmergency> => {
  const res = await api.put<ApiResponse<VisitEmergency>>(
    `/api/emergency-receptions/${visitId}`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "응급 정보 저장 실패");
  }
  return res.data.result;
};

export const deleteVisitEmergencyApi = async (visitId: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(
    `/api/emergency-receptions/${visitId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "응급 정보 삭제 실패");
  }
};
