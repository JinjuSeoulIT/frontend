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

/*
// ❌ 기록일시 검색 안 쓸 때 기존 타입
export type RecordSearchType = RecordTextSearchType | "recordedAt";
*/

// ✅ 기록일시 검색 제외
export type RecordSearchType = RecordTextSearchType;

export type RecordTextSearchPayload = {
  searchType: RecordTextSearchType;
  searchValue: string;
  startDate?: never;
  endDate?: never;
};

/*
// ❌ 기록일시 검색 안 쓸 때 기존 payload
export type RecordDateSearchPayload = {
  searchType: "recordedAt";
  searchValue?: never;
  startDate: string;
  endDate: string;
};
*/

/*
// ❌ 기록일시 검색 포함했을 때 기존 union
export type RecordSearchPayload =
  | RecordTextSearchPayload
  | RecordDateSearchPayload;
*/

// ✅ 기록일시 검색 제외
export type RecordSearchPayload = RecordTextSearchPayload;