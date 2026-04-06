import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type Assessment = {
  assessmentId: string;
  visitId?: string | null;
  visitReason?: string | null;
  medicalHistory?: string | null;
  allergyYn?: string | null;
  allergyNote?: string | null;
  isActive?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  nurseId?: string | null;
};

export type AssessmentCreatePayload = {
  visitId?: string | null;
  visitReason?: string | null;
  medicalHistory?: string | null;
  allergyYn?: string | null;
  allergyNote?: string | null;
  isActive?: string | null;
  nurseId?: string | null;
};

export type AssessmentUpdatePayload = {
  visitId?: string | null;
  visitReason?: string | null;
  medicalHistory?: string | null;
  allergyYn?: string | null;
  allergyNote?: string | null;
  isActive?: string | null;
  nurseId?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.55:8283",
});

export const fetchAssessmentsApi = async (): Promise<Assessment[]> => {
  const res = await api.get<ApiResponse<Assessment[]>>("/api/assessment");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchAssessmentApi = async (
  id: string | number
): Promise<Assessment> => {
  const res = await api.get<ApiResponse<Assessment>>(`/api/assessment/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createAssessmentApi = async (
  payload: AssessmentCreatePayload
): Promise<Assessment> => {
  const res = await api.post<ApiResponse<Assessment>>("/api/assessment", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updateAssessmentApi = async (
  id: string | number,
  payload: AssessmentUpdatePayload
): Promise<Assessment> => {
  const res = await api.put<ApiResponse<Assessment>>(
    `/api/assessment/${id}`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const deleteAssessmentApi = async (
  id: string | number
): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/assessment/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};

