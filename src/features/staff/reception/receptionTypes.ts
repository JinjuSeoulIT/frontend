export type ReceptionResponse = {
  staffId: number ;
  deptId?: string;
  positionId? :String;
  
  name?: string;
  status: string;

  jobTypeCd?: string | null;
  deskNo?: string | null;
  shiftType?: string | null;
  startDate?: string | null;
  windowArea?: string | null;
  multiTask?: string | null;
  rmk?: string | null;
  receptionType?: string | null;
  extNo?: string | null;
};



export type ReceptionIdNumber = {
  staffId: number;
};

export type ReceptionCreateRequest = {
  staffId: number ;
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


  jobTypeCd: string;
  deskNo: string;
  shiftType: string;
  startDate?: string | null;
  windowArea: string;
  multiTask: string;
  rmk: string;
  receptionType: string;
  extNo: string;
};

export const initialReceptionCreateForm: ReceptionCreateRequest = {
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

  jobTypeCd: "",
  deskNo: "",
  shiftType: "",
  startDate: "",
  windowArea: "",
  multiTask: "불가",
  rmk: "",
  receptionType: "RECEPTION",
  extNo: "",
};

export type ReceptionUpdateRequest = {
  staffId: number ;
  jobTypeCd: string;
  deskNo: string;
  shiftType: string;
  startDate: string;
  windowArea: string;
  multiTask: string;
  rmk: string;
  receptionType: string;
  extNo: string;
};

export const initialReceptionUpdateForm: ReceptionUpdateRequest = {
  staffId: 0,
  jobTypeCd: "",
  deskNo: "",
  shiftType: "",
  startDate: "",
  windowArea: "",
  multiTask: "불가",
  rmk: "",
  receptionType: "RECEPTION",
  extNo: "",
};

export type ReceptionUpdateNumber = {
  staffId: number;
  receptionReq: ReceptionUpdateRequest;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ReceptionSearchType =
  | "all"
  | "name"
  | "staffId"
  | "dept"
  | "jobTypeCd"
  | "deskNo"
  | "shiftType"
  | "receptionType"
  | "extNo";

export type SearchReceptionPayload = {
  search: string;
  searchType: ReceptionSearchType;
};
