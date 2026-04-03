import axios from "axios";
import type {
  Reception,
  ReceptionForm,
  ReceptionSearchPayload,
  ApiResponse as ReceptionApiResponse,
} from "@/features/Reception/ReceptionTypes";

type VisitApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

export type VisitRes = {
  id: number;
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitType?: string | null;
  deptCode?: string | null;
  doctorId?: string | null;
  status?: string | null;
  priorityYn?: boolean;
  memo?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateVisitReq = {
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitType?: string | null;
  deptCode?: string | null;
  doctorId?: string | null;
  priorityYn?: boolean;
  memo?: string | null;
  createdBy?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

const normalizeDepartmentId = (value: unknown) => String(value ?? "").trim();

const normalizeReception = (item: Reception): Reception => ({
  ...item,
  departmentId: normalizeDepartmentId((item as Reception & { departmentId?: unknown }).departmentId),
});

function unwrap<T>(data: VisitApiResponse<T> | T): T {
  if (data && typeof data === "object" && "result" in (data as VisitApiResponse<T>)) {
    return ((data as VisitApiResponse<T>).result ?? null) as T;
  }
  return data as T;
}

export const fetchVisitsApi = async (): Promise<VisitRes[]> => {
  const res = await api.get<VisitApiResponse<VisitRes[]> | VisitRes[]>("/api/receptions");
  const value = unwrap<VisitRes[]>(res.data);
  return Array.isArray(value) ? value : [];
};

export const createVisitApi = async (payload: CreateVisitReq): Promise<VisitRes> => {
  const res = await api.post<VisitApiResponse<VisitRes> | VisitRes>("/api/receptions", payload);
  const wrapped = res.data as VisitApiResponse<VisitRes>;
  if (wrapped && typeof wrapped === "object" && wrapped.success === false) {
    throw new Error(wrapped.message || "접수 생성 실패");
  }
  const value = unwrap<VisitRes>(res.data);
  if (!value || typeof value !== "object") {
    throw new Error("접수 생성 응답이 비어 있습니다.");
  }
  return value;
};

export const fetchReceptionsApi = async (): Promise<Reception[]> => {
  const res = await api.get<ReceptionApiResponse<Reception[]>>("/api/receptions");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return (res.data.result ?? []).map(normalizeReception);
};

export const fetchReceptionApi = async (receptionId: string): Promise<Reception> => {
  const res = await api.get<ReceptionApiResponse<Reception>>(`/api/receptions/${receptionId}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return normalizeReception(res.data.result);
};

export const createReceptionApi = async (form: ReceptionForm): Promise<void> => {
  const res = await api.post<ReceptionApiResponse<void>>("/api/receptions", form);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
};

export const updateReceptionApi = async (
  receptionId: string,
  form: ReceptionForm
): Promise<void> => {
  const res = await api.put<ReceptionApiResponse<void>>(
    `/api/receptions/${receptionId}`,
    form
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
};

export const cancelReceptionApi = async (
  receptionId: string,
  reasonText?: string
): Promise<Reception> => {
  const res = await api.patch<ReceptionApiResponse<Reception>>(
    `/api/receptions/${receptionId}/status`,
    {
      status: "CANCELED",
      reasonText: reasonText?.trim() || undefined,
    }
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Cancel failed");
  }
  return normalizeReception(res.data.result);
};

export const searchReceptionsApi = async (
  type: ReceptionSearchPayload["type"],
  keyword: string
): Promise<Reception[]> => {
  const res = await api.get<ReceptionApiResponse<Reception[]>>("/api/receptions", {
    params: { searchType: type, searchValue: keyword },
  });

  if (!res.data.success) {
    return [];
  }
  return (res.data.result ?? []).map(normalizeReception);
};
