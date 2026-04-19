import "server-only";

import { cookies } from "next/headers";
import type { MenuNode } from "@/types/menu";
import { normalizeMenuPath } from "@/lib/navigation/menuPath";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
  data?: T;
};

type RoleCode = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTION" | "STAFF";

type RoleMenuPermissionAssignment = {
  roleCode: RoleCode;
  menuId?: number | null;
  menuCode?: string | null;
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

const DISABLED_MENU_CODES = new Set(["ADMIN_COMMON", "ADMIN_ACCOUNT_MANAGEMENT"]);
const DISABLED_MENU_PATHS = new Set(["/admin/common", "/admin/account-management"]);

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
      return [];
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

const MENU_ENDPOINT = "/api/menus";
const MENU_FETCH_ENDPOINT_CANDIDATES = ["/api/admin/menus", MENU_ENDPOINT, "/api/menu"] as const;
const CREATE_ENDPOINT_CANDIDATES = ["/api/admin/menus", "/api/menus", "/api/menu"] as const;
const UPDATE_ENDPOINT_CANDIDATES = ["/api/admin/menus", "/api/menus", "/api/menu"] as const;
const PERMISSION_FETCH_ENDPOINTS = [
  "/api/admin/permissions/role-menu",
  "/api/admin/menu-permissions",
  "/api/admin/permissions/menu-roles",
  "/api/admin/permissions",
] as const;
const PERMISSION_SAVE_ENDPOINTS = [
  { method: "put", path: "/api/admin/permissions/role-menu" },
  { method: "post", path: "/api/admin/permissions/role-menu" },
  { method: "put", path: "/api/admin/menu-permissions" },
  { method: "post", path: "/api/admin/menu-permissions" },
] as const;
const REQUIRED_ADMIN_MENU_DEFINITIONS = [
  { path: "/admin/permissions", parentPath: "/admin", name: "권한 관리", sortOrder: 2 },
  { path: "/admin/permissions/menu", parentPath: "/admin/permissions", name: "메뉴 관리", sortOrder: 1 },
  {
    path: "/admin/permissions/role-menu",
    parentPath: "/admin/permissions",
    name: "직군별 메뉴 권한 관리",
    sortOrder: 2,
  },
] as const;

const extractApiMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = (payload as Record<string, unknown>).message;
  return typeof message === "string" ? message : null;
};

const buildRequestHeaders = (accessToken: string, includeJson = false) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
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

const buildMenuMutationPayload = (input: {
  menuId?: number;
  parentId: number | null;
  code?: string;
  name: string;
  nameEn?: string | null;
  path: string;
  sortOrder: number;
  isActive: "Y" | "N";
  adminOnly: "Y" | "N";
}) => {
  const menuCode = input.code?.trim() || toGeneratedMenuCode(input.path, input.name);
  const name = input.name.trim();
  const nameEn = input.nameEn?.trim() || null;
  const path = input.path.trim();

  return {
    menuId: input.menuId ?? null,
    id: input.menuId ?? null,
    parentMenuId: input.parentId,
    parentId: input.parentId,
    menuCode,
    code: menuCode,
    menuName: name,
    name,
    menuNameEn: nameEn,
    nameEn,
    menuPath: path,
    path,
    sortOrder: input.sortOrder,
    orderNo: input.sortOrder,
    isActive: input.isActive === "Y",
    activeYn: input.isActive,
    adminOnly: input.adminOnly === "Y",
    adminOnlyYn: input.adminOnly,
  };
};

const isRoleCode = (value: unknown): value is RoleCode => {
  if (typeof value !== "string") {
    return false;
  }
  return ["ADMIN", "DOCTOR", "NURSE", "RECEPTION", "STAFF"].includes(value.toUpperCase());
};

const normalizeRoleCode = (value: unknown): RoleCode | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.toUpperCase();
  return isRoleCode(normalized) ? normalized : null;
};

