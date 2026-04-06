import axios from "axios";
import type {
  ApiResponse,
  Reservation,
  ReservationForm,
  ReservationSearchType,
} from "@/features/Reservations/ReservationTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

const normalizeDepartmentId = (value: unknown) => String(value ?? "").trim();

const normalizeReservation = (item: Reservation): Reservation => ({
  ...item,
  departmentId: normalizeDepartmentId(
    (item as Reservation & { departmentId?: unknown }).departmentId
  ),
});

export const fetchReservationsApi = async (): Promise<Reservation[]> => {
  const res = await api.get<ApiResponse<Reservation[]>>("/api/reservations");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return (res.data.result ?? []).map(normalizeReservation);
};

export const fetchReservationApi = async (reservationId: string): Promise<Reservation> => {
  const res = await api.get<ApiResponse<Reservation>>(
    `/api/reservations/${reservationId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return normalizeReservation(res.data.result);
};

export const createReservationApi = async (form: ReservationForm): Promise<void> => {
  const res = await api.post<ApiResponse<void>>("/api/reservations", form);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
};

export const updateReservationApi = async (
  reservationId: string,
  form: ReservationForm
): Promise<void> => {
  const res = await api.put<ApiResponse<void>>(
    `/api/reservations/${reservationId}`,
    form
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
};

export const searchReservationsApi = async (
  type: ReservationSearchType,
  keyword: string
): Promise<Reservation[]> => {
  const res = await api.get<ApiResponse<Reservation[]>>("/api/reservations", {
    params: { searchType: type, searchValue: keyword },
  });

  if (!res.data.success) {
    return [];
  }
  return (res.data.result ?? []).map(normalizeReservation);
};
