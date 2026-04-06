import axios from "axios";
import { STAFF_API_BASE_URL } from "@/lib/common/env";
import type {
  ApiResponse,
  DoctorCreateRequest,
  DoctorResponse,
  DoctorSearchType,
  DoctorStaffIdParam,
  DoctorUpdateRequest,
  FileUploadResDTO,
} from "../../features/staff/doctor/doctortypes";

const API_BASE_URL = STAFF_API_BASE_URL;

const doctorAPI = axios.create({
  baseURL: API_BASE_URL,
});

// 검색
export async function searchDoctorListApi(search: string, searchType: DoctorSearchType): Promise<ApiResponse<DoctorResponse[]>> {
  const response = await doctorAPI.get("/api/doctor/search", { params: { search, searchType } });
  console.log(response);
  return response.data;
}

// 리스트
export const DoctorProfileListApi = async (): Promise<ApiResponse<DoctorResponse[]>> => {
  const res = await doctorAPI.get<ApiResponse<DoctorResponse[]>>(`/api/doctor/list`);
  return res.data;
};

// 상세
export const DoctorProfileDetailApi = async ({ staffId }: DoctorStaffIdParam): Promise<ApiResponse<DoctorResponse>> => {
  // ✅ 프론트에서 실수로 undefined/NaN이 들어오면 여기서도 한 번 더 막음
  if (!Number.isFinite(staffId)) {
    throw new Error(`유효하지 않은 staffId: ${staffId}`);
  }

  const res = await doctorAPI.get<ApiResponse<DoctorResponse>>(`/api/doctor/detail/${staffId}`);
  return res.data;
};

// 생성
export const createDoctorApi = async (doctorReq: DoctorCreateRequest): Promise<ApiResponse<DoctorResponse>> => {
  const res = await doctorAPI.post<ApiResponse<DoctorResponse>>(`/api/doctor/create`, doctorReq);
  return res.data;
};

// 수정
export const updateDoctorApi = async (staffId: number , doctorReq: DoctorUpdateRequest): Promise<ApiResponse<DoctorResponse>> => {
  const res = await doctorAPI.patch<ApiResponse<DoctorResponse>>(`/api/doctor/update/${staffId}`, doctorReq);
  return res.data;
};

// 영구 삭제
export const deleteDoctorApi = async (staffId: number ): Promise<ApiResponse<void>> => {
  const res = await doctorAPI.delete<ApiResponse<void>>(`/api/doctor/delete/${staffId}`);
  return res.data;
};

export async function uploadFileApi(staffId: number , file: File): Promise<ApiResponse<FileUploadResDTO>> {
  const form = new FormData();
  form.append("DoctorFile", file);
  const res = await doctorAPI.post<ApiResponse<FileUploadResDTO>>(`/api/doctor/profile/upload/${staffId}`, form);
  return res.data;
}
