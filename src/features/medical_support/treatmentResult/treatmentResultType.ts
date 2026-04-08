export interface TreatmentResult {
  treatmentResultId?: string | null;
  procedureResultId?: string | null;
  status?: string | null;
  createdAt?: string | null;
  nursingId?: string | null;
  detail?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
}

export interface TreatmentResultCreatePayload {
  status?: string | null;
  nursingId?: string | null;
  detail?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
  procedureResultId?: string | null;
}

export interface TreatmentResultUpdatePayload {
  status?: string | null;
  nursingId?: string | null;
  detail?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
  procedureResultId?: string | null;
}
