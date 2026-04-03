export interface Insurance {
  insuranceId: number;
  patientId: number;
  insuranceType: string;
  policyNo?: string | null;
  activeYn: boolean;
  verifiedYn: boolean;
  startDate?: string | null;
  endDate?: string | null;
  note?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface InsuranceHistory {
  historyId: number;
  insuranceId: number;
  patientId: number;
  changeType: string;
  beforeData?: string | null;
  afterData?: string | null;
  changedBy?: string | null;
  changedAt?: string | null;
}

export interface InsuranceCreateReq {
  patientId: number;
  insuranceType: string;
  policyNo?: string;
  verifiedYn?: boolean;
  startDate?: string;
  endDate?: string;
  note?: string;
}

export interface InsuranceUpdateReq {
  insuranceType?: string;
  policyNo?: string;
  activeYn?: boolean;
  verifiedYn?: boolean;
  startDate?: string;
  endDate?: string;
  note?: string;
}

export interface InsuranceState {
  list: Insurance[];
  loading: boolean;
  error: string | null;
}
