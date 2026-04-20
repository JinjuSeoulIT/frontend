import "server-only";

import { BILLING_API_BASE_URL } from "@/lib/common/env";
import { fetchJson } from "@/lib/server/http";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

export type ServerBillSummary = {
  billId: number;
  billingNo: string | null;
  patientId: number;
  treatmentDate: string;
  totalAmount: number;
  status: string;
  remainingAmount: number;
};

export type ServerBillingStats = {
  readyCount: number;
  confirmedCount: number;
  paidCount: number;
  finalConfirmedCount: number;
  todayCompletedAmount: number;
  todayRefundedAmount: number;
  totalCompletedAmount: number;
  totalRefundedAmount: number;
  todayNetAmount: number;
  totalNetAmount: number;
};

const toBaseUrl = () => BILLING_API_BASE_URL.replace(/\/+$/, "");

const unwrap = <T>(payload: ApiResponse<T>, fallback: string): T => {
  if (!payload.success) {
    throw new Error(payload.message?.trim() || fallback);
  }
  return payload.result;
};

export const fetchInitialBillingStats = async (
  accessToken: string
): Promise<ServerBillingStats> => {
  const payload = await fetchJson<ApiResponse<ServerBillingStats>>(
    `${toBaseUrl()}/api/billing/stats`,
    accessToken
  );
  return unwrap(payload, "수납 통계 조회에 실패했습니다.");
};

export type BillingListQuery = {
  status?: string | null;
  confirmedOnly?: boolean;
  partialOnly?: boolean;
  billingDate?: string | null;
};

export const fetchInitialBillingList = async (
  accessToken: string,
  query: BillingListQuery
): Promise<ServerBillSummary[]> => {
  const url = new URL(`${toBaseUrl()}/api/billing/bills`);
  if (query.status) {
    url.searchParams.set("status", query.status);
  }
  if (query.confirmedOnly) {
    url.searchParams.set("confirmedOnly", "true");
  }
  if (query.partialOnly) {
    url.searchParams.set("partialOnly", "true");
  }
  if (query.billingDate) {
    url.searchParams.set("billingDate", query.billingDate);
  }

  const payload = await fetchJson<ApiResponse<ServerBillSummary[]>>(
    url.toString(),
    accessToken
  );
  return unwrap(payload, "청구 목록 조회에 실패했습니다.");
};
