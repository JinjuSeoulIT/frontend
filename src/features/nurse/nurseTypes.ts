export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type NurseResponse = {
  nurseId: number;
  nurseGrade: string;
  unitId: string;
  shiftType: string;
  department: string;
  employmentType: string;
  status: string;
};

export type NurseCreateRequest = {
  nurseGrade: string;
  unitId: string;
  shiftType: string;
  department: string;
  employmentType: string;
  status: string;
};

export type NurseUpdateRequest = NurseCreateRequest;

export const initialNurseCreateForm: NurseCreateRequest = {
  nurseGrade: "",
  unitId: "",
  shiftType: "",
  department: "",
  employmentType: "",
  status: "",
};

export const initialNurseUpdateForm: NurseUpdateRequest = {
  nurseGrade: "",
  unitId: "",
  shiftType: "",
  department: "",
  employmentType: "",
  status: "",
};
