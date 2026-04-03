import axios from "axios";
import {
  ApiResponse,
  FileUploadResDTO,
  NurseCreateRequest,
  NurseResponse,
  NurseStaffIdParam,
  NurseUpdateRequest,
  NurseSearchType,
} from "@/features/staff/nurse/nurseTypes";

const NURSE_API_BASE_URL = "http://192.168.1.58:8022";

const apiNurse = axios.create({
  baseURL: NURSE_API_BASE_URL,
});


//검색
export async function searchNurseListApi(search: string,searchType: NurseSearchType): Promise<ApiResponse<NurseResponse[]>> {
  const response = await apiNurse.get("/api/nurse/search", {params: {search,searchType,}});
  return response.data;
}

//조회
export const nurselistApi = async (): Promise<ApiResponse<NurseResponse[]>> => {
  const response = await apiNurse.get<ApiResponse<NurseResponse[]>>(`/api/nurse/list`);
  return response.data;
};

//상세조회
export const DetailNurseApi = async ({ staffId }: NurseStaffIdParam): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.get<ApiResponse<NurseResponse>>(`/api/nurse/detail/${staffId}`);
  return response.data;
};

//생성
export const createNurseApi = async (nurseReq: NurseCreateRequest): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.post<ApiResponse<NurseResponse>>(`/api/nurse/create`, nurseReq);
  return response.data;
};

//수정
export const updateNursedApi = async (staffId: number , nurseReq: NurseUpdateRequest): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.put<ApiResponse<NurseResponse>>(`/api/nurse/edit/${staffId}`, nurseReq);
  return response.data;
};

//영구 삭제
export const deleteNurseApi = async (staffId: number ): Promise<ApiResponse<void>> => {
  const response = await apiNurse.delete<ApiResponse<void>>(`/api/nurse/delete/${staffId}`);
  return response.data;
};

//업로드
export async function uploadFileApi(staffId: number , file: File): Promise<ApiResponse<FileUploadResDTO>> {
  const form = new FormData();
  form.append("NurseFile", file);

  const res = await apiNurse.post<ApiResponse<FileUploadResDTO>>(`/api/nurse/profile/upload/${staffId}`, form);
  return res.data;
}
