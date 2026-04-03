import { CLINICAL_API_BASE } from "./clinicalApiBase";

export type PastHistoryType = "DISEASE" | "SURGERY" | "ALLERGY" | "MEDICATION";

export type PastHistoryItem = {
  id: number;
  patientId: number;
  historyType: PastHistoryType;
  name: string;
  memo?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ApiEnvelope<T> = { success?: boolean; message?: string | null; data?: T; result?: T };

function unwrap<T>(body: ApiEnvelope<T> | T): T {
  if (body && typeof body === "object" && ("data" in body || "result" in body)) {
    const e = body as ApiEnvelope<T>;
    return (e.data ?? e.result) as T;
  }
  return body as T;
}



export async function fetchPastHistoryApi(visitId: number): Promise<PastHistoryItem[]> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/past-history`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`과거력 조회 실패 (${res.status})`);
  const body = (await res.json()) as ApiEnvelope<PastHistoryItem[]> | PastHistoryItem[];
  const raw = unwrap(body);
  return Array.isArray(raw) ? raw : [];
}

export async function createPastHistoryApi(
  visitId: number,
  payload: { historyType: PastHistoryType; name: string; memo?: string | null }
): Promise<PastHistoryItem> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/past-history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      historyType: payload.historyType,
      name: payload.name,
      memo: payload.memo ?? null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err?.message ?? `과거력 등록 실패 (${res.status})`);
  }
  const body = (await res.json()) as ApiEnvelope<PastHistoryItem>;
  return unwrap(body);
}

export async function updatePastHistoryApi(
  visitId: number,
  id: number,
  payload: { historyType?: PastHistoryType; name?: string; memo?: string | null }
): Promise<PastHistoryItem> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/past-history/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err?.message ?? `과거력 수정 실패 (${res.status})`);
  }
  const body = (await res.json()) as ApiEnvelope<PastHistoryItem>;
  return unwrap(body);
}

export async function deletePastHistoryApi(visitId: number, id: number): Promise<void> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/past-history/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err?.message ?? `과거력 삭제 실패 (${res.status})`);
  }
}
