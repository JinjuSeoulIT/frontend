import { CLINICAL_API_BASE } from "./clinicalApiBase";

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  result?: T;
};

export type ClinicalRes = {
  id?: number;
  clinicalId?: number;
  receptionId?: number | null;
  patientId: number;
  clinicalType?: string | null;
  status?: string | null;
  clinicalStatus?: string | null;
  priorityYn?: boolean;
  clinicalAt?: string | null;
  createdAt?: string | null;
};

function formatBackendDateTime(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length >= 3) {
    const y = v[0] as number;
    const mo = (v[1] as number) - 1;
    const d = v[2] as number;
    const h = (v[3] as number) ?? 0;
    const mi = (v[4] as number) ?? 0;
    const s = (v[5] as number) ?? 0;
    return new Date(y, mo, d, h, mi, s).toISOString();
  }
  return null;
}

export function mapVisitRow(raw: Record<string, unknown>): ClinicalRes {
  const visitId = Number(raw.visitId ?? raw.clinicalId ?? raw.id);
  const patientId = Number(raw.patientId ?? raw.receptionId ?? 0);
  const receptionIdRaw = Number(raw.receptionId);
  const visitStatus = (raw.visitStatus ?? raw.clinicalStatus ?? raw.status) as string | undefined;
  const clinicalAt =
    formatBackendDateTime(raw.startTime) ??
    formatBackendDateTime(raw.clinicalAt) ??
    formatBackendDateTime(raw.createdAt);
  return {
    patientId,
    receptionId: Number.isFinite(receptionIdRaw) ? receptionIdRaw : null,
    clinicalId: Number.isFinite(visitId) ? visitId : undefined,
    id: Number.isFinite(visitId) ? visitId : undefined,
    clinicalStatus: visitStatus ?? null,
    status: visitStatus ?? null,
    clinicalType: (raw.clinicalType as string) ?? null,
    clinicalAt,
    createdAt: formatBackendDateTime(raw.createdAt),
  };
}

export async function fetchClinicalApi(): Promise<ClinicalRes[]> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinical`, { cache: "no-store" });
  if (!res.ok) throw new Error(`진료 조회 실패 (${res.status})`);
  const body = (await res.json()) as ApiEnvelope<unknown[]> | unknown[];
  const raw = Array.isArray(body) ? body : (body.data ?? body.result ?? []);
  const list = Array.isArray(raw) ? raw : [];
  return list.map((c) => mapVisitRow(c as Record<string, unknown>));
}

export function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError && (e.message === "Failed to fetch" || e.message.includes("fetch")))
    return true;
  if (e instanceof Error && e.message.includes("ERR_CONNECTION_REFUSED")) return true;
  return false;
}

export function clinicalConnectionMessage(): string {
  return `진료 서버에 연결할 수 없습니다. hospital-clinical 백엔드(${CLINICAL_API_BASE})가 실행 중인지 확인해 주세요.`;
}

export async function createClinicalApi(patientId: number): Promise<ClinicalRes> {
  let res: Response;
  try {
    res = await fetch(`${CLINICAL_API_BASE}/api/clinical`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId }),
    });
  } catch (e) {
    if (isNetworkError(e)) throw new Error(clinicalConnectionMessage());
    throw e;
  }
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(errBody?.message ?? `신규 진료 생성 실패 (${res.status})`);
  }
  const body = (await res.json()) as ApiEnvelope<Record<string, unknown>> | Record<string, unknown>;
  const raw =
    body && typeof body === "object" && ("data" in body || "result" in body)
      ? (body as ApiEnvelope<Record<string, unknown>>).data ??
        (body as ApiEnvelope<Record<string, unknown>>).result
      : (body as Record<string, unknown>);
  const row = raw && typeof raw === "object" ? { ...raw, patientId } : null;
  const created = row ? mapVisitRow(row) : null;
  if (!created || (created.clinicalId == null && created.id == null))
    throw new Error("신규 진료 생성 응답이 올바르지 않습니다.");
  return created;
}

export interface ReceptionQueueItem {
  receptionId: number;
  receptionNo?: string | null;
  patientId: number;
  patientName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  doctorId?: number | null;
  doctorName?: string | null;
  status?: string | null;
}

export async function fetchReceptionQueueApi(params?: {
  departmentId?: number | null;
  doctorId?: number | null;
  date?: string | null;
}): Promise<ReceptionQueueItem[]> {
  const sp = new URLSearchParams();
  if (params?.departmentId != null) sp.set("departmentId", String(params.departmentId));
  if (params?.doctorId != null) sp.set("doctorId", String(params.doctorId));
  if (params?.date?.trim()) sp.set("date", params.date.trim());
  const qs = sp.toString();
  const url = `${CLINICAL_API_BASE}/api/clinical/reception-queue${qs ? `?${qs}` : ""}`;
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (e) {
    if (isNetworkError(e)) throw new Error(clinicalConnectionMessage());
    throw e;
  }
  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    result?: ReceptionQueueItem[];
    data?: ReceptionQueueItem[];
  };
  if (!res.ok) {
    throw new Error(body?.message ?? `접수 대기열 조회 실패 (${res.status})`);
  }
  if (body?.success === false) {
    throw new Error(body?.message ?? "접수 대기열 조회에 실패했습니다.");
  }
  const list = body?.result ?? body?.data ?? [];
  return Array.isArray(list) ? list : [];
}

export async function startVisitApi(
  receptionId: number,
  changedBy?: number | null
): Promise<{ visitId: number }> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinical/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receptionId, changedBy: changedBy ?? undefined }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? `진료 시작 실패 (${res.status})`);
  }
  const body = (await res.json()) as { success?: boolean; result?: { visitId: number } };
  const result = body?.result;
  if (!result?.visitId) throw new Error("진료 시작 응답이 올바르지 않습니다.");
  return result;
}

export async function endVisitApi(visitId: number): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (isNetworkError(e)) throw new Error(clinicalConnectionMessage());
    throw e;
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? `진료 완료 실패 (${res.status})`);
  }
}
