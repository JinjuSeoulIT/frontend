import axios from "axios";

export type AuditLog = {
  auditLogId: number;
  entityType: string;
  entityId: number;
  action: string;
  actorId?: number | null;
  occurredAt: string;
  reasonCode?: string | null;
  reasonText?: string | null;
  beforeJson?: string | null;
  afterJson?: string | null;
  diffJson?: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

export const fetchAuditLogsByReceptionApi = async (
  receptionId: string
): Promise<AuditLog[]> => {
  const res = await api.get<ApiResponse<AuditLog[]>>("/api/audit-logs", {
    params: { entityType: "RECEPTION", entityId: receptionId },
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};