const normalizeNumber = (value: unknown): number | null => {
  if (value == null || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const fromAssignmentArray = (input: unknown[]): RoleMenuPermissionAssignment[] => {
  const assignments: RoleMenuPermissionAssignment[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as Record<string, unknown>;
    const roleCode = normalizeRoleCode(row.roleCode ?? row.role ?? row.staffType);
    if (!roleCode) {
      continue;
    }

    assignments.push({
      roleCode,
      menuId: normalizeNumber(row.menuId ?? row.id),
      menuCode: normalizeString(row.menuCode ?? row.code),
    });
  }

  return assignments;
};

const fromAssignmentObjectMap = (
  input: Record<string, unknown>
): RoleMenuPermissionAssignment[] => {
  const assignments: RoleMenuPermissionAssignment[] = [];

  for (const [roleKey, menus] of Object.entries(input)) {
    const roleCode = normalizeRoleCode(roleKey);
    if (!roleCode || !Array.isArray(menus)) {
      continue;
    }

    for (const value of menus) {
      if (typeof value === "string") {
        assignments.push({ roleCode, menuCode: value, menuId: null });
        continue;
      }

      if (typeof value === "number") {
        assignments.push({ roleCode, menuId: value, menuCode: null });
        continue;
      }

      if (!value || typeof value !== "object") {
        continue;
      }

      const row = value as Record<string, unknown>;
      assignments.push({
        roleCode,
        menuId: normalizeNumber(row.menuId ?? row.id),
        menuCode: normalizeString(row.menuCode ?? row.code),
      });
    }
  }

  return assignments;
};

const extractAssignments = (raw: unknown): RoleMenuPermissionAssignment[] => {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return fromAssignmentArray(raw);
  }

  if (typeof raw !== "object") {
    return [];
  }

  const wrapped = raw as ApiResponse<unknown>;
  if (typeof wrapped.success === "boolean") {
    if (!wrapped.success) {
      throw new Error(wrapped.message || "권한 정보를 불러오지 못했습니다.");
    }

    return extractAssignments(wrapped.result ?? wrapped.data);
  }

  const data = raw as Record<string, unknown>;
  if (Array.isArray(data.assignments)) {
    return fromAssignmentArray(data.assignments);
  }
  if (Array.isArray(data.permissions)) {
    return fromAssignmentArray(data.permissions);
  }

  return fromAssignmentObjectMap(data);
};

const collectMenus = (menus: MenuNode[]) => {
  const rows: MenuNode[] = [];
  const stack = [...menus];

  while (stack.length > 0) {
    const node = stack.shift();
    if (!node) {
      continue;
    }

    rows.push(node);
    stack.push(...node.children);
  }

  return rows;
};

const buildMenuByNormalizedPath = (menus: MenuNode[]) => {
  const pathMap = new Map<string, MenuNode>();

  for (const menu of collectMenus(menus)) {
    const normalizedPath = normalizeMenuPath(menu.path);
    if (!normalizedPath || pathMap.has(normalizedPath)) {
      continue;
    }
    pathMap.set(normalizedPath, menu);
  }

  return pathMap;
};

const fetchMenusByEndpointsWithToken = async (
  baseUrl: string,
  accessToken: string,
  endpoints: readonly string[]
): Promise<MenuNode[]> => {
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      cache: "no-store",
      headers: buildRequestHeaders(accessToken),
    });

    if (response.ok) {
      const payload = (await response.json()) as unknown;
      const menus = sanitizeMenus(extractMenuList(payload).map((menu) => toMenuNode(menu)));
      if (menus.length > 0 || endpoint === MENU_ENDPOINT) {
        return menus;
      }
      continue;
    }

    if ([404, 405].includes(response.status)) {
      continue;
    }

    const responseBody = (await response.json().catch(() => null)) as unknown;
    lastError = new Error(
      extractApiMessage(responseBody) || `menu fetch failed with status ${response.status}`
    );

    if ([401, 403].includes(response.status) && endpoint === MENU_ENDPOINT) {
      throw lastError;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
};

const fetchMenusWithToken = async (baseUrl: string, accessToken: string) =>
  fetchMenusByEndpointsWithToken(baseUrl, accessToken, [MENU_ENDPOINT]);

const fetchAllMenusWithToken = async (baseUrl: string, accessToken: string) =>
  fetchMenusByEndpointsWithToken(baseUrl, accessToken, MENU_FETCH_ENDPOINT_CANDIDATES);

const createMenuWithToken = async (
  baseUrl: string,
  accessToken: string,
  input: {
    parentId: number | null;
    name: string;
    path: string;
    sortOrder: number;
    adminOnly: "Y" | "N";
  }
) => {
  const payload = buildMenuMutationPayload({
    parentId: input.parentId,
    name: input.name,
    path: input.path,
    sortOrder: input.sortOrder,
    isActive: "Y",
    adminOnly: input.adminOnly,
  });

  let lastError: Error | null = null;

  for (const endpoint of CREATE_ENDPOINT_CANDIDATES) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: buildRequestHeaders(accessToken, true),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (response.ok) {
      return;
    }

    if ([404, 405].includes(response.status)) {
      continue;
    }

    if ([400, 409].includes(response.status)) {
      return;
    }

    const responseBody = (await response.json().catch(() => null)) as unknown;
    lastError = new Error(
      extractApiMessage(responseBody) || `menu create failed with status ${response.status}`
    );
  }

  if (lastError) {
    throw lastError;
  }
};

