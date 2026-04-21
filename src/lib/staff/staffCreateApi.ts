import axios from "axios";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { STAFF_API_BASE_URL } from "@/lib/common/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result?: T;
};

export type StaffCreateRequest = {
  fullName: string;
  roleCode: string;
  departmentId: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  jobTitle?: string;
  positionTitle?: string;
  dutyCode?: string;
  accountStatus?: string;
  employmentStatus?: string;
};

export type StaffCreateResult = {
  staffId: string;
  loginId: string;
  fullName: string;
  roleCode: string;
  departmentId: string;
  employmentStatus: string;
};

const api = axios.create({
  baseURL: STAFF_API_BASE_URL,
});

applyAuthInterceptors(api, { redirectOn401: false });

export const createStaffApi = async (payload: StaffCreateRequest): Promise<StaffCreateResult> => {
  const response = await api.post<ApiResponse<StaffCreateResult>>("/api/staff/create", payload);

  if (!response.data.success || !response.data.result) {
    throw new Error(response.data.message || "직원 등록에 실패했습니다.");
  }

  return response.data.result;
};
