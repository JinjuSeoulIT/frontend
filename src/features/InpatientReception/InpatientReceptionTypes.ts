export type ReceptionStatus =
  | "WAITING"
  | "CALLED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAYMENT_WAIT"
  | "ON_HOLD"
  | "CANCELED"
  | "INACTIVE";

export interface InpatientReception {
  receptionId: number;
  receptionNo: string;
  patientId: number;
  visitType: string;
  departmentId: string;
  doctorId?: number | null;
  reservationId?: number | null;
  scheduledAt?: string | null;
  arrivedAt?: string | null;
  status: ReceptionStatus;
  note?: string | null;
  isActive?: boolean;
  admissionPlanAt: string;
  wardId?: number | null;
  roomId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type InpatientReceptionForm = {
  receptionNo: string;
  patientId: number;
  departmentId: string;
  doctorId?: number | null;
  scheduledAt?: string | null;
  arrivedAt?: string | null;
  status?: ReceptionStatus;
  note?: string | null;
  admissionPlanAt: string;
  wardId?: number | null;
  roomId?: number | null;
};

export type InpatientReceptionSearchPayload = {
  type: "patientId" | "status" | "wardId" | "roomId";
  keyword: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

export interface InpatientReceptionState {
  list: InpatientReception[];
  selected: InpatientReception | null;
  loading: boolean;
  error: string | null;
}
