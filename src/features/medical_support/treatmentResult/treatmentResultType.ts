export interface TreatmentResult {
  procedureResultId: string | number;
  status?: string | null;
  performedAt?: string | null;
  performerId?: string | number | null;
  detail?: string | null;
}

export interface TreatmentResultCreatePayload {
  procedureResultId?: string | number | null;
  status?: string | null;
  performedAt?: string | null;
  performerId?: string | number | null;
  detail?: string | null;
}

export interface TreatmentResultUpdatePayload {
  status?: string | null;
  performedAt?: string | null;
  performerId?: string | number | null;
  detail?: string | null;
}