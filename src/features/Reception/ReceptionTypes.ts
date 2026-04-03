export type ReceptionStatus =
  | "WAITING"
  | "CALLED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAYMENT_WAIT"
  | "ON_HOLD"
  | "CANCELED"
  | "INACTIVE";

export interface Reception {
  receptionId: number;
  receptionNo: string;
  patientId: number;
  patientName?: string | null;
  visitType: string;
  departmentId: string;
  departmentName?: string | null;
  doctorId?: number | null;
  doctorName?: string | null;
  reservationId?: number | null;
  scheduledAt?: string | null;
  arrivedAt?: string | null;
  status: ReceptionStatus;
  note?: string | null;
  isActive?: boolean | null;
  inactiveAt?: string | null;
  inactiveReasonCode?: string | null;
  inactiveReasonText?: string | null;
  cancelReasonCode?: string | null;
  cancelReasonText?: string | null;
  holdReasonCode?: string | null;
  holdReasonText?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ReceptionForm {
  receptionNo: string;
  patientId?: number | null;
  patientName?: string | null;
  visitType: string;
  departmentId?: string | null;
  departmentName?: string | null;
  doctorId?: number | null;
  doctorName?: string | null;
  reservationId?: number | null;
  scheduledAt?: string | null;
  arrivedAt?: string | null;
  status?: ReceptionStatus;
  note?: string | null;
}

export interface ReceptionSearchPayload {
  type: "receptionNo" | "patientId" | "patientName" | "status";
  keyword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  result: T;
}

export interface ReceptionState {
  list: Reception[];
  selected: Reception | null;
  loading: boolean;
  error: string | null;
}
