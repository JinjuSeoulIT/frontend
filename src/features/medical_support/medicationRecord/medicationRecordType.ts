export interface MedicationRecord {
  medicationId: string | number;
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  nurseId?: string | number | null;
  status?: string | null;
}

export interface MedicationRecordCreatePayload {
  medicationId?: string | number | null;
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  nurseId?: string | number | null;
  status?: string | null;
}

export interface MedicationRecordUpdatePayload {
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  nurseId?: string | number | null;
  status?: string | null;
}
