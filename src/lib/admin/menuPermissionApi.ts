import axios from "axios";
import { MENU_API_BASE_URL } from "@/lib/common/env";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
  data?: T;
};

export type AuthRoleSummary = {
  roleCode: string;
  roleName: string;
};

export type RoleMenuPermissionNode = {
  menuId: number;
  parentMenuId: number | null;
  menuCode: string;
  menuName: string;
  menuPath: string | null;
  menuIcon: string | null;
  sortOrder: number | null;
  isActive: "Y" | "N";
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  children: RoleMenuPermissionNode[];
};

export type RoleMenuPermissionSaveItem = {
  menuId: number;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type AuthRoleSummaryRaw = Partial<{
  roleCode: string | null;
  roleName: string | null;
}>;

type RoleMenuPermissionNodeRaw = Partial<{
  menuId: number | string | null;
  id: number | string | null;
  parentMenuId: number | string | null;
  parentId: number | string | null;
  menuCode: string | null;
  code: string | null;
  menuName: string | null;
  name: string | null;
  menuPath: string | null;
  path: string | null;
  menuIcon: string | null;
  icon: string | null;
  sortOrder: number | string | null;
  isActive: string | null;
  canView: boolean | null;
  canCreate: boolean | null;
  canUpdate: boolean | null;
  canDelete: boolean | null;
  children: RoleMenuPermissionNodeRaw[] | null;
}>;

const api = axios.create({
  baseURL: MENU_API_BASE_URL,
});

applyAuthInterceptors(api, { redirectOn401: false });

const toTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const toNullableNumber = (value: unknown) => {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBoolean = (value: unknown) => value === true;

const normalizeActiveFlag = (value: unknown): "Y" | "N" => {
  const normalized = String(value ?? "").trim().toUpperCase();
  return normalized === "N" ? "N" : "Y";
};

const sortTree = (nodes: RoleMenuPermissionNode[]) =>
  [...nodes].sort((left, right) => {
    const sortDiff = (left.sortOrder ?? Number.MAX_SAFE_INTEGER) - (right.sortOrder ?? Number.MAX_SAFE_INTEGER);
    if (sortDiff !== 0) {
      return sortDiff;
    }

    return left.menuId - right.menuId;
  });

const normalizePermissionFlags = (input: {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}) => {
  const hasActionPermission = input.canCreate || input.canUpdate || input.canDelete;

  return {
    canView: input.canView || hasActionPermission,
    canCreate: input.canCreate,
    canUpdate: input.canUpdate,
    canDelete: input.canDelete,
  };
};

const normalizeRoleSummary = (raw: AuthRoleSummaryRaw): AuthRoleSummary | null => {
  const roleCode = toTrimmedString(raw.roleCode);
  if (!roleCode) {
    return null;
  }

  return {
    roleCode,
    roleName: toTrimmedString(raw.roleName) ?? roleCode,
  };
};

const normalizeRoleMenuPermissionNode = (
  raw: RoleMenuPermissionNodeRaw
): RoleMenuPermissionNode | null => {
  const menuId = toNullableNumber(raw.menuId ?? raw.id);
  if (menuId == null) {
    return null;
  }

  const flags = normalizePermissionFlags({
    canView: toBoolean(raw.canView),
    canCreate: toBoolean(raw.canCreate),
    canUpdate: toBoolean(raw.canUpdate),
    canDelete: toBoolean(raw.canDelete),
  });

  const childrenRaw = Array.isArray(raw.children) ? raw.children : [];
  const children = sortTree(
    childrenRaw
      .map(normalizeRoleMenuPermissionNode)
      .filter((item): item is RoleMenuPermissionNode => item != null)
  );

  return {
    menuId,
    parentMenuId: toNullableNumber(raw.parentMenuId ?? raw.parentId),
    menuCode: toTrimmedString(raw.menuCode ?? raw.code) ?? String(menuId),
    menuName: toTrimmedString(raw.menuName ?? raw.name) ?? String(menuId),
    menuPath: toTrimmedString(raw.menuPath ?? raw.path),
    menuIcon: toTrimmedString(raw.menuIcon ?? raw.icon),
    sortOrder: toNullableNumber(raw.sortOrder),
    isActive: normalizeActiveFlag(raw.isActive),
    canView: flags.canView,
    canCreate: flags.canCreate,
    canUpdate: flags.canUpdate,
    canDelete: flags.canDelete,
    children,
  };
};

const unwrapResult = <T>(payload: ApiResponse<T> | undefined) => payload?.result ?? payload?.data;

const extractApiMessage = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const responseData = error.response?.data;
  if (!responseData || typeof responseData !== "object") {
    return null;
  }

  const apiMessage = (responseData as Record<string, unknown>).message;
  return typeof apiMessage === "string" ? apiMessage : null;
};

const toFriendlyError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const apiMessage = extractApiMessage(error);
    if (apiMessage) {
      return new Error(apiMessage);
    }

    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return new Error("관리자만 접근할 수 있는 기능입니다.");
    }
    if (status === 404) {
      return new Error("요청한 권한 정보를 찾을 수 없습니다.");
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error;
  }

  return new Error(fallbackMessage);
};

export const fetchAuthRolesApi = async (): Promise<AuthRoleSummary[]> => {
  try {
    const response = await api.get<ApiResponse<AuthRoleSummaryRaw[]>>("/api/admin/permissions/roles");
    if (!response.data.success) {
      throw new Error(response.data.message || "역할 목록을 불러오지 못했습니다.");
    }

    const result = unwrapResult(response.data);
    if (!Array.isArray(result)) {
      return [];
    }

    return result
      .map(normalizeRoleSummary)
      .filter((item): item is AuthRoleSummary => item != null);
  } catch (error) {
    throw toFriendlyError(error, "역할 목록을 불러오지 못했습니다.");
  }
};

export const fetchRoleMenuPermissionsApi = async (
  roleCode: string
): Promise<RoleMenuPermissionNode[]> => {
  const normalizedRoleCode = roleCode.trim();
  if (!normalizedRoleCode) {
    throw new Error("역할 코드가 필요합니다.");
  }

  try {
    const response = await api.get<ApiResponse<RoleMenuPermissionNodeRaw[]>>(
      `/api/admin/permissions/roles/${encodeURIComponent(normalizedRoleCode)}/menus`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "메뉴 권한을 불러오지 못했습니다.");
    }

    const result = unwrapResult(response.data);
    if (!Array.isArray(result)) {
      return [];
    }

    return sortTree(
      result
        .map(normalizeRoleMenuPermissionNode)
        .filter((item): item is RoleMenuPermissionNode => item != null)
    );
  } catch (error) {
    throw toFriendlyError(error, "메뉴 권한을 불러오지 못했습니다.");
  }
};

export const saveRoleMenuPermissionsApi = async (
  roleCode: string,
  permissions: RoleMenuPermissionSaveItem[]
): Promise<string> => {
  const normalizedRoleCode = roleCode.trim();
  if (!normalizedRoleCode) {
    throw new Error("역할 코드가 필요합니다.");
  }

  try {
    const response = await api.put<ApiResponse<null>>(
      `/api/admin/permissions/roles/${encodeURIComponent(normalizedRoleCode)}/menus`,
      {
        permissions: permissions.map((permission) => ({
          menuId: permission.menuId,
          canView: permission.canView,
          canCreate: permission.canCreate,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        })),
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "메뉴 권한 저장에 실패했습니다.");
    }

    return response.data.message?.trim() || "메뉴 권한이 저장되었습니다.";
  } catch (error) {
    throw toFriendlyError(error, "메뉴 권한 저장에 실패했습니다.");
  }
};
