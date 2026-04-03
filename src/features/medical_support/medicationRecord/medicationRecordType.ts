export interface MedicationRecord {
  medicationId: string | number;
  orderItemId?: string | number | null;
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  nurseId?: string | number | null;
  status?: string | null;
}

export interface MedicationRecordCreatePayload {
  medicationId?: string | number | null;
  orderItemId?: string | number | null;
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  nurseId?: string | number | null;
  status?: string | null;
}

export interface MedicationRecordUpdatePayload {
  orderItemId?: string | number | null;
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  nurseId?: string | number | null;
  status?: string | null;
}