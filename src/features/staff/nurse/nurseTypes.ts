// ✅ 간호사 응답(서버 → 프론트)
export type NurseResponse = {
  staffId: number;
  deptId?: string;
  positionId? :String;
  name?: string;
  status : string;

  licenseNo: string;
  nurseType: string;
  shiftType: string;
  nurseFileUrl: string | null;
  extNo: string;
  education: string;
  careerDetail: string;
};



export type NurseStaffIdParam = {
  staffId: number;
};






//생성
export type NurseIdNumber = {
  staffId: number;
};

export type NurseCreateRequest = {
  staffId: number;
  deptId: string;
  positionId? :String;

  name: string;
  phone: string;
  email: string;
  birthDate: string;
  genderCode: string;
  zipCode: string;
  address1: string;
  address2: string;
  status: string;

  licenseNo: string;
  nurseType?: string | null;
  shiftType: string;
  nurseFileUrl: string | null;
  extNo: string;
  education: string;
  careerDetail: string;
};

export const initialNurseCreateForm: NurseCreateRequest = {
  staffId: 0,
  deptId: "",
  positionId :"",
  
  name: "",
  phone: "",
  email: "",
  birthDate: "",
  genderCode: "",
  zipCode: "",
  address1: "",
  address2: "",
  status: "ACTIVE",

  licenseNo: "",
  nurseType: "NURSE",
  shiftType: "",
  nurseFileUrl: "",
  extNo: "",
  education: "",
  careerDetail: "",
};
//생성




///수정
export type NurseUpdateRequest = {
  staffId: number;
  licenseNo: string;
  shiftType: string;
  nurseFileUrl: string | null;
  extNo: string;
  education: string;
  careerDetail: string;
};

export const initialNurseUpdateForm: NurseUpdateRequest = {
  staffId: 0,
  licenseNo: "",
  shiftType: "",
  nurseFileUrl: "",
  extNo: "",
  education: "",
  careerDetail: "",
};
export type NurseUpdateNumber = {
  staffId: number;
  nurseReq: NurseUpdateRequest;
};
///수정




export type NurseFile = {
  staffId: number 
  file: File;
};

export type FileUploadResDTO = {
  fileUrl: string;
  objectKey: string;
  contentType: string;
  size: number;
  originalName: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

//컴포넌트 타입
export type Props = { params: Promise<{ id: string }> };


//검색 타입
export type NurseSearchType = "all" | "name" | "staffId" | "dept" | "shiftType" | "extNo";

export type SearchNursePayload = {
  search: string;
  searchType: NurseSearchType;
};
