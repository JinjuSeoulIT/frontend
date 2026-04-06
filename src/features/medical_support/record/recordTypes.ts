export interface RecordFormType {
  recordId: string;
  receptionId?: number | null;
  nursingId: string;
  recordedAt: string;
  systolicBp: string;
  diastolicBp: string;
  pulse: string;
  respiration: string;
  temperature: string;
  spo2: string;
  observation: string;
  painScore: string;
  consciousnessLevel: string;
  initialAssessment: string;
  pastMedicalHistory?: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  patientName?: string;
  nurseName?: string;
  departmentName?: string;
  heightCm?: string | number;
  weightKg?: string | number;
}

export type RecordTextSearchType =
  | "nurseName"
  | "patientName"
  | "departmentName";

export type RecordSearchType = RecordTextSearchType | "recordedAt";

export type RecordTextSearchPayload = {
  searchType: RecordTextSearchType;
  searchValue: string;
  startDate?: never;
  endDate?: never;
};

export type RecordDateSearchPayload = {
  searchType: "recordedAt";
  searchValue?: never;
  startDate: string;
  endDate: string;
};

export type RecordSearchPayload =
  | RecordTextSearchPayload
  | RecordDateSearchPayload;
