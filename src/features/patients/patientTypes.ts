export type ContactPriority = "PATIENT" | "GUARDIAN" | string;

export interface Patient {
  patientId: number;
  patientNo?: string | null;
  name: string;
  gender?: "M" | "F" | string | null;
  birthDate?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  addressDetail?: string | null;

  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelation?: string | null;
  isForeigner?: boolean | null;
  contactPriority?: ContactPriority | null;
  note?: string | null;

  isVip?: boolean | null;
  /** @deprecated DB 컬럼 제거됨. 하위 호환용 optional */
  photoUrl?: string | null;
  statusCode?: string | null;
}

export interface PatientFamilyForm {
  relation: string;
  familyName: string;
  familyPhone?: string;
  isPrimary?: boolean;
}

export interface PatientForm {
  name: string;
  email?: string;
  gender?: "M" | "F" | string;
  birthDate?: string;
  phone?: string;
  address?: string;
  addressDetail?: string;

  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  isForeigner?: boolean;
  isVip?: boolean;
  contactPriority?: ContactPriority;
  note?: string;

  consentRequired?: boolean;
  consentOptional?: boolean;
  families?: PatientFamilyForm[];
  photoFile?: File | null;
}

export interface PatientSearchPayload {
  type: "patientId" | "patientNo" | "name" | "phone" | "birthDate";
  keyword: string;
}


export interface PatientMultiSearchPayload {
  name?: string;
  birthDate?: string;
  phone?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  result: T;
}

export interface PatientState {
  list: Patient[];
  selected: Patient | null;
  loading: boolean;
  error: string | null;
}


