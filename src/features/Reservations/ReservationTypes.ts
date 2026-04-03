export type ReservationStatus = "RESERVED" | "CANCELED" | "COMPLETED" | "INACTIVE";

export interface Reservation {
  reservationId: number;
  reservationNo: string;
  patientId: number;
  patientName?: string | null;
  departmentId: string;
  departmentName?: string | null;
  doctorId?: number | null;
  doctorName?: string | null;
  reservedAt: string;
  status: ReservationStatus;
  note?: string | null;
  isActive: boolean;
  inactiveAt?: string | null;
  inactiveReasonCode?: string | null;
  inactiveReasonText?: string | null;
  canceledAt?: string | null;
  cancelReasonCode?: string | null;
  cancelReasonText?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type ReservationForm = {
  reservationNo: string;
  patientId?: number | null;
  patientName?: string | null;
  departmentId: string;
  departmentName?: string | null;
  doctorId?: number | null;
  doctorName?: string | null;
  reservedAt: string;
  status?: ReservationStatus;
  note?: string | null;
};

export type PatientOption = {
  patientId: number;
  patientName: string;
};

export type DepartmentOption = {
  departmentId: string;
  departmentName: string;
};

export type DoctorOption = {
  doctorId: number;
  doctorName: string;
  departmentId?: string | null;
};

export type ReservationSearchType =
  | "reservationNo"
  | "patientName"
  | "patientId"
  | "status";

export type ReservationSearchPayload = {
  type: ReservationSearchType;
  keyword: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

export interface ReservationState {
  list: Reservation[];
  selected: Reservation | null;
  loading: boolean;
  error: string | null;
}
