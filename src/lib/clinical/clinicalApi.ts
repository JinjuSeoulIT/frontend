import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8090";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export type OrderItemCreate = {
  itemCode: string;
  itemCategory?: string | null;
  itemName?: string | null;
  qty?: number | null;
  dose?: number | null;
  unit?: string | null;
  instruction?: string | null;
};

export type OrderCreatePayload = {
  orderType?: string | null;
  requestedDoctorId?: number | null;
  items: OrderItemCreate[];
};

export type OrderItemResponse = {
  orderItemId: number;
  orderId: number | null;
  itemCode: string | null;
  itemCategory: string | null;
  itemName: string | null;
  qty: number | null;
  dose: number | null;
  unit: string | null;
  instruction: string | null;
  status: string | null;
  createdAt: string | null;
};

export type OrderResponse = {
  orderId: number;
  clinicalId: number;
  requestedAt: string | null;
  orderType: string | null;
  orderStatus: string | null;
  requestedDoctorId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  items: OrderItemResponse[];
};

type ClinicalApiResponse<T> = { success: boolean; message?: string; data?: T };

export async function createOrder(clinicalId: number, payload: OrderCreatePayload): Promise<OrderResponse> {
  const res = await api.post<ClinicalApiResponse<OrderResponse>>(
    `/api/clinicals/${clinicalId}/orders`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message ?? "검사 오더 등록에 실패했습니다.");
  }
  if (res.data.data == null) {
    throw new Error("응답 데이터가 없습니다.");
  }
  return res.data.data;
}

export type ClinicalListItem = {
  clinicalId: number;
  patientId: number;
  clinicalAt: string;
};

export async function fetchClinicals(patientId?: number | string | null): Promise<ClinicalListItem[]> {
  const params = patientId != null ? { patientId: String(patientId) } : {};
  const res = await api.get<ClinicalApiResponse<ClinicalListItem[]>>(
    "/api/clinicals",
    { params }
  );
  if (!res.data.success || !Array.isArray(res.data.data)) {
    return [];
  }
  return res.data.data;
}
