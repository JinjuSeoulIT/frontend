import axios from "axios";
import type { ApiResponse, PaymentMethod } from "@/lib/billing/billingApi";

/** 브라우저에서는 Next rewrites(/api/billing → 청구 백엔드)로 동일 출처 호출 */
function resolveBillingDepositBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.NEXT_PUBLIC_BILLING_API_BASE_URL?.trim() ||
      "http://192.168.1.68:8081"
    );
  }
  return "";
}

const api = axios.create({ baseURL: resolveBillingDepositBaseUrl() });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const responseMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "알 수 없는 오류가 발생했습니다.";

    throw new Error(responseMessage);
  }
);

export type BillingDepositStatus = "REGISTERED" | "CANCELED";

export interface BillingDepositCreateRequest {
  patientId: number;
  depositAmount: number;
  paymentMethod: PaymentMethod;
  depositMemo?: string;
  receivedAt?: string;
}

export interface BillingDeposit {
  depositId: number;
  patientId: number;
  depositAmount: number;
  paymentMethod: PaymentMethod;
  depositStatus: BillingDepositStatus;
  depositMemo: string | null;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingDepositMemoUpdateRequest {
  depositMemo?: string | null;
}

export const createBillingDepositApi = async (
  payload: BillingDepositCreateRequest
): Promise<BillingDeposit> => {
  const res = await api.post<ApiResponse<BillingDeposit>>(
    "/api/billing/deposits",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "선수금 등록 실패");
  }

  return res.data.result;
};

export const fetchBillingDepositsApi = async (
  patientId?: number
): Promise<BillingDeposit[]> => {
  const res = await api.get<ApiResponse<BillingDeposit[]>>(
    "/api/billing/deposits",
    {
      params: patientId ? { patientId } : undefined,
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "선수금 목록 조회 실패");
  }

  return res.data.result;
};

export const updateBillingDepositMemoApi = async (
  depositId: number,
  payload: BillingDepositMemoUpdateRequest
): Promise<BillingDeposit> => {
  const res = await api.post<ApiResponse<BillingDeposit>>(
    `/api/billing/deposits/${depositId}/memo`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "선수금 메모 수정 실패");
  }

  return res.data.result;
};
