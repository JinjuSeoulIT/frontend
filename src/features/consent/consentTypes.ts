export interface Consent {
  consentId: number;
  patientId: number;
  consentType: string;
  activeYn: boolean;
  agreedAt?: string | null;
  withdrawnAt?: string | null;
  fileUrl?: string | null;
  note?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ConsentCreateReq {
  patientId: number;
  consentType: string;
  fileUrl?: string;
  note?: string;
}

export interface ConsentUpdateReq {
  activeYn?: boolean;
  fileUrl?: string;
  note?: string;
  agreedAt?: string;
  withdrawnAt?: string;
}

export interface ConsentState {
  list: Consent[];
  loading: boolean;
  error: string | null;
}

