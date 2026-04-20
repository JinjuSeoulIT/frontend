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
  billingNo: string | null;
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

export const fetchBillsByEncounterApi = async (
  encounterId: number
): Promise<BillSummary[]> => {
  const res = await api.get<ApiResponse<BillSummary[]>>(
    `/api/billing/encounters/${encounterId}/bills`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "내원 기준 청구 목록 조회 실패");
  }

  return res.data.result;
};

export const fetchOutstandingBillsApi = async (): Promise<BillSummary[]> => {
  const response = await api.get<ApiResponse<BillSummary[]>>(
    "/api/billing/outstanding"
  );
  return response.data.result;
};

export type BillItemCategory =
  | "CONSULTATION"
  | "MEDICATION"
  | "TEST"
  | "PROCEDURE"
  | "ETC";

export interface BillItem {
  billItemId: number;
  itemName: string;
  itemCategory: BillItemCategory | string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface BillDetail {
  billId: number;
  billingNo: string | null;
  patientId: number;
  treatmentDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  billItems: BillItem[];
}

export interface BillHistory {
  occurredAt: string;
  historyType: string;
  title: string;
  description: string;
  amount: number;
  changedBy: string | null;
  changedByName: string | null;
}

export interface CalculatedBill {
  billId: number;
  originalAmount: number;
  calculatedAmount: number;
  calculationNote: string;
}

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: "CASH", label: "현금" },
  { value: "CARD", label: "카드" },
  { value: "TRANSFER", label: "계좌이체" },
];



export interface PaymentMethodMaster {
  methodCode: PaymentMethod;
  methodName: string;
  useYn: string;
}
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

export const fetchCalculatedBillApi = async (
  billId: number
): Promise<CalculatedBill> => {
  const res = await api.get<ApiResponse<CalculatedBill>>(
    `/api/billing/bills/${billId}/calculated`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "자동 계산 조회 실패");
  }

  return res.data.result;
};

export const fetchBillHistoryApi = async (
  billId: number
): Promise<BillHistory[]> => {
  const res = await api.get<ApiResponse<BillHistory[]>>(
    `/api/billing/bills/${billId}/history`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 이력 조회 실패");
  }

  return res.data.result;
};

export interface BillingClaimItemRequest {
  itemName: string;
  itemCode: string;
  orderType: string;
  sourceId: number;
  sourceType: string;
}

export interface BillingClaimRequest {
  eventId: string;
  visitId: number;
  patientId: number;
  status: string;
  occurredAt: string;
  items: BillingClaimItemRequest[];
}

export interface BillingClaimResult {
  billId: number;
  alreadyProcessed: boolean;
}

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

export interface Payment {
  paymentId: number;
  billId: number;
  paymentAmount: number;
  status: string;
  method: string;
  paidAt: string;
  createdBy: string | null;
  canceledBy: string | null;
  createdByName: string | null;
  canceledByName: string | null;
}

export const createPaymentApi = async (
  billId: number,
  amount: number,
  method: PaymentMethod,
  staffId: string
): Promise<Payment> => {
  const res = await api.post<ApiResponse<Payment>>(
    `/api/billing/payments`,
    null,
    {
      params: { billId, amount, method, staffId },
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 실패");
  }

  return res.data.result;
};

export const cancelPaymentApi = async (
  paymentId: number,
  staffId: string
): Promise<void> => {
  const res = await api.patch<ApiResponse<null>>(
    `/api/billing/payments/${paymentId}/cancel`,
    null,
    {
      params: { staffId },
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 취소 실패");
  }
};

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

export interface BillingStats {
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
}

export const fetchBillingStatsApi = async (): Promise<BillingStats> => {
  const res = await api.get<ApiResponse<BillingStats>>(`/api/billing/stats`);

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 통계 조회 실패");
  }

  return res.data.result;
};

export const refundPaymentApi = async (
  paymentId: number,
  amount: number,
  staffId: string
): Promise<Payment> => {
  const res = await api.patch<ApiResponse<Payment>>(
    `/api/billing/payments/${paymentId}/refund`,
    null,
    {
      params: { amount, staffId },
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "환불 실패");
  }

  return res.data.result;
};



export const fetchPaymentMethodsApi = async (): Promise<
  PaymentMethodMaster[]
> => {
  const res = await api.get<PaymentMethodMaster[]>(
    `/api/billing/payment-methods`
  );

  return res.data;
};
// [수정] billingDate 추가
export interface FetchBillsParams {
  status?: string | null;
  confirmedOnly?: boolean;
  partialOnly?: boolean;
  billingDate?: string | null;
}

export const fetchBillsApi = async (
  params: FetchBillsParams
): Promise<BillSummary[]> => {
  const res = await api.get<ApiResponse<BillSummary[]>>(`/api/billing/bills`, {
    params: {
      status: params.status,
      confirmedOnly: params.confirmedOnly,
      partialOnly: params.partialOnly,
      billingDate: params.billingDate,
    },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "전체 청구 목록 조회 실패");
  }

  return res.data.result;
};

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

export const cancelBillApi = async (
  billId: number
): Promise<void> => {
  const res = await api.post<ApiResponse<null>>(
    `/api/billing/bills/${billId}/cancel`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 취소 실패");
  }
};

export const unconfirmBillApi = async (
  billId: number
): Promise<void> => {
  const res = await api.post<ApiResponse<null>>(
    `/api/billing/bills/${billId}/unconfirm`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 확정 해제 실패");
  }
};

export const restoreBillApi = async (
  billId: number
): Promise<void> => {
  const res = await api.post<ApiResponse<null>>(
    `/api/billing/bills/${billId}/restore`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 복원 실패");
  }
};