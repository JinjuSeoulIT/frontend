import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type PatientMemo = {
  memoId: number;
  patientId: number;
  memo: string;
  createdBy?: string | null;
  createdAt?: string | null;
};

export type PatientMemoCreatePayload = {
  patientId: number;
  memo: string;
  createdBy?: string | null;
};

export type PatientMemoUpdatePayload = {
  memo: string;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181",
});

export const fetchPatientMemosApi = async (
  patientId: number
): Promise<PatientMemo[]> => {
  const res = await api.get<ApiResponse<PatientMemo[]>>("/api/memos/search", {
    params: { type: "patientId", keyword: patientId },
  });
  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};

export const createPatientMemoApi = async (
  payload: PatientMemoCreatePayload
): Promise<PatientMemo> => {
  const res = await api.post<ApiResponse<PatientMemo>>("/api/memos", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updatePatientMemoApi = async (
  id: number,
  payload: PatientMemoUpdatePayload
): Promise<PatientMemo> => {
  const res = await api.put<ApiResponse<PatientMemo>>(`/api/memos/${id}`, payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const deletePatientMemoApi = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/memos/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};

