// ✅ 의사 응답
export type DoctorResponse = {
  staffId: number;
  deptId?: string;
  positionId?: string;

  name?: string;
  status: string;

  licenseNo: string;
  doctorType: string | null;
  specialtyId: number | string;
  doctorFileUrl: string | null;
  extNo: string;
  profileSummary: string;
  education: string;
  careerDetail: string;
};

// ✅ staffId를 URL/path variable로 보낼 때는 number로 고정
// 이유: 문자열 "undefined"가 들어가면 백엔드 Long 변환에서 바로 터짐
export type DoctorStaffIdParam = {
  staffId: number;
};

// ✅ 상세/수정/업로드 컴포넌트 공통 props
export type DoctorIdNumber = {
  staffId: number;
};

// ✅ 의사 생성/수정은 의사 상세 테이블 컬럼만 전송
export type DoctorCreateRequest = {
  staffId: number;
  deptId: string;
  positionId?: string;

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
  specialtyId: string;
  doctorType?: string | null;
  doctorFileUrl: string | null;
  extNo: string;
  profileSummary: string;
  education: string;
  careerDetail: string;
};

export const initialDoctorCreateForm: DoctorCreateRequest = {
  staffId: 0,
  deptId: "",
  positionId: "",

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
  specialtyId: "",
  doctorType: "DOCTOR",
  doctorFileUrl: "",
  extNo: "",
  profileSummary: "",
  education: "",
  careerDetail: "",
};

// 수정
export type DoctorUpdateRequest = {
  staffId: number;
  licenseNo: string;
  specialtyId: string;
  doctorFileUrl: string | null;
  extNo: string;
  profileSummary: string;
  education: string;
  careerDetail: string;
};

export const initialDoctorUpdateForm: DoctorUpdateRequest = {
  staffId: 0,
  licenseNo: "",
  specialtyId: "",
  doctorFileUrl: "",
  extNo: "",
  profileSummary: "",
  education: "",
  careerDetail: "",
};

export type DoctorUpdateNumber = {
  staffId: number;
  doctorReq: DoctorUpdateRequest;
};

export type DoctorFile = {
  staffId: number;
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

// 컴포넌트 타입
export type Props = { params: Promise<{ id: string }> };

// 검색 타입
export type DoctorSearchType = "all" | "name" | "specialty" | "staffId" | "dept" | "extNo";

export type SearchDoctorPayload = {
  search: string;
  searchType: DoctorSearchType;
};
