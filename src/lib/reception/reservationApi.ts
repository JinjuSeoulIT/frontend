import axios from "axios";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

export type VisitReservation = {
  visitId: number;
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  note?: string | null;
};

export type VisitReservationPayload = {
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  note?: string | null;
};

export type SaveVisitReservationReq = VisitReservationPayload;

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

const fetchEndpoints = [
  (visitId: number) => `/api/reservations/${visitId}`,
  (visitId: number) => `/api/receptions/${visitId}/reservation`,
  (visitId: number) => `/api/receptions/${visitId}/reservations`,
];

const saveEndpointSpecs = [
  { method: "put" as const, path: (visitId: number) => `/api/reservations/${visitId}` },
  { method: "put" as const, path: (visitId: number) => `/api/receptions/${visitId}/reservation` },
  { method: "put" as const, path: (visitId: number) => `/api/receptions/${visitId}/reservations` },
  { method: "post" as const, path: (visitId: number) => `/api/receptions/${visitId}/reservation` },
  { method: "post" as const, path: (visitId: number) => `/api/receptions/${visitId}/reservations` },
  { method: "post" as const, path: () => "/api/reservations" },
];

const deleteEndpoints = [
  (visitId: number) => `/api/reservations/${visitId}`,
  (visitId: number) => `/api/receptions/${visitId}/reservation`,
  (visitId: number) => `/api/receptions/${visitId}/reservations`,
];

function isWrappedResponse<T>(data: ApiResponse<T> | T): data is ApiResponse<T> {
  return !!data && typeof data === "object" && "success" in (data as ApiResponse<T>);
}

function resolveErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string; detail?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function isNotFoundError(err: unknown) {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

function toReservation(
  visitId: number,
  payload?: VisitReservationPayload,
  raw?: unknown
): VisitReservation {
  const wrapped = raw as ApiResponse<VisitReservation> | undefined;
  const value =
    wrapped && typeof wrapped === "object" && "result" in wrapped
      ? wrapped.result
      : (raw as VisitReservation | undefined);

  return {
    visitId: value?.visitId ?? visitId,
    reservationId: value?.reservationId ?? payload?.reservationId ?? null,
    scheduledAt: value?.scheduledAt ?? payload?.scheduledAt ?? null,
    arrivalAt: value?.arrivalAt ?? payload?.arrivalAt ?? null,
    note: value?.note ?? payload?.note ?? null,
  };
}

export const fetchVisitReservationApi = async (
  visitId: number
): Promise<VisitReservation | null> => {
  let lastError: unknown = null;

  for (const toEndpoint of fetchEndpoints) {
    try {
      const res = await api.get<ApiResponse<VisitReservation> | VisitReservation>(
        toEndpoint(visitId)
      );
      if (isWrappedResponse<VisitReservation>(res.data) && res.data.success === false) {
        return null;
      }
      return toReservation(visitId, undefined, res.data);
    } catch (err) {
      lastError = err;
      if (!isNotFoundError(err)) break;
    }
  }

  if (lastError && !isNotFoundError(lastError)) {
    throw new Error(resolveErrorMessage(lastError, "Failed to fetch reservation."));
  }
  return null;
};

export const saveVisitReservationApi = async (
  visitId: number,
  payload: SaveVisitReservationReq
): Promise<VisitReservation> => {
  const body = {
    ...payload,
    visitId,
    receptionId: visitId,
  };

  let lastError: unknown = null;

  for (const endpoint of saveEndpointSpecs) {
    try {
      const path = endpoint.path(visitId);
      const res =
        endpoint.method === "put"
          ? await api.put<ApiResponse<VisitReservation> | VisitReservation>(path, body)
          : await api.post<ApiResponse<VisitReservation> | VisitReservation>(path, body);

      if (isWrappedResponse<VisitReservation>(res.data) && res.data.success === false) {
        throw new Error(res.data.message || "Failed to save reservation.");
      }

      return toReservation(visitId, payload, res.data);
    } catch (err) {
      lastError = err;
      if (!isNotFoundError(err)) break;
    }
  }

  throw new Error(resolveErrorMessage(lastError, "Failed to call reservation save API."));
};

export const deleteVisitReservationApi = async (visitId: number): Promise<void> => {
  let lastError: unknown = null;

  for (const toEndpoint of deleteEndpoints) {
    try {
      const res = await api.delete<ApiResponse<void> | void>(toEndpoint(visitId));
      if (isWrappedResponse<void>(res.data) && res.data.success === false) {
        throw new Error(res.data.message || "Failed to cancel reservation.");
      }
      return;
    } catch (err) {
      lastError = err;
      if (!isNotFoundError(err)) break;
    }
  }

  throw new Error(resolveErrorMessage(lastError, "Failed to call reservation cancel API."));
};
