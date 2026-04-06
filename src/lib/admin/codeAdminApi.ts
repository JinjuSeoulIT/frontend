import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type CodeGroupItem = {
  groupCode: string;
  groupName: string;
  editableYn: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CodeDetailItem = {
  groupCode: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CodeGroupPayload = {
  groupCode?: string;
  groupName: string;
  editableYn: boolean;
};

export type CodeDetailPayload = {
  groupCode: string;
  code?: string;
  name: string;
  sortOrder: number;
  note?: string;
  isActive?: boolean;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181",
});

function unwrap<T>(res: { data: ApiResponse<T> }): T {
  if (!res.data.success) {
    throw new Error(res.data.message || "Request failed");
  }
  return res.data.result;
}

export const fetchCodeGroupsApi = async (activeOnly = false): Promise<CodeGroupItem[]> => {
  const res = await api.get<ApiResponse<CodeGroupItem[]>>("/api/admin/codes/groups", {
    params: { activeOnly },
  });
  return unwrap(res);
};

export const createCodeGroupApi = async (payload: CodeGroupPayload): Promise<CodeGroupItem> => {
  const res = await api.post<ApiResponse<CodeGroupItem>>("/api/admin/codes/groups", payload);
  return unwrap(res);
};

export const updateCodeGroupApi = async (
  groupCode: string,
  payload: Omit<CodeGroupPayload, "groupCode">
): Promise<CodeGroupItem> => {
  const res = await api.put<ApiResponse<CodeGroupItem>>(`/api/admin/codes/groups/${groupCode}`, payload);
  return unwrap(res);
};

export const deactivateCodeGroupApi = async (groupCode: string): Promise<void> => {
  const res = await api.patch<ApiResponse<null>>(`/api/admin/codes/groups/${groupCode}/deactivate`);
  unwrap(res);
};

export const activateCodeGroupApi = async (groupCode: string): Promise<void> => {
  const res = await api.patch<ApiResponse<null>>(`/api/admin/codes/groups/${groupCode}/activate`);
  unwrap(res);
};

export const fetchCodeDetailsApi = async (
  groupCode?: string,
  activeOnly = false
): Promise<CodeDetailItem[]> => {
  const res = await api.get<ApiResponse<CodeDetailItem[]>>("/api/admin/codes/details", {
    params: { groupCode, activeOnly },
  });
  return unwrap(res);
};

export const createCodeDetailApi = async (payload: CodeDetailPayload): Promise<CodeDetailItem> => {
  const res = await api.post<ApiResponse<CodeDetailItem>>("/api/admin/codes/details", payload);
  return unwrap(res);
};

export const updateCodeDetailApi = async (
  groupCode: string,
  code: string,
  payload: Omit<CodeDetailPayload, "groupCode" | "code">
): Promise<CodeDetailItem> => {
  const res = await api.put<ApiResponse<CodeDetailItem>>(
    `/api/admin/codes/details/${groupCode}/${code}`,
    payload
  );
  return unwrap(res);
};

export const deactivateCodeDetailApi = async (groupCode: string, code: string): Promise<void> => {
  const res = await api.patch<ApiResponse<null>>(`/api/admin/codes/details/${groupCode}/${code}/deactivate`);
  unwrap(res);
};

export const activateCodeDetailApi = async (groupCode: string, code: string): Promise<void> => {
  const res = await api.patch<ApiResponse<null>>(`/api/admin/codes/details/${groupCode}/${code}/activate`);
  unwrap(res);
};
