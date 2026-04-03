import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type PatientInfoHistory = {
  historyId: number;
  patientId: number;
  changeType: string;
  beforeData?: string | null;
  afterData?: string | null;
  changedBy?: string | null;
  changedAt?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181",
});

export const fetchPatientInfoHistoryApi = async (
  patientId: number
): Promise<PatientInfoHistory[]> => {
  const res = await api.get<ApiResponse<PatientInfoHistory[]>>(
    "/api/patients/info-history",
    { params: { patientId } }
  );
  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};
