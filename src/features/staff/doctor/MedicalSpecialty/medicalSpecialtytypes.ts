
// =========================
// Medical
// 화면 기준: 컬럼이 많은 과목 등록 마스터
// =========================
export type MedicalResponse = {
  specialtyId?: number;
  specialtyName?: string;
  specialtyCode?: string;
  description: string;
  rmk: string;
  status: string;
};






export type MedicalCreateRequest = {
  specialtyId?: number;
  specialtyName?: string;
  specialtyCode?: string;
  description: string;
  rmk: string;
  status: string;
};

export const initialMedicalCreateForm: MedicalCreateRequest = {
  specialtyId: 0,
  specialtyName: "",
  specialtyCode: "",
  description: "",
  status: "ACTIVE",
  rmk: "",
};




//수정
export type MedicalUpdatePayload = {
  specialtyId: number;
  medicalReq: MedicalUpdateRequest;
};


export type MedicalUpdateRequest = {
  specialtyId: number;
  specialtyName?: string;
  specialtyCode?: string;
  description: string;
  rmk: string;
  status: string;

};


export const initialMedicalUpdateForm: MedicalUpdateRequest = {
  specialtyId: 0,
  specialtyName: "",
  specialtyCode: "",
  description: "",
  status: "ACTIVE",
  rmk: "",
};



// =========================
// Specialty
// 화면 기준: doctor + medical 배정 정보
// =========================
export type SpecialtyResponse = {
  specialtyAssignId?: string;
  staffId?: number;
  doctorName?: string;
  name?: string;
  doctorType?: string;
  specialtyId?: number | string;
  assignedAt?: string;
  primaryYn?: string;
  description?: string;
  rmk?: string;
  status?: string;
};


//생성
export type SpecialtyCreateRequest = {
  staffId: number;
  specialtyId: number;
  assignedAt: string;
  primaryYn: string;
  rmk: string;
};

export const initialSpecialtyCreateForm: SpecialtyCreateRequest = {
  staffId: 0,
  specialtyId: 0,
  assignedAt: "",
  primaryYn: "Y",
  rmk: "",

};

//수정


export type SpecialtyUpdatePayload = {
  specialtyId: number;
  specialtyReq: SpecialtyUpdateRequest;
};


export type SpecialtyUpdateRequest = {
  assignedAt: string;
  primaryYn: string;
  rmk: string;
};



export const initialSpecialtyUpdateForm: SpecialtyUpdateRequest = {
  assignedAt: "",
  primaryYn: "Y",
  rmk: "",
};



export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
