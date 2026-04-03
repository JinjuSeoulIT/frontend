import axios from "axios";
import type {
  ApiResponse,
  staffCreateRequest,
  staffResponse,
  staffSearchType,
  staffUpdateRequest,
} from "@/features/staff/Basiclnfo/BasiclnfoType";

const STAFF_API_BASE_URL = process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";


const LOCAL_API_BASE_URL =
  process.env.LOCAL_API_BASE_URL ?? "http://localhost:8022";


const staffApi = axios.create({
  baseURL: STAFF_API_BASE_URL,
});

//검색
export async function searchStaffListApi(search: string,searchType: staffSearchType): Promise<ApiResponse<staffResponse[]>> {
  const response = await staffApi.get("/api/staff/search", {params: {search,searchType,},});
  console.log(response);
  return response.data;
}

//리스트
export const StafflistApi = async (): Promise<ApiResponse<staffResponse[]>> => {
  const response = await staffApi.get<ApiResponse<staffResponse[]>>("/api/staff/list");
  return response.data;
};

//단건조회
export const DetailStaffApi = async (staffId: number): Promise<ApiResponse<staffResponse>> => {
  const response = await staffApi.get<ApiResponse<staffResponse>>(`/api/staff/detail/${staffId}`);
  return response.data;
};

//생성
export const createStaffApi = async (staffReq: staffCreateRequest): Promise<ApiResponse<staffResponse>> => {
  const response = await staffApi.post<ApiResponse<staffResponse>>("/api/staff/create", staffReq);
  return response.data;
};

//수정
export const updateStaffApi = async (staffId: number ,staffReq: staffUpdateRequest): Promise<ApiResponse<staffResponse>> => {
  const response = await staffApi.put<ApiResponse<staffResponse>>(`/api/staff/update/${staffId}`, staffReq);
  return response.data;
};


//영구 삭제
export const deleteStaffApi = async (staffId: number): Promise<ApiResponse<void>> => {
  const response = await staffApi.delete<ApiResponse<void>>(`/api/staff/delete/${staffId}`);
  return response.data;
};
