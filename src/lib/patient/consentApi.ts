import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  Consent,
  ConsentCreateReq,
  ConsentUpdateReq,
} from "@/features/consent/consentTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181",
});

const buildFormData = (data: ConsentCreateReq | ConsentUpdateReq, file?: File | null) => {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );
  if (file) {
    formData.append("file", file);
  }
  return formData;
};

export const fetchConsentListApi = async (
  patientId: number
): Promise<Consent[]> => {
  const res = await api.get<ApiResponse<Consent[]>>(
    `/api/patients/${patientId}/consents`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent fetch failed");
  }
  return res.data.result;
};

export const createConsentApi = async (
  patientId: number,
  form: ConsentCreateReq,
  file?: File | null
): Promise<void> => {
  const res = await api.post<ApiResponse<void>>(
    `/api/patients/${patientId}/consents`,
    buildFormData(form, file)
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent create failed");
  }
};

export const updateConsentApi = async (
  patientId: number,
  consentId: number,
  form: ConsentUpdateReq,
  file?: File | null
): Promise<void> => {
  const res = await api.put<ApiResponse<void>>(
    `/api/patients/${patientId}/consents/${consentId}`,
    buildFormData(form, file)
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent update failed");
  }
};

export const deleteConsentApi = async (
  patientId: number,
  consentId: number
): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(
    `/api/patients/${patientId}/consents/${consentId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent delete failed");
  }
};

export type ConsentLatest = {
  consentId: number;
  consentType: string;
  activeYn: boolean;
  agreedAt?: string | null;
  withdrawnAt?: string | null;
};

export const fetchConsentLatestApi = async (
  patientId: number
): Promise<ConsentLatest[]> => {
  const res = await api.get<ApiResponse<ConsentLatest[]>>(
    `/api/patients/${patientId}/consents/latest`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent latest fetch failed");
  }
  return res.data.result;
};

export type ConsentWithdrawHistory = {
  historyId: number;
  consentId: number;
  consentType: string;
  withdrawnAt: string;
  changedBy?: string | null;
  createdAt?: string | null;
};

export const fetchConsentWithdrawHistoryApi = async (
  patientId: number
): Promise<ConsentWithdrawHistory[]> => {
  const res = await api.get<ApiResponse<ConsentWithdrawHistory[]>>(
    `/api/patients/${patientId}/consents/withdraw-history`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent withdraw history fetch failed");
  }
  return res.data.result;
};

export type ConsentType = {
  id?: number | string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type ConsentTypeReq = {
  code: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
};

export const fetchConsentTypesApi = async (): Promise<ConsentType[]> => {
  const res = await api.get<ApiResponse<ConsentType[]>>("/api/consent-types");
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent type fetch failed");
  }
  return res.data.result;
};

export const fetchConsentTypesAllApi = async (): Promise<ConsentType[]> => {
  const res = await api.get<ApiResponse<ConsentType[]>>("/api/consent-types/all");
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent type fetch failed");
  }
  return res.data.result;
};

export const createConsentTypeApi = async (
  payload: ConsentTypeReq
): Promise<ConsentType> => {
  const res = await api.post<ApiResponse<ConsentType>>(
    "/api/consent-types",
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent type create failed");
  }
  return res.data.result;
};

export const updateConsentTypeApi = async (
  code: string | number | undefined,
  payload: ConsentTypeReq
): Promise<ConsentType> => {
  const key = code ?? payload.code;
  const res = await api.put<ApiResponse<ConsentType>>(
    `/api/consent-types/${key}`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent type update failed");
  }
  return res.data.result;
};

export const deactivateConsentTypeApi = async (
  code: string | number | undefined
): Promise<void> => {
  const key = code != null && String(code).trim() !== "" ? String(code) : null;
  if (!key) {
    throw new Error("동의서 유형 코드가 없습니다.");
  }
  const res = await api.delete<ApiResponse<void>>(`/api/consent-types/${encodeURIComponent(key)}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Consent type deactivate failed");
  }
};
