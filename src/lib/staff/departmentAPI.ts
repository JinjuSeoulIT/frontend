import axios from "axios";
import {
  ApiResponse,
  DepartmentCreateRequest,
  DepartmentResponse,
  DepartmentUpdateRequest,
} from "@/features/staff/department/departmentType";

const DEPARTMENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";


const LOCAL_API_BASE_URL =
  process.env.LOCAL_API_BASE_URL ?? "http://localhost:8022";


const departmentApi = axios.create({
  baseURL: DEPARTMENT_API_BASE_URL,
});




export const fetchDepartmentListApi = async (): Promise<ApiResponse<DepartmentResponse[]>> => {
  const response = await departmentApi.get<ApiResponse<DepartmentResponse[]>>("/api/department/list");
  return response.data;
};


export const fetchDepartmentDetailApi = async (deptId: string): 
Promise<ApiResponse<DepartmentResponse>> => {
  const response = await departmentApi.get<ApiResponse<DepartmentResponse>>(`/api/department/detail/${deptId}`);
  return response.data;
};


export const createDepartmentApi = async (deptDto: DepartmentCreateRequest): 
Promise<ApiResponse<DepartmentResponse>> => {
  const response = await departmentApi.post<ApiResponse<DepartmentResponse>>("/api/department/create", deptDto);
  return response.data;
};


export const updateDepartmentApi = async (
  deptId: string,
  deptDto: DepartmentUpdateRequest
): Promise<ApiResponse<DepartmentUpdateRequest>> => {
  const response = await departmentApi.put<ApiResponse<DepartmentResponse>>(`/api/department/update/${deptId}`, deptDto);
  return response.data;
};


export const deleteDepartmentApi = async (deptId: string): Promise<ApiResponse<void>> => {
  const response = await departmentApi.delete<ApiResponse<void>>(`/api/department/delete/${deptId}`);
  return response.data;
};
