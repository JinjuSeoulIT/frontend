import axios from "axios";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { STAFF_API_BASE_URL } from "@/lib/common/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

export type StaffRoleFilter = "doctor" | "nurse" | "staff" | "admin" | "reception";

export type StaffSearchParams = {
  keyword?: string;
  role?: StaffRoleFilter | "";
  departmentId?: number | "";
  locationId?: number | "";
};

export type StaffSummaryItem = {
  staffId: number | null;
  fullName: string | null;
  jobTitle: string | null;
  jobTitleLabel: string | null;
  employmentStatus: string | null;
  departmentId: number | null;
  departmentName: string | null;
  locationId: number | null;
  locationName: string | null;
  locationDisplayName: string | null;
  phone: string | null;
  email: string | null;
};

export type StaffDepartmentSummaryItem = {
  departmentId: number | null;
  departmentName: string | null;
  activeFlag: string | null;
};

export type StaffLocationSummaryItem = {
  locationId: number | null;
  locationCode: string | null;
  locationName: string | null;
  locationType: string | null;
  departmentId: number | null;
  activeFlag: string | null;
  buildingName: string | null;
  floorNo: string | null;
  roomNo: string | null;
  locationDisplayName: string | null;
};

const api = axios.create({
  baseURL: STAFF_API_BASE_URL,
});

applyAuthInterceptors(api, { redirectOn401: false });

const normalizeMessage = (message: string | undefined, fallback: string) =>
  (message ?? "").trim() || fallback;

const toParams = (params?: StaffSearchParams) => {
  const next: Record<string, string | number> = {};
  if (!params) {
    return next;
  }
  if ((params.keyword ?? "").trim()) {
    next.keyword = params.keyword!.trim();
  }
  if (params.role) {
    next.role = params.role;
  }
  if (params.departmentId !== "" && params.departmentId != null) {
    next.departmentId = params.departmentId;
  }
  if (params.locationId !== "" && params.locationId != null) {
    next.locationId = params.locationId;
  }
  return next;
};

export const fetchStaffSummaryApi = async (
  params?: StaffSearchParams
): Promise<StaffSummaryItem[]> => {
  const res = await api.get<ApiResponse<StaffSummaryItem[]>>("/api/staff", {
    params: toParams(params),
  });
  if (!res.data.success) {
    throw new Error(normalizeMessage(res.data.message, "직원 목록을 불러오지 못했습니다."));
  }
  return res.data.result ?? [];
};

export const fetchStaffDepartmentSummaryApi = async (): Promise<StaffDepartmentSummaryItem[]> => {
  const res = await api.get<ApiResponse<StaffDepartmentSummaryItem[]>>("/api/staff/departments");
  if (!res.data.success) {
    throw new Error(normalizeMessage(res.data.message, "부서 목록을 불러오지 못했습니다."));
  }
  return res.data.result ?? [];
};

export const fetchStaffLocationSummaryApi = async (): Promise<StaffLocationSummaryItem[]> => {
  const res = await api.get<ApiResponse<StaffLocationSummaryItem[]>>("/api/staff/locations");
  if (!res.data.success) {
    throw new Error(normalizeMessage(res.data.message, "위치 목록을 불러오지 못했습니다."));
  }
  return res.data.result ?? [];
};
