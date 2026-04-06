import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type VisitHistory = {
  id: number;
  visitId: number;
  eventType?: string | null;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  changedBy?: string | null;
  changedAt?: string | null;
};

type VisitHistoryLike = Partial<VisitHistory> & {
  statusHistoryId?: number;
  receptionId?: number;
  entityId?: number;
  action?: string | null;
  field?: string | null;
  beforeValue?: string | null;
  afterValue?: string | null;
  reasonText?: string | null;
  actorName?: string | null;
  actor?: string | null;
  occurredAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ReceptionLike = {
  receptionId?: number;
  id?: number;
};

const PRIMARY_BASE =
  process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283";
const RECEPTION_FALLBACK_BASE =
  process.env.NEXT_PUBLIC_RECEPTION_FALLBACK_BASE_URL ?? "http://192.168.1.55:8283";

const uniqueBases = Array.from(
  new Set([PRIMARY_BASE, RECEPTION_FALLBACK_BASE].filter(Boolean))
);

const apiForBase = (baseURL: string) =>
  axios.create({
    baseURL,
  });

const normalizeVisitHistory = (raw: VisitHistoryLike): VisitHistory => ({
  id: Number(raw.id ?? raw.statusHistoryId ?? 0),
  visitId: Number(raw.visitId ?? raw.receptionId ?? raw.entityId ?? 0),
  eventType: raw.eventType ?? raw.action ?? null,
  fieldName: raw.fieldName ?? raw.field ?? null,
  oldValue: raw.oldValue ?? raw.beforeValue ?? null,
  newValue: raw.newValue ?? raw.afterValue ?? null,
  reason: raw.reason ?? raw.reasonText ?? null,
  changedBy: raw.changedBy ?? raw.actorName ?? raw.actor ?? null,
  changedAt: raw.changedAt ?? raw.occurredAt ?? raw.updatedAt ?? raw.createdAt ?? null,
});

const parseHistoryResponse = (data: unknown): VisitHistory[] => {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeVisitHistory(item as VisitHistoryLike));
  }

  const wrapped = data as Partial<ApiResponse<VisitHistoryLike[]>> | undefined;
  if (!wrapped || wrapped.success === false) {
    return [];
  }

  const list = wrapped.result;
  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((item) => normalizeVisitHistory(item));
};

const hasMeaningfulHistoryField = (item: VisitHistory) =>
  !!(
    item.eventType ||
    item.fieldName ||
    item.oldValue ||
    item.newValue ||
    item.reason ||
    item.changedBy ||
    item.changedAt
  );

const parseReceptionIdList = (data: unknown): number[] => {
  const asArray = (input: unknown): ReceptionLike[] => {
    if (Array.isArray(input)) return input as ReceptionLike[];
    const wrapped = input as Partial<ApiResponse<ReceptionLike[]>> | undefined;
    if (!wrapped || wrapped.success === false || !Array.isArray(wrapped.result)) {
      return [];
    }
    return wrapped.result;
  };

  return asArray(data)
    .map((item) => Number(item.receptionId ?? item.id ?? 0))
    .filter((id) => Number.isFinite(id) && id > 0);
};

const sortHistoryDesc = (list: VisitHistory[]): VisitHistory[] =>
  [...list].sort((a, b) => {
    const ta = a.changedAt ? new Date(a.changedAt).getTime() : 0;
    const tb = b.changedAt ? new Date(b.changedAt).getTime() : 0;
    return tb - ta;
  });

const fetchFromAggregateEndpoints = async (baseURL: string) => {
  const api = apiForBase(baseURL);
  const endpoints = ["/api/reception/history", "/api/receptions/history", "/api/receptions"];

  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      const parsed = parseHistoryResponse(res.data);
      if (parsed.some(hasMeaningfulHistoryField)) {
        return sortHistoryDesc(parsed);
      }
    } catch {
      // Try next endpoint.
    }
  }

  return [];
};

const fetchByReceptionStatusHistory = async (baseURL: string) => {
  try {
    const api = apiForBase(baseURL);
    const receptionsRes = await api.get("/api/receptions");
    const ids = parseReceptionIdList(receptionsRes.data).slice(0, 200);
    if (!ids.length) return [];

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await api.get(`/api/receptions/${id}/status-history`);
          return parseHistoryResponse(res.data);
        } catch {
          return [];
        }
      })
    );

    const merged = results.flat().filter(hasMeaningfulHistoryField);
    return sortHistoryDesc(merged);
  } catch {
    return [];
  }
};

export const fetchVisitHistoryApi = async (
  visitId: number
): Promise<VisitHistory[]> => {
  for (const baseURL of uniqueBases) {
    try {
      const api = apiForBase(baseURL);
      const res = await api.get<ApiResponse<VisitHistoryLike[]>>(
        `/api/receptions/${visitId}/status-history`
      );
      const parsed = parseHistoryResponse(res.data);
      if (parsed.length > 0 || (res.data as ApiResponse<VisitHistoryLike[]>).success) {
        return sortHistoryDesc(parsed);
      }
    } catch {
      // Try next base.
    }
  }

  return [];
};

export const fetchAllVisitHistoryApi = async (): Promise<VisitHistory[]> => {
  for (const baseURL of uniqueBases) {
    const aggregated = await fetchFromAggregateEndpoints(baseURL);
    if (aggregated.length > 0) {
      return aggregated;
    }
  }

  for (const baseURL of uniqueBases) {
    const reconstructed = await fetchByReceptionStatusHistory(baseURL);
    if (reconstructed.length > 0) {
      return reconstructed;
    }
  }

  return [];
};
