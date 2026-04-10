export interface MedicationRecord {
  medicationRecordId?: string | null;
  medicationId?: string | null;
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  doseKind?: string | null;
  nursingId?: string | null;
  nurseName?: string | null;
  status?: string | null;
  createdAt?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
}

export interface MedicationRecordCreatePayload {
  medicationId?: string | null;
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  doseKind?: string | null;
  nursingId?: string | null;
  nurseName?: string | null;
  status?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
}

export interface MedicationRecordUpdatePayload {
  medicationId?: string | null;
  administeredAt?: string | null;
  doseNumber?: number | string | null;
  doseUnit?: string | null;
  doseKind?: string | null;
  nursingId?: string | null;
  nurseName?: string | null;
  status?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
}