const updateMenuWithToken = async (
  baseUrl: string,
  accessToken: string,
  input: {
    menuId: number;
    parentId: number | null;
    code: string;
    name: string;
    nameEn?: string | null;
    path: string;
    sortOrder: number;
    isActive: "Y" | "N";
    adminOnly: "Y" | "N";
  }
) => {
  const payload = buildMenuMutationPayload(input);
  let lastError: Error | null = null;

  for (const endpoint of UPDATE_ENDPOINT_CANDIDATES) {
    for (const method of ["PUT", "PATCH"] as const) {
      for (const url of [`${baseUrl}${endpoint}/${input.menuId}`, `${baseUrl}${endpoint}`]) {
        const response = await fetch(url, {
          method,
          headers: buildRequestHeaders(accessToken, true),
          body: JSON.stringify(payload),
          cache: "no-store",
        });

        if (response.ok) {
          return;
        }

        if ([404, 405].includes(response.status)) {
          continue;
        }

        const responseBody = (await response.json().catch(() => null)) as unknown;
        lastError = new Error(
          extractApiMessage(responseBody) || `menu update failed with status ${response.status}`
        );
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
};

const fetchRoleMenuAssignmentsWithToken = async (baseUrl: string, accessToken: string) => {
  let lastError: Error | null = null;
  let sawSuccessfulEmptyResponse = false;

  for (const endpoint of PERMISSION_FETCH_ENDPOINTS) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      cache: "no-store",
      headers: buildRequestHeaders(accessToken),
    });

    if (response.ok) {
      const payload = (await response.json()) as unknown;
      const assignments = extractAssignments(payload);
      if (assignments.length > 0) {
        return assignments;
      }

      sawSuccessfulEmptyResponse = true;
      continue;
    }

    if ([404, 405].includes(response.status)) {
      continue;
    }

    const responseBody = (await response.json().catch(() => null)) as unknown;
    lastError = new Error(
      extractApiMessage(responseBody) || `permission fetch failed with status ${response.status}`
    );

    if ([401, 403].includes(response.status)) {
      throw lastError;
    }
  }

  if (lastError) {
    throw lastError;
  }

  if (sawSuccessfulEmptyResponse) {
    return [];
  }

  return [];
};

