export type ReceptionStatus =
  | "REGISTERED"
  | "WAITING"
  | "CALLED"
  | "TRIAGE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAYMENT_WAIT"
  | "OBSERVATION"
  | "ON_HOLD"
  | "CANCELED"
  | "INACTIVE"
  | "TRANSFERRED";

export interface EmergencyReception {
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
  triageLevel: number;
  chiefComplaint: string;
  vitalTemp?: number | null;
  vitalBpSystolic?: number | null;
  vitalBpDiastolic?: number | null;
  vitalHr?: number | null;
  vitalRr?: number | null;
  vitalSpo2?: number | null;
  arrivalMode?: string | null;
  triageNote?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type EmergencyReceptionForm = {
  receptionNo: string;
  patientId: number;
  departmentId: string;
  doctorId?: number | null;
  scheduledAt?: string | null;
  arrivedAt?: string | null;
  status?: ReceptionStatus;
  note?: string | null;
  triageLevel: number;
  chiefComplaint: string;
  vitalTemp?: number | null;
  vitalBpSystolic?: number | null;
  vitalBpDiastolic?: number | null;
  vitalHr?: number | null;
  vitalRr?: number | null;
  vitalSpo2?: number | null;
  arrivalMode?: string | null;
  triageNote?: string | null;
};

export type EmergencyReceptionSearchPayload = {
  type: "patientId" | "status" | "triageLevel";
  keyword: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

export interface EmergencyReceptionState {
  list: EmergencyReception[];
  selected: EmergencyReception | null;
  lastCreated: EmergencyReception | null;
  loading: boolean;
  error: string | null;
}
