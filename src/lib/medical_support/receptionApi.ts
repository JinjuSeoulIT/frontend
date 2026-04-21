import axios from "axios";
import type {
  ApiResponse,
  Reception,
  ReceptionStatus,
} from "@/features/Reception/ReceptionTypes";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_MEDICAL_SUPPORT_API_BASE_URL ??
    "http://192.168.1.66:8181",
});

type ReceptionApiRaw = Partial<Reception> & {
  receptionId?: string | number | null;
  patientId?: string | number | null;
  doctorId?: string | number | null;
  reservationId?: string | number | null;
  departmentId?: string | number | null;
  createdBy?: string | number | null;
  updatedBy?: string | number | null;
};

export interface ReceptionQueueParams {
  date?: string;
  departmentId?: string | number;
  doctorId?: string | number;
}

const normalizeNullableNumber = (
  value?: string | number | null
): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const numericValue =
    typeof value === "number" ? value : Number(String(value).trim());

  return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizeDepartmentId = (value?: string | number | null) =>
  String(value ?? "").trim();

const normalizeReceptionStatus = (value?: string | null): ReceptionStatus => {
  const normalized = value?.trim().toUpperCase();

  switch (normalized) {
    // case "CALLED":
    case "IN_PROGRESS":
    case "COMPLETED":
    case "PAYMENT_WAIT":
    case "ON_HOLD":
    case "CANCELED":
    case "INACTIVE":
      return normalized;
    case "WAITING":
    default:
      return "WAITING";
  }
};

const normalizeReception = (item: ReceptionApiRaw): Reception => ({
  receptionId: normalizeNullableNumber(item.receptionId) ?? 0,
  receptionNo: String(item.receptionNo ?? "").trim(),
  patientId: normalizeNullableNumber(item.patientId) ?? 0,
  patientName: item.patientName ?? null,
  visitType: String(item.visitType ?? "").trim(),
  departmentId: normalizeDepartmentId(item.departmentId),
  departmentName: item.departmentName ?? null,
  doctorId: normalizeNullableNumber(item.doctorId),
  doctorName: item.doctorName ?? null,
  reservationId: normalizeNullableNumber(item.reservationId),
  scheduledAt: item.scheduledAt ?? null,
  arrivedAt: item.arrivedAt ?? null,
  status: normalizeReceptionStatus(item.status),
  note: item.note ?? null,
  isActive: item.isActive ?? null,
  inactiveAt: item.inactiveAt ?? null,
  inactiveReasonCode: item.inactiveReasonCode ?? null,
  inactiveReasonText: item.inactiveReasonText ?? null,
  cancelReasonCode: item.cancelReasonCode ?? null,
  cancelReasonText: item.cancelReasonText ?? null,
  holdReasonCode: item.holdReasonCode ?? null,
  holdReasonText: item.holdReasonText ?? null,
  createdBy: normalizeNullableNumber(item.createdBy),
  updatedBy: normalizeNullableNumber(item.updatedBy),
  createdAt: item.createdAt ?? null,
  updatedAt: item.updatedAt ?? null,
});

const buildQueueParams = (params?: ReceptionQueueParams) => {
  if (!params) return undefined;

  const nextParams: Record<string, string | number> = {};

  if (params.date?.trim()) {
    nextParams.date = params.date.trim();
  }

  if (
    params.departmentId !== undefined &&
    params.departmentId !== null &&
    String(params.departmentId).trim() !== ""
  ) {
    nextParams.departmentId = params.departmentId;
  }

  if (
    params.doctorId !== undefined &&
    params.doctorId !== null &&
    String(params.doctorId).trim() !== ""
  ) {
    nextParams.doctorId = params.doctorId;
  }

  return Object.keys(nextParams).length > 0 ? nextParams : undefined;
};

export const fetchReceptionQueueApi = async (
  params?: ReceptionQueueParams
): Promise<Reception[]> => {
  const res = await api.get<ApiResponse<ReceptionApiRaw[]>>(
    "/api/receptions/queue",
    {
      params: buildQueueParams(params),
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Queue fetch failed");
  }

  return (res.data.result ?? []).map(normalizeReception);
};

export const fetchReceptionDetailApi = async (
  receptionId: string | number
): Promise<Reception> => {
  const res = await api.get<ApiResponse<ReceptionApiRaw>>(
    `/api/receptions/${receptionId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Detail fetch failed");
  }

  return normalizeReception(res.data.result ?? {});
};
