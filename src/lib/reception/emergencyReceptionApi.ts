import axios from "axios";
import type {
  ApiResponse,
  EmergencyReception,
  EmergencyReceptionForm,
  EmergencyReceptionSearchPayload,
} from "@/features/EmergencyReception/EmergencyReceptionTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

const normalizeDepartmentId = (value: unknown) => String(value ?? "").trim();

const normalizeEmergencyReception = (
  item: EmergencyReception
): EmergencyReception => ({
  ...item,
  departmentId: normalizeDepartmentId(
    (item as EmergencyReception & { departmentId?: unknown }).departmentId
  ),
});

function toApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const message =
      (err.response?.data as { message?: string } | undefined)?.message ?? err.message;
    return message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

function unwrapApiResult<T>(data: ApiResponse<T> | T): T {
  if (data && typeof data === "object" && "result" in (data as ApiResponse<T>)) {
    return ((data as ApiResponse<T>).result ?? null) as T;
  }
  return data as T;
}

function isEmergencyReception(value: unknown): value is EmergencyReception {
  return (
    !!value &&
    typeof value === "object" &&
    "receptionId" in value &&
    "patientId" in value &&
    "departmentId" in value
  );
}

export const fetchEmergencyReceptionsApi = async (): Promise<EmergencyReception[]> => {
  const res = await api.get<ApiResponse<EmergencyReception[]>>("/api/emergency-receptions");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return (res.data.result ?? []).map(normalizeEmergencyReception);
};

export const fetchEmergencyReceptionApi = async (
  receptionId: string
): Promise<EmergencyReception> => {
  const res = await api.get<ApiResponse<EmergencyReception>>(
    `/api/emergency-receptions/${receptionId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return normalizeEmergencyReception(res.data.result);
};

export const createEmergencyReceptionApi = async (
  form: EmergencyReceptionForm
): Promise<EmergencyReception | null> => {
  try {
    const res = await api.post<
      ApiResponse<EmergencyReception | null> | ApiResponse<void> | EmergencyReception | null
    >("/api/emergency-receptions", form);
    const wrapped = res.data as Partial<ApiResponse<unknown>> | null;
    if (wrapped && typeof wrapped === "object" && "success" in wrapped && wrapped.success === false) {
      throw new Error((wrapped as ApiResponse<unknown>).message || "Create failed");
    }
    const unwrapped = unwrapApiResult<EmergencyReception | null>(
      res.data as ApiResponse<EmergencyReception | null> | EmergencyReception | null
    );
    return isEmergencyReception(unwrapped) ? normalizeEmergencyReception(unwrapped) : null;
  } catch (err) {
    throw new Error(toApiErrorMessage(err, "Create failed"));
  }
};

export const updateEmergencyReceptionApi = async (
  receptionId: string,
  form: EmergencyReceptionForm
): Promise<void> => {
  try {
    const res = await api.put<ApiResponse<void>>(
      `/api/emergency-receptions/${receptionId}`,
      form
    );
    if (!res.data.success) {
      throw new Error(res.data.message || "Update failed");
    }
  } catch (err) {
    const nextStatus = (form.status ?? "").trim().toUpperCase();
    const isCancelStatus = nextStatus === "CANCELED" || nextStatus === "CANCELLED";

    // Fallback to generic reception status API so cancel works even without emergency detail row.
    if (isCancelStatus) {
      try {
        const fallback = await api.patch<ApiResponse<unknown> | unknown>(
          `/api/receptions/${receptionId}/status`,
          {
            status: "CANCELLED",
            reasonText: form.note?.trim() || undefined,
          }
        );
        const maybeWrapped = fallback.data as ApiResponse<unknown> | undefined;
        if (maybeWrapped && typeof maybeWrapped === "object" && "success" in maybeWrapped) {
          if (!maybeWrapped.success) {
            throw new Error(maybeWrapped.message || "Cancel failed");
          }
        }
        return;
      } catch (fallbackErr) {
        throw new Error(toApiErrorMessage(fallbackErr, "Cancel failed"));
      }
    }

    throw new Error(toApiErrorMessage(err, "Update failed"));
  }
};

export const searchEmergencyReceptionsApi = async (
  type: EmergencyReceptionSearchPayload["type"],
  keyword: string
): Promise<EmergencyReception[]> => {
  const res = await api.get<ApiResponse<EmergencyReception[]>>("/api/emergency-receptions", {
    params: { searchType: type, searchValue: keyword },
  });

  if (!res.data.success) {
    return [];
  }
  return (res.data.result ?? []).map(normalizeEmergencyReception);
};


