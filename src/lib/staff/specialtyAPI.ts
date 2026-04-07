import axios from "axios";
import { STAFF_API_BASE_URL } from "@/lib/common/env";
import type {
  ApiResponse,
  SpecialtyCreateRequest,
  SpecialtyResponse,
  SpecialtyUpdateRequest,
} from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtytypes";

const API_BASE_URL = STAFF_API_BASE_URL;

const specialtyApi = axios.create({
  baseURL: API_BASE_URL,
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
