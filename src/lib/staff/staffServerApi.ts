import "server-only";

import type { PositionResponse } from "@/features/staff/position/positiontypes";
import { STAFF_API_BASE_URL } from "@/lib/common/env";
import type {
  StaffDepartmentSummaryItem,
  StaffLocationSummaryItem,
  StaffSummaryItem,
} from "@/lib/staff/staffSummaryApi";

type StaffApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

type PositionApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type PositionRaw = Partial<{
  id: string | number | null;
  title: string | null;
  positionCode: string | null;
  domain: string | null;
  isActive: string | null;
  sortOrder: string | number | null;
}>;

export const ACCESS_TOKEN_COOKIE_NAME = "his_access_token";

const toBaseUrl = () => STAFF_API_BASE_URL.replace(/\/+$/, "");

const toUrl = (path: string, query?: Record<string, string | number | undefined>) => {
  const url = new URL(`${toBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === "") {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
};

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const requestStaffApi = async <T>(path: string, accessToken: string): Promise<T> => {
  const response = await fetch(toUrl(path), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const payload = await parseJson<StaffApiResponse<T>>(response);

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message?.trim() ||
        `직원 API 호출에 실패했습니다. (${response.status})`
    );
  }

  return (payload.result ?? []) as T;
};

const requestPositionApi = async (accessToken: string): Promise<PositionResponse[]> => {
  const response = await fetch(toUrl("/api/positions/list"), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const payload = await parseJson<PositionApiResponse<PositionRaw[]>>(response);

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message?.trim() ||
        `직책 API 호출에 실패했습니다. (${response.status})`
    );
  }

  const rows = payload.data ?? [];
  return rows.map((item) => ({
    positionId: String(item.id ?? ""),
    positionName: item.title ?? "",
    positionCode: item.positionCode ?? "",
    positionType: item.domain ?? "",
    positionLevel: item.sortOrder == null ? "" : String(item.sortOrder),
    managerYn: item.isActive ?? "",
    rmk: "",
  }));
};

export const fetchInitialStaffSummary = async (
  accessToken: string
): Promise<StaffSummaryItem[]> => {
  return requestStaffApi<StaffSummaryItem[]>("/api/staff", accessToken);
};

export const fetchInitialStaffDepartments = async (
  accessToken: string
): Promise<StaffDepartmentSummaryItem[]> => {
  const rows = await requestStaffApi<Array<{ id?: string | number | null; name?: string | null; departmentId?: string | number | null; departmentName?: string | null; activeFlag?: string | null }>>(
    "/api/staff/departments",
    accessToken
  );
  return rows.map((item) => ({
    departmentId:
      item.departmentId != null ? String(item.departmentId) : item.id != null ? String(item.id) : null,
    departmentName: item.departmentName ?? item.name ?? null,
    activeFlag: item.activeFlag ?? null,
  }));
};

export const fetchInitialStaffLocations = async (
  accessToken: string
): Promise<StaffLocationSummaryItem[]> => {
  return requestStaffApi<StaffLocationSummaryItem[]>("/api/staff/locations", accessToken);
};

export const fetchInitialPositionSummary = async (
  accessToken: string
): Promise<PositionResponse[]> => {
  return requestPositionApi(accessToken);
};
