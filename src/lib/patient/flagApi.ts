import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type PatientFlag = {
  flagId: number;
  patientId: number;
  flagType: string;
  note?: string | null;
  activeYn: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PatientFlagCreatePayload = {
  patientId: number;
  flagType: string;
  note?: string | null;
};

export type PatientFlagUpdatePayload = {
  flagType?: string | null;
  activeYn?: boolean | null;
  note?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181",
});

export const fetchPatientFlagsApi = async (
  patientId: number
): Promise<PatientFlag[]> => {
  const res = await api.get<ApiResponse<PatientFlag[]>>("/api/flags/search", {
    params: { type: "patientId", keyword: patientId },
  });
  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};

export const createPatientFlagApi = async (
  payload: PatientFlagCreatePayload
): Promise<PatientFlag> => {
  const res = await api.post<ApiResponse<PatientFlag>>("/api/flags", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updatePatientFlagApi = async (
  id: number,
  payload: PatientFlagUpdatePayload
): Promise<PatientFlag> => {
  const res = await api.put<ApiResponse<PatientFlag>>(`/api/flags/${id}`, payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const deletePatientFlagApi = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/flags/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};
