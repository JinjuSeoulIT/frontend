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
  doctorId?: string | null;
};

function deriveItemCode(orderCode: string | null | undefined, orderName: string): string {
  const name = orderName.trim();
  const paren = name.match(/\(([A-Za-z0-9._-]+)\)\s*$/);
  const fromParen = paren ? paren[1] : null;
  const oc = orderCode?.trim();
  if (oc) {
    if (oc.length <= 50) return oc;
    return (fromParen ?? oc.slice(0, 50)).slice(0, 50);
  }
  return (fromParen ?? name.slice(0, 50)).slice(0, 50);
}

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
  itemDetailCode?: string | null;
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

const TEST_ORDER_TYPES: ReadonlySet<LabOrderType> = new Set([
  "IMAGING",
  "PATHOLOGY",
  "SPECIMEN",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
]);

function mapOrderToClinical(o: OrderRaw): ClinicalOrder {
  const raw = (o.orderType ?? "SPECIMEN") as string;
  const orderType = (KNOWN_ORDER_TYPES.includes(raw as LabOrderType) ? raw : "SPECIMEN") as LabOrderType;
  const visitId = o.visitId ?? o.clinicalId ?? 0;
  const orderName =
    o.items?.[0]?.itemName ??
    o.items?.[0]?.itemDetailCode ??
    o.items?.[0]?.itemCode ??
    orderType;
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
    `${CLINICAL_API_BASE}/api/visits/${clinicalId}/orders?syncFromSupport=true`,
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
  const orderName = payload.orderName.trim();
  const itemDetailCode =
    (payload.orderCode ?? "").trim() || deriveItemCode(payload.orderCode ?? null, orderName);
  const itemRow =
    TEST_ORDER_TYPES.has(payload.orderType) ?
      { itemDetailCode }
    : (() => {
        const itemCode = deriveItemCode(payload.orderCode ?? null, orderName);
        return { itemCode, itemDetailCode: itemDetailCode || itemCode };
      })();
  const doctorId = (payload.doctorId ?? "").trim();
  const body: Record<string, unknown> = {
    orderType: payload.orderType,
    items: [itemRow],
  };
  if (doctorId.length > 0) {
    body.doctorId = doctorId;
  }
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
