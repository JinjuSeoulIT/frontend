import axios from "axios";
import type { MenuNode } from "@/types/menu";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { MENU_API_BASE_URL } from "@/lib/common/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

const api = axios.create({
  baseURL: "http://192.168.1.67:5555",
});
applyAuthInterceptors(api, { redirectOn401: false });

const MENU_ENDPOINT_CANDIDATES = ["/api/menus", "/api/admin/menus"] as const;

type LooseMenuNode = Partial<{
  id: number;
  menuId: number;
  code: string;
  menuCode: string;
  name: string;
  menuName: string;
  path: string | null;
  menuPath: string | null;
  icon: string | null;
  sortOrder: number | null;
  children: LooseMenuNode[];
}>;

const toMenuNode = (menu: LooseMenuNode): MenuNode => {
  const children = Array.isArray(menu.children) ? menu.children : [];
  return {
    id: Number(menu.menuId ?? menu.id ?? 0),
    code: String(menu.menuCode ?? menu.code ?? ""),
    name: String(menu.menuName ?? menu.name ?? ""),
    path: (menu.menuPath ?? menu.path ?? null) as string | null,
    icon: menu.icon ?? null,
    sortOrder: (menu.sortOrder ?? null) as number | null,
    children: children.map(toMenuNode),
  };
};

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

const fetchByPath = async (path: string): Promise<MenuNode[]> => {
  const res = await api.get(path);
  const list = extractMenuList(res.data);
  return list.map(toMenuNode);
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
      continue;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
};
