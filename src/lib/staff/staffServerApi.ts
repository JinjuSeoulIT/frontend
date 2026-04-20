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
  const payload = await parseJson<PositionApiResponse<PositionResponse[]>>(response);

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message?.trim() ||
        `직책 API 호출에 실패했습니다. (${response.status})`
    );
  }

  return payload.data ?? [];
};

export const fetchInitialStaffSummary = async (
  accessToken: string
): Promise<StaffSummaryItem[]> => {
  return requestStaffApi<StaffSummaryItem[]>("/api/staff", accessToken);
};

export const fetchInitialStaffDepartments = async (
  accessToken: string
): Promise<StaffDepartmentSummaryItem[]> => {
  return requestStaffApi<StaffDepartmentSummaryItem[]>(
    "/api/staff/departments",
    accessToken
  );
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