const saveRoleMenuAssignmentsWithToken = async (
  baseUrl: string,
  accessToken: string,
  assignments: RoleMenuPermissionAssignment[]
) => {
  const payload = {
    assignments: assignments.map((item) => ({
      roleCode: item.roleCode,
      menuId: item.menuId ?? null,
      menuCode: item.menuCode ?? null,
    })),
  };

  let lastError: Error | null = null;

  for (const endpoint of PERMISSION_SAVE_ENDPOINTS) {
    const response = await fetch(`${baseUrl}${endpoint.path}`, {
      method: endpoint.method.toUpperCase(),
      headers: buildRequestHeaders(accessToken, true),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (response.ok) {
      return;
    }

    if ([404, 405].includes(response.status)) {
      continue;
    }

    const responseBody = (await response.json().catch(() => null)) as unknown;
    lastError = new Error(
      extractApiMessage(responseBody) || `permission save failed with status ${response.status}`
    );
  }

  if (lastError) {
    throw lastError;
  }
};

const ensureAdminPermissionMenus = async (
  baseUrl: string,
  accessToken: string,
  currentMenus: MenuNode[]
) => {
  try {
    let visibleMenus = currentMenus;
    let allMenus = await fetchAllMenusWithToken(baseUrl, accessToken);
    let allPathMap = buildMenuByNormalizedPath(allMenus);
    let mutated = false;

    if (!allPathMap.has("/admin")) {
      return visibleMenus;
    }

    for (const definition of REQUIRED_ADMIN_MENU_DEFINITIONS) {
      const parentMenu = allPathMap.get(definition.parentPath);
      if (!parentMenu) {
        continue;
      }

      const existingMenu = allPathMap.get(definition.path);
      if (!existingMenu) {
        await createMenuWithToken(baseUrl, accessToken, {
          parentId: parentMenu.id,
          name: definition.name,
          path: definition.path,
          sortOrder: definition.sortOrder,
          adminOnly: "Y",
        });

        allMenus = await fetchAllMenusWithToken(baseUrl, accessToken);
        allPathMap = buildMenuByNormalizedPath(allMenus);
        mutated = true;
        continue;
      }

      const shouldUpdate =
        existingMenu.parentId !== parentMenu.id ||
        existingMenu.isActive === "N" ||
        existingMenu.adminOnly !== "Y";

      if (!shouldUpdate) {
        continue;
      }

      await updateMenuWithToken(baseUrl, accessToken, {
        menuId: existingMenu.id,
        parentId: parentMenu.id,
        code: existingMenu.code,
        name: existingMenu.name,
        nameEn: existingMenu.nameEn ?? null,
        path: existingMenu.path ?? definition.path,
        sortOrder: existingMenu.sortOrder ?? definition.sortOrder,
        isActive: "Y",
        adminOnly: "Y",
      });

      allMenus = await fetchAllMenusWithToken(baseUrl, accessToken);
      allPathMap = buildMenuByNormalizedPath(allMenus);
      mutated = true;
    }

    if (mutated) {
      visibleMenus = await fetchMenusWithToken(baseUrl, accessToken);
    }

    const visiblePathMap = buildMenuByNormalizedPath(visibleMenus);
    const missingVisibleDefinitions = REQUIRED_ADMIN_MENU_DEFINITIONS.filter(
      (definition) => !visiblePathMap.has(definition.path)
    );

    if (missingVisibleDefinitions.length === 0) {
      return visibleMenus;
    }

    const requiredMenus = REQUIRED_ADMIN_MENU_DEFINITIONS
      .map((definition) => allPathMap.get(definition.path))
      .filter((menu): menu is MenuNode => Boolean(menu));

    if (requiredMenus.length !== REQUIRED_ADMIN_MENU_DEFINITIONS.length) {
      return visibleMenus;
    }

    const assignments = await fetchRoleMenuAssignmentsWithToken(baseUrl, accessToken);
    const assignmentKeySet = new Set(
      assignments.map(
        (assignment) =>
          `${assignment.roleCode}:${assignment.menuId ?? "null"}:${assignment.menuCode ?? "null"}`
      )
    );

    const mergedAssignments = [...assignments];
    for (const menu of requiredMenus) {
      const key = `ADMIN:${menu.id}:${menu.code}`;
      if (assignmentKeySet.has(key)) {
        continue;
      }

      mergedAssignments.push({
        roleCode: "ADMIN",
        menuId: menu.id,
        menuCode: menu.code,
      });
      assignmentKeySet.add(key);
    }

    if (mergedAssignments.length === assignments.length) {
      return visibleMenus;
    }

    await saveRoleMenuAssignmentsWithToken(baseUrl, accessToken, mergedAssignments);
    return await fetchMenusWithToken(baseUrl, accessToken);
  } catch (error) {
    console.warn("[menuServer] failed to sync admin permission menus", error);
    return currentMenus;
  }
};

const measureMenuTree = (menus: MenuNode[]) => {
  let totalNodes = 0;
  let maxDepth = 0;

  const visit = (nodes: MenuNode[], depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    for (const node of nodes) {
      totalNodes += 1;
      if (node.children?.length) {
        visit(node.children, depth + 1);
      }
    }
  };

  visit(menus, 1);
  return { totalNodes, maxDepth };
};

export const fetchServerMenus = async (): Promise<MenuNode[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("his_access_token")?.value?.trim() ?? "";
  if (!accessToken) {
    return [];
  }

  const rawBaseUrl = process.env.NEXT_PUBLIC_MENU_API_BASE_URL?.trim() ?? "";
  if (!rawBaseUrl) {
    return [];
  }

  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  try {
    let menus = await fetchMenusWithToken(baseUrl, accessToken);
    menus = await ensureAdminPermissionMenus(baseUrl, accessToken, menus);
    const stats = measureMenuTree(menus);
    if (stats.totalNodes > 200 || stats.maxDepth >= MAX_MENU_DEPTH) {
      console.warn(
        `[menuServer] unusually large menu tree detected: totalNodes=${stats.totalNodes}, maxDepth=${stats.maxDepth}`
      );
    }
    return menus;
  } catch {
    return [];
  }
};
