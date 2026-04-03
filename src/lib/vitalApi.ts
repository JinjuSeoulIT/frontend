import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type Vital = {
  vitalId: string;
  visitId?: string | null;
  temperature?: string | null;
  pulse?: string | null;
  respiration?: string | null;
  bloodPressure?: string | null;
  measuredAt?: string | null;
  createdAt?: string | null;
  status?: string | null;
};

export type VitalCreatePayload = {
  visitId?: string | null;
  temperature?: string | null;
  pulse?: string | null;
  respiration?: string | null;
  bloodPressure?: string | null;
  measuredAt?: string | null;
  status?: string | null;
};

export type VitalUpdatePayload = {
  visitId?: string | null;
  temperature?: string | null;
  pulse?: string | null;
  respiration?: string | null;
  bloodPressure?: string | null;
  measuredAt?: string | null;
  status?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.55:8283",
});

export const fetchVitalsApi = async (): Promise<Vital[]> => {
  const res = await api.get<ApiResponse<Vital[]>>("/api/vital");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchVitalApi = async (id: string | number): Promise<Vital> => {
  const res = await api.get<ApiResponse<Vital>>(`/api/vital/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createVitalApi = async (
  payload: VitalCreatePayload
): Promise<Vital> => {
  const res = await api.post<ApiResponse<Vital>>("/api/vital", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updateVitalApi = async (
  id: string | number,
  payload: VitalUpdatePayload
): Promise<Vital> => {
  const res = await api.put<ApiResponse<Vital>>(`/api/vital/${id}`, payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const deleteVitalApi = async (id: string | number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/vital/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};


