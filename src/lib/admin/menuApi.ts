import axios from "axios";
import type { MenuNode } from "@/types/menu";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { MENU_API_BASE_URL } from "@/lib/common/env";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

const api = axios.create({
  baseURL: MENU_API_BASE_URL,
});
applyAuthInterceptors(api, { redirectOn401: false });

const MENU_ENDPOINT_CANDIDATES = ["/api/admin/menus", "/api/menus"] as const;
const CREATE_ENDPOINT_CANDIDATES = ["/api/admin/menus"] as const;
const UPDATE_ENDPOINT_CANDIDATES = ["/api/admin/menus"] as const;

const DISABLED_MENU_CODES = new Set(["ADMIN_COMMON", "ADMIN_ACCOUNT_MANAGEMENT"]);
const DISABLED_MENU_PATHS = new Set(["/admin/common", "/admin/account-management"]);

export type MenuMutationInput = {
  menuId?: number;
  parentId: number | null;
  code?: string;
  name: string;
  nameEn?: string;
  path: string;
  sortOrder: number;
  isActive: "Y" | "N";
  adminOnly: "Y" | "N";
};

type LooseMenuNode = Partial<{
  id: number;
  menuId: number;
  parentId: number;
  parentMenuId: number;
  code: string;
  menuCode: string;
  name: string;
  menuName: string;
  nameEn: string;
  menuNameEn: string;
  menuEn: string;
  path: string | null;
  menuPath: string | null;
  icon: string | null;
  sortOrder: number | null;
  isActive: string | number | boolean;
  activeYn: string | number | boolean;
  adminOnly: string | number | boolean;
  adminOnlyYn: string | number | boolean;
  children: LooseMenuNode[];
}>;

const MAX_MENU_DEPTH = 12;

const normalizeYn = (value: unknown): "Y" | "N" | undefined => {
  if (value == null) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value ? "Y" : "N";
  }
  if (typeof value === "number") {
    return value === 1 ? "Y" : "N";
  }
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (["Y", "YES", "TRUE", "1", "ACTIVE"].includes(normalized)) {
      return "Y";
    }
    if (["N", "NO", "FALSE", "0", "INACTIVE"].includes(normalized)) {
      return "N";
    }
  }
  return undefined;
};

const toMenuNode = (
  menu: LooseMenuNode,
  depth = 0,
  ancestorIds: Set<number> = new Set()
): MenuNode => {
  const id = Number(menu.menuId ?? menu.id ?? 0);
  const hasKnownId = Number.isFinite(id) && id > 0;
  const nextAncestors = new Set(ancestorIds);
  if (hasKnownId) {
    nextAncestors.add(id);
  }

  const rawChildren = Array.isArray(menu.children) ? menu.children : [];
  const canDescend = depth < MAX_MENU_DEPTH && (!hasKnownId || !ancestorIds.has(id));
  const children = canDescend
    ? rawChildren.map((child) => toMenuNode(child, depth + 1, nextAncestors))
    : [];

  return {
    id,
    parentId:
      menu.parentMenuId != null || menu.parentId != null
        ? Number(menu.parentMenuId ?? menu.parentId ?? 0)
        : null,
    code: String(menu.menuCode ?? menu.code ?? ""),
    name: String(menu.menuName ?? menu.name ?? ""),
    nameEn: (menu.menuNameEn ?? menu.nameEn ?? menu.menuEn ?? null) as string | null,
    path: (menu.menuPath ?? menu.path ?? null) as string | null,
    icon: menu.icon ?? null,
    sortOrder: (menu.sortOrder ?? null) as number | null,
    isActive: normalizeYn(menu.isActive ?? menu.activeYn) ?? "Y",
    adminOnly: normalizeYn(menu.adminOnly ?? menu.adminOnlyYn) ?? "N",
    children,
  };
};

const sanitizeMenus = (
  menus: MenuNode[],
  depth = 0,
  ancestorIds: Set<number> = new Set()
): MenuNode[] =>
  menus
    .filter((menu) => {
      const normalizedPath = (menu.path ?? "").trim();
      return !DISABLED_MENU_CODES.has(menu.code) && !DISABLED_MENU_PATHS.has(normalizedPath);
    })
    .map((menu) => {
      const id = Number(menu.id ?? 0);
      const hasKnownId = Number.isFinite(id) && id > 0;
      const nextAncestors = new Set(ancestorIds);
      if (hasKnownId) {
        nextAncestors.add(id);
      }

      const canDescend = depth < MAX_MENU_DEPTH && (!hasKnownId || !ancestorIds.has(id));
      return {
        ...menu,
        children: canDescend ? sanitizeMenus(menu.children ?? [], depth + 1, nextAncestors) : [],
      };
    });

const looksLikeMenuNode = (value: unknown): value is LooseMenuNode => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    "menuId" in candidate ||
    "id" in candidate ||
    "menuName" in candidate ||
    "name" in candidate ||
    "menuCode" in candidate ||
    "code" in candidate
  );
};

