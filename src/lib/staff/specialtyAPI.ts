import axios from "axios";
import type {
  ApiResponse,
  SpecialtyCreateRequest,
  SpecialtyResponse,
  SpecialtyUpdateRequest,
} from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtytypes";

const SPECIALTY_API_BASE_URL =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";

const specialtyApi = axios.create({
  baseURL: SPECIALTY_API_BASE_URL,
});

export const fetchSpecialtyListApi = async (): Promise<ApiResponse<SpecialtyResponse[]>> => {
  const response = await specialtyApi.get<ApiResponse<SpecialtyResponse[]>>("/api/specialty/list");
  return response.data;
};

export const fetchSpecialtyDetailApi = async (
  specialtyId: number | string
): Promise<ApiResponse<SpecialtyResponse>> => {
  const response = await specialtyApi.get<ApiResponse<SpecialtyResponse>>(`/api/specialty/detail/${specialtyId}`);
  return response.data;
};

export const createSpecialtyApi = async (
  specialtyReq: SpecialtyCreateRequest
): Promise<ApiResponse<SpecialtyResponse>> => {
  const response = await specialtyApi.post<ApiResponse<SpecialtyResponse>>(
    "/api/specialty/create",
    specialtyReq
  );
  return response.data;
};

export const updateSpecialtyApi = async (
  specialtyId: number | string,
  specialtyReq: SpecialtyUpdateRequest
): Promise<ApiResponse<SpecialtyResponse>> => {
  const response = await specialtyApi.put<ApiResponse<SpecialtyResponse>>(
    `/api/specialty/update/${specialtyId}`,
    specialtyReq
  );
  return response.data;
};

export const deleteSpecialtyApi = async (
  specialtyId: number | string
): Promise<ApiResponse<void>> => {
  const response = await specialtyApi.delete<ApiResponse<void>>(`/api/specialty/delete/${specialtyId}`);
  return response.data;
};
