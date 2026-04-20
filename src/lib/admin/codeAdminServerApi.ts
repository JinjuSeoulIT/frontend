import "server-only";

import type { CodeDetailItem, CodeGroupItem } from "@/lib/admin/codeAdminApi";
import { fetchJson } from "@/lib/server/http";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL?.trim() || "http://192.168.1.60:8181";

const toBaseUrl = () => ADMIN_API_BASE_URL.replace(/\/+$/, "");

const unwrap = <T>(payload: ApiResponse<T>, fallback: string): T => {
  if (!payload.success) {
    throw new Error(payload.message?.trim() || fallback);
  }
  return payload.result;
};

export const fetchInitialCodeGroups = async (
  accessToken: string,
  activeOnly: boolean
): Promise<CodeGroupItem[]> => {
  const url = new URL(`${toBaseUrl()}/api/admin/codes/groups`);
  url.searchParams.set("activeOnly", String(activeOnly));
  const payload = await fetchJson<ApiResponse<CodeGroupItem[]>>(url.toString(), accessToken);
  return unwrap(payload, "코드 그룹 조회에 실패했습니다.");
};

export const fetchInitialCodeDetails = async (
  accessToken: string,
  groupCode?: string,
  activeOnly = false
): Promise<CodeDetailItem[]> => {
  const url = new URL(`${toBaseUrl()}/api/admin/codes/details`);
  if (groupCode) {
    url.searchParams.set("groupCode", groupCode);
  }
  url.searchParams.set("activeOnly", String(activeOnly));
  const payload = await fetchJson<ApiResponse<CodeDetailItem[]>>(url.toString(), accessToken);
  return unwrap(payload, "상세 코드 조회에 실패했습니다.");
};