const findMenuArrayDeep = (value: unknown, depth = 0): LooseMenuNode[] | null => {
  if (depth > 4) return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (value.some((item) => looksLikeMenuNode(item))) {
      return value as LooseMenuNode[];
    }
    for (const item of value) {
      const found = findMenuArrayDeep(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (!value || typeof value !== "object") return null;

  for (const nested of Object.values(value as Record<string, unknown>)) {
    const found = findMenuArrayDeep(nested, depth + 1);
    if (found) return found;
  }
  return null;
};

const extractMenuList = (data: unknown): LooseMenuNode[] => {
  if (Array.isArray(data)) {
    return data as LooseMenuNode[];
  }
  if (!data || typeof data !== "object") {
    return [];
  }

  const wrapped = data as ApiResponse<unknown>;
  if (typeof wrapped.success === "boolean") {
    if (!wrapped.success) {
      throw new Error(wrapped.message || "메뉴 조회에 실패했습니다.");
    }
    if (Array.isArray(wrapped.result)) {
      return wrapped.result as LooseMenuNode[];
    }
    const nestedFromResult = findMenuArrayDeep(wrapped.result);
    if (nestedFromResult) {
      return nestedFromResult;
    }
    return [];
  }

  const maybe = data as { result?: unknown; menus?: unknown };
  if (Array.isArray(maybe.result)) {
    return maybe.result as LooseMenuNode[];
  }
  if (Array.isArray(maybe.menus)) {
    return maybe.menus as LooseMenuNode[];
  }

  const nested = findMenuArrayDeep(data);
  if (nested) {
    return nested;
  }

  return [];
};

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

const normalizeEndpointError = (error: unknown, fallbackMessage: string) => {
  const apiMessage = extractApiMessage(error);
  if (apiMessage) {
    return new Error(apiMessage);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMessage);
};

const toGeneratedMenuCode = (path: string, name: string) => {
  const fromPath = path
    .trim()
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .join("_")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  if (fromPath.length > 0) {
    return fromPath;
  }

  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toUpperCase();
};

const buildMenuMutationPayload = (input: MenuMutationInput) => {
  const menuCode = input.code?.trim() || toGeneratedMenuCode(input.path, input.name);
  return {
    menuId: input.menuId ?? null,
    id: input.menuId ?? null,
    parentMenuId: input.parentId,
    parentId: input.parentId,
    menuCode,
    code: menuCode,
    menuName: input.name.trim(),
    name: input.name.trim(),
    menuNameEn: input.nameEn?.trim() || null,
    nameEn: input.nameEn?.trim() || null,
    menuPath: input.path.trim(),
    path: input.path.trim(),
    sortOrder: input.sortOrder,
    orderNo: input.sortOrder,
    isActive: input.isActive,
    activeYn: input.isActive,
    adminOnly: input.adminOnly,
    adminOnlyYn: input.adminOnly,
  };
};

const fetchByPath = async (path: string): Promise<MenuNode[]> => {
  const res = await api.get(path);
  const list = extractMenuList(res.data);
  return sanitizeMenus(list.map((menu) => toMenuNode(menu)));
};

export const fetchMenusApi = async (): Promise<MenuNode[]> => {
  let lastError: unknown = null;

  for (const path of MENU_ENDPOINT_CANDIDATES) {
    try {
      const list = await fetchByPath(path);
      if (list.length > 0) {
        return list;
      }
    } catch (error) {
      lastError = error;
      if (!axios.isAxiosError(error)) {
        continue;
      }
      const status = error.response?.status;
      if (status && status >= 500) {
        continue;
      }
      if (status === 401 || status === 403 || status === 404) {
        continue;
      }
    }
  }

  if (lastError) {
    throw normalizeEndpointError(lastError, "메뉴 조회에 실패했습니다.");
  }

  return [];
};

export const createMenuApi = async (input: MenuMutationInput): Promise<void> => {
  const payload = buildMenuMutationPayload(input);
  let lastError: unknown = null;

  for (const endpoint of CREATE_ENDPOINT_CANDIDATES) {
    try {
      const response = await api.post(endpoint, payload);
      const body = response.data as ApiResponse<unknown> | undefined;
      if (body && typeof body.success === "boolean" && !body.success) {
        throw new Error(body.message || "메뉴 등록에 실패했습니다.");
      }
      return;
    } catch (error) {
      lastError = error;
      if (!axios.isAxiosError(error)) {
        continue;
      }
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        throw normalizeEndpointError(error, "메뉴 등록에 실패했습니다.");
      }
      if (status === 404 || status === 405) {
        continue;
      }
    }
  }

  throw normalizeEndpointError(lastError, "메뉴 등록 API가 준비되지 않았습니다.");
};

export const updateMenuApi = async (input: MenuMutationInput): Promise<void> => {
  if (input.menuId == null) {
    throw new Error("수정 대상 메뉴 ID가 없습니다.");
  }

  const payload = buildMenuMutationPayload(input);
  let lastError: unknown = null;

  for (const endpoint of UPDATE_ENDPOINT_CANDIDATES) {
    const withId = `${endpoint}/${input.menuId}`;
    const attempts: Array<() => Promise<unknown>> = [() => api.put(withId, payload)];

    for (const request of attempts) {
      try {
        const response = await request();
        const body = (response as { data?: ApiResponse<unknown> }).data;
        if (body && typeof body.success === "boolean" && !body.success) {
          throw new Error(body.message || "메뉴 수정에 실패했습니다.");
        }
        return;
      } catch (error) {
        lastError = error;
        if (!axios.isAxiosError(error)) {
          continue;
        }
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          throw normalizeEndpointError(error, "메뉴 수정에 실패했습니다.");
        }
        if (status === 404 || status === 405) {
          continue;
        }
      }
    }
  }

  throw normalizeEndpointError(lastError, "메뉴 수정 API가 준비되지 않았습니다.");
};
