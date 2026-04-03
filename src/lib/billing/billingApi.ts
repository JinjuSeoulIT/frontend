import axios from "axios";

/**
 * 공통 API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T;
}

// 결제 수단 타입
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

const baseURL =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost"
    ? `http://${window.location.hostname}:8081`
    : "http://192.168.1.68:8081";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  console.log("[billing] axios request", {
    method: config.method,
    url: config.url,
    data: config.data,
  });
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log(
      "[billing] axios response",
      res.config.method,
      res.config.url,
      res.status,
      res.data
    );
    return res;
  },
  (err) => {
    console.error("[billing] axios error", err);

    const responseMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "알 수 없는 오류가 발생했습니다.";

    throw new Error(responseMessage);
  }
);

// 청구 목록 (환자 기준)
export interface BillSummary {
  billId: number;
  patientId: number;
  treatmentDate: string;
  totalAmount: number;
  status: string;
  remainingAmount: number;
}

export const fetchBillsByPatientApi = async (
  patientId: number,
  status?: string
): Promise<BillSummary[]> => {
  const res = await api.get<ApiResponse<BillSummary[]>>(
    `/api/billing/patients/${patientId}/bills`,
    {
      params: {
        status,
      },
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 목록 조회 실패");
  }

  return res.data.result;
};

export const fetchOutstandingBillsApi = async (): Promise<BillSummary[]> => {
  const response = await api.get<ApiResponse<BillSummary[]>>(
    "/api/billing/outstanding"
  );
  return response.data.result;
};

//  청구 상세 항목 타입
export interface BillItem {
  billItemId: number;
  itemName: string;
  amount: number;
}

// 청구 상세
export interface BillDetail {
  billId: number;
  patientId: number;
  treatmentDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;

  //백엔드 상세 응답에 포함된 항목 목록 반영
  billItems: BillItem[];
}

// 결제 수단 표시
export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: "CASH", label: "현금" },
  { value: "CARD", label: "카드" },
  { value: "TRANSFER", label: "계좌이체" },
];

export const fetchBillDetailApi = async (
  billId: number
): Promise<BillDetail> => {
  const res = await api.get<ApiResponse<BillDetail>>(
    `/api/billing/bills/${billId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 상세 조회 실패");
  }

  return res.data.result;
};

// claims item 타입
export interface BillingClaimItemRequest {
  itemName: string;
  itemCode: string;
  orderType: string;
  sourceId: number;
  sourceType: string;
}

// claims 요청/응답 타입
// 청구 요청 생성 request
export interface BillingClaimRequest {
  eventId: string;
  visitId: number;
  patientId: number;
  status: string;
  occurredAt: string;
  items: BillingClaimItemRequest[];

}

// 청구 요청 생성 response result
export interface BillingClaimResult {
  billId: number;
  alreadyProcessed: boolean;
}


   // claims 생성 API POST /api/billing/claims
export const createBillingClaimApi = async (
  payload: BillingClaimRequest
): Promise<BillingClaimResult> => {
  const res = await api.post<ApiResponse<BillingClaimResult>>(
    `/api/billing/claims`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 생성 요청 실패");
  }

  return res.data.result;
};

// 수납 생성
export interface Payment {
  paymentId: number;
  billId: number;
  paymentAmount: number;
  status: string;
  method: string;
  paidAt: string;
}

export const createPaymentApi = async (
  billId: number,
  amount: number,
  method: PaymentMethod
): Promise<Payment> => {
  const res = await api.post<ApiResponse<Payment>>(
    `/api/billing/payments`,
    null,
    {
      params: { billId, amount, method },
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 실패");
  }

  return res.data.result;
};

// 수납 취소
export const cancelPaymentApi = async (
  paymentId: number
): Promise<void> => {
  const res = await api.patch<ApiResponse<null>>(
    `/api/billing/payments/${paymentId}/cancel`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 취소 실패");
  }
};

// 청구 기준 결제 내역 조회
export const fetchPaymentsByBillApi = async (
  billId: number
): Promise<Payment[]> => {
  const res = await api.get<ApiResponse<Payment[]>>(
    `/api/billing/payments/bill/${billId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "결제 내역 조회 실패");
  }

  return res.data.result;
};

// 수납 통계
export interface BillingStats {
  readyCount: number;
  confirmedCount: number;
  paidCount: number;

  todayCompletedAmount: number;
  todayRefundedAmount: number;
  totalCompletedAmount: number;
  totalRefundedAmount: number;

  todayNetAmount: number;
  totalNetAmount: number;
}

export const fetchBillingStatsApi = async (): Promise<BillingStats> => {
  const res = await api.get<ApiResponse<BillingStats>>(`/api/billing/stats`);

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 통계 조회 실패");
  }

  return res.data.result;
};

// 부분 환불 API
export const refundPaymentApi = async (
  paymentId: number,
  amount: number
): Promise<Payment> => {
  const res = await api.patch<ApiResponse<Payment>>(
    `/api/billing/payments/${paymentId}/refund`,
    null,
    {
      params: { amount },
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "환불 실패");
  }

  return res.data.result;
};

// 전체 청구 목록 조회 API
export const fetchBillsApi = async (
  status: string | null
): Promise<BillSummary[]> => {
  const res = await api.get<ApiResponse<BillSummary[]>>(`/api/billing/bills`, {
    params: {
      status,
    },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "전체 청구 목록 조회 실패");
  }

  return res.data.result;
};

// 청구 확정
export const confirmBillApi = async (
  billId: number
): Promise<void> => {
  const res = await api.post<ApiResponse<null>>(
    `/api/billing/bills/${billId}/confirm`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 확정 실패");
  }
};