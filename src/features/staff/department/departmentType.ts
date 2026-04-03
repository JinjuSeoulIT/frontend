export type DepartmentResponse = {
  deptId: string;
  deptCode: string;
  deptName: string;
  parentDeptId: string;
  deptTypeCd: string;
  headDeptId?: string;
  headDeptName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}










export type DepartmentNumber = {
  deptId: string;
};

//생성타입

export type DepartmentCreateRequest ={
  deptId: string;
  deptCode: string;
  deptName: string;
  parentDeptId: string;
  deptTypeCd: string ;
  headDeptId?: string;
  headDeptName?: string;
  status: string;
}

export const initialDeptCreateForm: DepartmentCreateRequest = {
  deptId: "",
  deptCode: "",
  deptName: "",
  parentDeptId: "",
  deptTypeCd: "",
  headDeptId: "",
  headDeptName: "",
  status: "ACTIVE",
};










//업데이트 타입
export type DepartmentUpdateRequest ={
  deptId: string;
  deptCode: string;
  deptName: string;
  parentDeptId?: string;
  deptTypeCd?: string;
  headDeptId?: string;
  headDeptName?: string;
  status?: string;
}

export const initialDeptUpdateForm: DepartmentUpdateRequest = {
  deptId: "",
  deptCode: "",
  deptName: "",
  parentDeptId: "",
  deptTypeCd: "",
  headDeptId: "",
  headDeptName: "",
  status: "ACTIVE",
};

export type DepartmentUpdatePayload = {
  deptId: string;
  deptReq: DepartmentUpdateRequest;
};



  
export const DEPT_ID = [
  { value: "DEPT_MED", label: "진료부(DEPT_MED)" },
  { value: "DEPT_NURSING", label: "간호부(DEPT_NURSING)" },
  { value: "DEPT_RECEPTION", label: "원무부(DEPT_RECEPTION)" },
  { value: "DEPT_ADMIN", label: "행정부(DEPT_ADMIN)" },
];



export const DeptTypeLabel = (value?: string) => {
  switch (value) {
    case "MEDICAL": return "진료";
    case "NURSING": return "간호";
    case "ADMIN": return "행정";
    case "RECEPTION": return "원무";
    default: return value || "-";
}
};






export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
