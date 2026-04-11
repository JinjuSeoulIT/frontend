export interface TreatmentResult {
  treatmentResultId?: string | null;
  procedureResultId?: string | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  treatmentAt?: string | null;
  nursingId?: string | null;
  nurseName?: string | null;
  detail?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
}

export interface TreatmentResultCreatePayload {
  progressStatus?: string | null;
  status?: string | null;
  treatmentAt?: string | null;
  nursingId?: string | null;
  nurseName?: string | null;
  detail?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
  procedureResultId?: string | null;
}

export interface TreatmentResultUpdatePayload {
  progressStatus?: string | null;
  status?: string | null;
  treatmentAt?: string | null;
  nursingId?: string | null;
  nurseName?: string | null;
  detail?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
  procedureResultId?: string | null;
}
