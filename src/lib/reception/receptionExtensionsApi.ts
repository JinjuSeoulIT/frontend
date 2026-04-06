import axios from "axios";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

export type ExtensionQueryResult<T> = {
  supported: boolean;
  data: T | null;
  message?: string;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

const RECEPTION_EXT_RECEPTIONS_PATH =
  process.env.NEXT_PUBLIC_RECEPTION_EXTENSION_RECEPTIONS_PATH ?? "/api/receptions";
const RECEPTION_EXT_RESERVATIONS_PATH =
  process.env.NEXT_PUBLIC_RECEPTION_EXTENSION_RESERVATIONS_PATH ?? "/api/reservations";
const RECEPTION_EXT_INPATIENT_PATH =
  process.env.NEXT_PUBLIC_RECEPTION_EXTENSION_INPATIENT_PATH ?? "/api/inpatient-receptions";
const RECEPTION_EXT_CLOSURE_REASONS_PATH =
  process.env.NEXT_PUBLIC_RECEPTION_EXTENSION_CLOSURE_REASONS_PATH ??
  `${RECEPTION_EXT_RECEPTIONS_PATH}/closure-reasons`;

function unwrap<T>(raw: ApiResponse<T> | T): T {
  if (raw && typeof raw === "object" && "result" in (raw as ApiResponse<T>)) {
    return ((raw as ApiResponse<T>).result ?? null) as T;
  }
  return raw as T;
}

async function getWithSupport<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<ExtensionQueryResult<T>> {
  try {
    const res = await api.get<ApiResponse<T> | T>(url, { params });
    const wrapped = res.data as ApiResponse<T>;
    if (wrapped && typeof wrapped === "object" && wrapped.success === false) {
      return {
        supported: true,
        data: null,
        message: wrapped.message || "조회 실패",
      };
    }
    return { supported: true, data: unwrap<T>(res.data) };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return {
        supported: false,
        data: null,
        message: "백엔드 엔드포인트가 아직 구현되지 않았습니다. (404)",
      };
    }
    const message =
      axios.isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message ?? err.message)
        : err instanceof Error
          ? err.message
          : "알 수 없는 오류";
    return { supported: true, data: null, message };
  }
}

const receptionBase = (receptionId: number) => `${RECEPTION_EXT_RECEPTIONS_PATH}/${receptionId}`;
const reservationBase = (reservationId: number) =>
  `${RECEPTION_EXT_RESERVATIONS_PATH}/${reservationId}`;
const inpatientBase = (receptionId: number) => `${RECEPTION_EXT_INPATIENT_PATH}/${receptionId}`;

export const fetchReceptionQualificationSnapshots = (receptionId: number) =>
  getWithSupport<unknown[]>(`${receptionBase(receptionId)}/qualification-snapshots`);

export const fetchReceptionQualificationItems = (receptionId: number) =>
  getWithSupport<unknown[]>(`${receptionBase(receptionId)}/qualification-items`);

export const fetchReceptionCallHistory = (receptionId: number) =>
  getWithSupport<unknown[]>(`${receptionBase(receptionId)}/call-history`);

export const fetchReceptionVisitClosure = (receptionId: number) =>
  getWithSupport<unknown>(`${receptionBase(receptionId)}/visit-closure`);

export const fetchReceptionClosureReasons = () =>
  getWithSupport<unknown[]>(RECEPTION_EXT_CLOSURE_REASONS_PATH);

export const fetchReceptionVisitClosureHistory = (receptionId: number) =>
  getWithSupport<unknown[]>(`${receptionBase(receptionId)}/visit-closure-history`);

export const fetchReceptionSettlementSnapshots = (receptionId: number) =>
  getWithSupport<unknown[]>(`${receptionBase(receptionId)}/settlement-snapshots`);

export const fetchReceptionAudit = (receptionId: number) =>
  getWithSupport<unknown[]>(`${receptionBase(receptionId)}/audits`);

export const fetchReservationStatusHistory = (reservationId: number) =>
  getWithSupport<unknown[]>(`${reservationBase(reservationId)}/status-history`);

export const fetchReservationDoctorSchedules = (reservationId: number) =>
  getWithSupport<unknown[]>(`${reservationBase(reservationId)}/doctor-schedules`);

export const fetchReservationTimeSlots = (reservationId: number) =>
  getWithSupport<unknown[]>(`${reservationBase(reservationId)}/time-slots`);

export const fetchReservationBookingRules = (reservationId: number) =>
  getWithSupport<unknown[]>(`${reservationBase(reservationId)}/booking-rules`);

export const fetchReservationToReceptionHistory = (reservationId: number) =>
  getWithSupport<unknown[]>(`${reservationBase(reservationId)}/to-reception-history`);

export const fetchInpatientAdmissionDecision = (receptionId: number) =>
  getWithSupport<unknown>(`${inpatientBase(receptionId)}/admission-decision`);

export const fetchInpatientBedAssignmentHistory = (receptionId: number) =>
  getWithSupport<unknown[]>(`${inpatientBase(receptionId)}/bed-assignment-history`);

export const fetchInpatientAdmissionAudit = (receptionId: number) =>
  getWithSupport<unknown[]>(`${inpatientBase(receptionId)}/admission-audits`);
