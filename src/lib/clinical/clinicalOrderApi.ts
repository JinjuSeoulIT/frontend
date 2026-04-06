import { CLINICAL_API_BASE } from "./clinicalApiBase";

export type LabOrderType =
  | "BLOOD"
  | "IMAGING"
  | "PATHOLOGY"
  | "SPECIMEN"
  | "ENDOSCOPY"
  | "PHYSIOLOGICAL"
  | "PROCEDURE"
  | "MEDICATION";

export type ClinicalOrder = {
  id: number;
  clinicalId: number;
  orderType: LabOrderType;
  orderCode?: string | null;
  orderName: string;
  status?: string | null;
  createdAt?: string | null;
};

export type ClinicalOrderCreatePayload = {
  orderType: LabOrderType;
  orderCode?: string | null;
  orderName: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  result?: T;
};

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T> | T;
  if (Array.isArray(body)) return body as T;
  if (body && typeof body === "object" && ("data" in body || "result" in body)) {
    const v = (body as ApiEnvelope<T>).data ?? (body as ApiEnvelope<T>).result;
    return v as T;
  }
  return body as T;
};

type OrderItemRaw = {
  orderItemId?: number;
  itemName?: string | null;
  itemCode?: string | null;
};
type OrderRaw = {
  orderId: number;
  visitId?: number;
  clinicalId?: number;
  orderType?: string | null;
  orderStatus?: string | null;
  items?: OrderItemRaw[] | null;
};

const KNOWN_ORDER_TYPES: LabOrderType[] = [
  "BLOOD",
  "IMAGING",
  "PATHOLOGY",
  "SPECIMEN",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
  "PROCEDURE",
  "MEDICATION",
];

function mapOrderToClinical(o: OrderRaw): ClinicalOrder {
  const raw = (o.orderType ?? "SPECIMEN") as string;
  const orderType = (KNOWN_ORDER_TYPES.includes(raw as LabOrderType) ? raw : "SPECIMEN") as LabOrderType;
  const visitId = o.visitId ?? o.clinicalId ?? 0;
  const orderName = o.items?.[0]?.itemName ?? o.items?.[0]?.itemCode ?? orderType;
  return {
    id: o.orderId,
    clinicalId: visitId,
    orderType,
    orderName: orderName || orderType,
    status: o.orderStatus ?? null,
  };
}
export async function fetchClinicalOrdersApi(
  clinicalId: number
): Promise<ClinicalOrder[]> {
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/visits/${clinicalId}/orders`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`검사 오더 조회 실패 (${res.status})`);
  }
  const value = await parseJson<OrderRaw[]>(res);
  const list = Array.isArray(value) ? value : [];
  return list
    .filter((o) => (o.orderType ?? "").toUpperCase() !== "PRESCRIPTION")
    .map(mapOrderToClinical);
}

export async function createClinicalOrderApi(
  clinicalId: number,
  payload: ClinicalOrderCreatePayload
): Promise<ClinicalOrder> {
  const itemCode = (payload.orderCode ?? payload.orderName ?? payload.orderType).trim();
  const body = {
    orderType: payload.orderType,
    items: [{ itemCode }],
  };
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/visits/${clinicalId}/orders`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body?.message ?? `검사 오더 등록 실패 (${res.status})`);
  }
  const value = await parseJson<OrderRaw>(res);
  return mapOrderToClinical(value as OrderRaw);
}
export async function cancelClinicalOrderApi(
  clinicalId: number,
  orderId: number
): Promise<ClinicalOrder> {
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/visits/${clinicalId}/orders/${orderId}/cancel`,
    { method: "POST", headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body?.message ?? `검사 오더 취소 실패 (${res.status})`);
  }
  const value = await parseJson<OrderRaw>(res);
  return mapOrderToClinical(value as OrderRaw);
}
