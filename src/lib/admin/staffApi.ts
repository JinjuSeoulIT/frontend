import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  AdminStaffUpdateReq,
  DepartmentOption,
  PositionOption,
  StaffCreateReq,
  StaffAssignmentUpdateReq,
  StaffCredentialItem,
  StaffChangeRequestItem,
  StaffAuditLogItem,
  StaffHistoryItem,
  StaffListItem,
  StaffSelfUpdateReq,
  StaffStatusUpdateReq,
} from "@/features/staff/staffTypes";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STAFF_API_BASE_URL ?? "",
});

applyAuthInterceptors(api);

const toApiError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const message = error.response?.data?.message;
    if (message) return new Error(message);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
};

export type StaffSearchCondition =
  | "name"
  | "department"
  | "position"
  | "staff_type"
  | "staff_id";

export const fetchStaffListApi = async (
  activeOnly = true,
  page = 0,
  size = 10
): Promise<StaffListItem[]> => {
  const res = await api.get<ApiResponse<StaffListItem[]>>(
    "/api/jpa/medical-staff",
    {
      params: { activeOnly, page, size },
    }
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const searchStaffApi = async (
  condition: StaffSearchCondition,
  value: string,
  activeOnly = true
): Promise<StaffListItem[]> => {
  const res = await api.get<ApiResponse<StaffListItem[]>>(
    "/api/jpa/medical-staff/search",
    {
      params: { condition, value, activeOnly },
    }
  );
  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};

export const checkStaffUsernameApi = async (username: string): Promise<boolean> => {
  const res = await api.get<ApiResponse<boolean>>(
    "/api/jpa/medical-staff/exists",
    { params: { username } }
  );
  if (!res.data.success) {
    return false;
  }
  return res.data.result;
};

export const fetchMyStaffProfileApi = async (): Promise<StaffListItem> => {
  const res = await api.get<ApiResponse<StaffListItem>>("/api/jpa/medical-staff/me");
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const updateMyStaffProfileApi = async (
  payload: StaffSelfUpdateReq
): Promise<StaffListItem> => {
  const res = await api.put<ApiResponse<StaffListItem>>(
    "/api/jpa/medical-staff/me",
    payload
  );
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const updateMyStaffPhotoApi = async (
  photoFile: File
): Promise<StaffListItem> => {
  const formData = new FormData();
  formData.append("file", photoFile);

  const res = await api.patch<ApiResponse<StaffListItem>>(
    "/api/jpa/medical-staff/me/photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "사진 변경에 실패했습니다.");
  }
  return res.data.result;
};

export const updateStaffStatusApi = async (
  staffId: number,
  payload: StaffStatusUpdateReq
): Promise<StaffListItem> => {
  const res = await api.patch<ApiResponse<StaffListItem>>(
    `/api/jpa/medical-staff/${staffId}/status`,
    payload
  );
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const updateStaffAssignmentApi = async (
  staffId: number,
  payload: StaffAssignmentUpdateReq
): Promise<StaffListItem> => {
  const res = await api.patch<ApiResponse<StaffListItem>>(
    `/api/jpa/medical-staff/${staffId}/assignment`,
    payload
  );
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const fetchStaffHistoryApi = async (staffId: number): Promise<StaffHistoryItem[]> => {
  const res = await api.get<ApiResponse<StaffHistoryItem[]>>(
    `/api/jpa/medical-staff/${staffId}/history`
  );
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const updateStaffAdminProfileApi = async (
  staffId: number,
  payload: AdminStaffUpdateReq,
  photoFile?: File
): Promise<void> => {
  const formData = new FormData();
  formData.append("staff", JSON.stringify(payload));
  if (photoFile) {
    formData.append("file", photoFile);
  }

  const res = await api.put<ApiResponse<void>>(`/api/jpa/medical-staff/${staffId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
};

export const fetchStaffCredentialsApi = async (staffId: number): Promise<StaffCredentialItem[]> => {
  const res = await api.get<ApiResponse<StaffCredentialItem[]>>("/api/jpa/staff-credentials", {
    params: { staffId },
  });
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createStaffCredentialApi = async (payload: {
  staffId: number;
  credType: "LICENSE" | "CERT";
  name: string;
  credNumber?: string;
  issuer?: string;
  expiresAt?: string;
  file?: File;
}): Promise<void> => {
  const formData = new FormData();
  formData.append(
    "credential",
    JSON.stringify({
      staffId: payload.staffId,
      credType: payload.credType,
      name: payload.name,
      credNumber: payload.credNumber || null,
      issuer: payload.issuer || null,
      expiresAt: payload.expiresAt || null,
      status: "ACTIVE",
    })
  );
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await api.post<ApiResponse<void>>("/api/jpa/staff-credentials", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
};

export const changeMyPasswordApi = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const res = await api.patch<ApiResponse<void>>("/api/jpa/medical-staff/me/password", {
    currentPassword,
    newPassword,
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Password change failed");
  }
};

export const resetStaffPasswordApi = async (
  staffId: number,
  newPassword: string
): Promise<void> => {
  const res = await api.patch<ApiResponse<void>>(`/api/jpa/medical-staff/${staffId}/password`, {
    newPassword,
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Password reset failed");
  }
};

export const fetchDepartmentsApi = async (
  activeOnly = true
): Promise<DepartmentOption[]> => {
  const res = await api.get<ApiResponse<DepartmentOption[]>>("/api/jpa/departments", {
    params: { activeOnly },
  });
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchPositionsApi = async (
  activeOnly = true
): Promise<PositionOption[]> => {
  const res = await api.get<ApiResponse<PositionOption[]>>("/api/jpa/positions", {
    params: { activeOnly },
  });
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createStaffApi = async (payload: StaffCreateReq): Promise<void> => {
  const formData = new FormData();
  formData.append(
    "staff",
    JSON.stringify({
      username: payload.username,
      passwordHash: payload.password,
      fullName: payload.fullName,
      phone: payload.phone || null,
      domainRole: payload.domainRole,
      deptId: payload.deptId ?? null,
      positionId: payload.positionId ?? null,
      statusCode: payload.statusCode || "ACTIVE",
    })
  );

  const res = await api.post<ApiResponse<void>>("/api/jpa/medical-staff", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
};

export const deleteStaffApi = async (staffId: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/jpa/medical-staff/${staffId}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};

export const createDepartmentApi = async (payload: {
  name: string;
  description?: string;
  location?: string;
  buildingNo?: string;
  floorNo?: string;
  roomNo?: string;
  extension?: string;
  headStaffId?: number | null;
  sortOrder?: number;
}): Promise<void> => {
  try {
    const res = await api.post<ApiResponse<void>>("/api/jpa/departments", {
      name: payload.name,
      description: payload.description || null,
      location: payload.location || null,
      buildingNo: payload.buildingNo || null,
      floorNo: payload.floorNo || null,
      roomNo: payload.roomNo || null,
      extension: payload.extension || null,
      headStaffId: payload.headStaffId ?? null,
      sortOrder: payload.sortOrder ?? 0,
      isActive: "Y",
    });
    if (!res.data.success) {
      throw new Error(res.data.message || "Create failed");
    }
  } catch (error) {
    throw toApiError(error, "Create failed");
  }
};

export const deactivateDepartmentApi = async (id: number): Promise<void> => {
  try {
    const res = await api.delete<ApiResponse<void>>(`/api/jpa/departments/${id}`);
    if (!res.data.success) {
      throw new Error(res.data.message || "Deactivate failed");
    }
  } catch (error) {
    throw toApiError(error, "Deactivate failed");
  }
};

export const updateDepartmentApi = async (
  id: number,
  payload: {
    name: string;
    description?: string | null;
    location?: string | null;
    buildingNo?: string | null;
    floorNo?: string | null;
    roomNo?: string | null;
    extension?: string | null;
    headStaffId?: number | null;
    sortOrder?: number | null;
    isActive?: string | null;
  }
): Promise<void> => {
  try {
    const res = await api.put<ApiResponse<void>>(`/api/jpa/departments/${id}`, payload);
    if (!res.data.success) {
      throw new Error(res.data.message || "Update failed");
    }
  } catch (error) {
    throw toApiError(error, "Update failed");
  }
};

export const createPositionApi = async (payload: {
  title: string;
  positionCode?: string;
  sortOrder?: number;
}): Promise<void> => {
  try {
    const res = await api.post<ApiResponse<void>>("/api/jpa/positions", {
      title: payload.title,
      positionCode: payload.positionCode || null,
      sortOrder: payload.sortOrder ?? 0,
      isActive: "Y",
    });
    if (!res.data.success) {
      throw new Error(res.data.message || "Create failed");
    }
  } catch (error) {
    throw toApiError(error, "Create failed");
  }
};

export const deactivatePositionApi = async (id: number): Promise<void> => {
  try {
    const res = await api.delete<ApiResponse<void>>(`/api/jpa/positions/${id}`);
    if (!res.data.success) {
      throw new Error(res.data.message || "Deactivate failed");
    }
  } catch (error) {
    throw toApiError(error, "Deactivate failed");
  }
};

export const updatePositionApi = async (
  id: number,
  payload: {
    title: string;
    positionCode?: string | null;
    description?: string | null;
    sortOrder?: number | null;
    isActive?: string | null;
  }
): Promise<void> => {
  try {
    const res = await api.put<ApiResponse<void>>(`/api/jpa/positions/${id}`, payload);
    if (!res.data.success) {
      throw new Error(res.data.message || "Update failed");
    }
  } catch (error) {
    throw toApiError(error, "Update failed");
  }
};

export const createStaffChangeRequestApi = async (payload: {
  staffId: number;
  requestType: "STATUS_CHANGE" | "ASSIGNMENT_CHANGE" | "PASSWORD_RESET";
  reason?: string;
  payload: Record<string, unknown>;
}): Promise<void> => {
  const res = await api.post<ApiResponse<void>>("/api/jpa/staff-change-requests", {
    staffId: payload.staffId,
    requestType: payload.requestType,
    reason: payload.reason || null,
    payload: JSON.stringify(payload.payload),
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "요청 등록에 실패했습니다.");
  }
};

export const fetchStaffChangeRequestsApi = async (status?: string): Promise<StaffChangeRequestItem[]> => {
  const res = await api.get<ApiResponse<StaffChangeRequestItem[]>>("/api/jpa/staff-change-requests", {
    params: status ? { status } : undefined,
  });
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "요청 목록 조회에 실패했습니다.");
  }
  return res.data.result;
};

export const approveStaffChangeRequestApi = async (id: number, comment?: string): Promise<void> => {
  const res = await api.patch<ApiResponse<void>>(`/api/jpa/staff-change-requests/${id}/approve`, {
    comment: comment || null,
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "요청 승인에 실패했습니다.");
  }
};

export const rejectStaffChangeRequestApi = async (id: number, comment?: string): Promise<void> => {
  const res = await api.patch<ApiResponse<void>>(`/api/jpa/staff-change-requests/${id}/reject`, {
    comment: comment || null,
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "요청 반려에 실패했습니다.");
  }
};

export const fetchStaffAuditLogsApi = async (params?: {
  targetType?: string;
  actionType?: string;
  limit?: number;
}): Promise<StaffAuditLogItem[]> => {
  const res = await api.get<ApiResponse<StaffAuditLogItem[]>>(
    "/api/jpa/staff-audit-logs",
    {
      params,
    }
  );
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "감사 로그 조회에 실패했습니다.");
  }
  return res.data.result;
};
