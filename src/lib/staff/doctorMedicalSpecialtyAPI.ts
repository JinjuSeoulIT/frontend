import axios from "axios";
import type {
  ApiResponse,
  MedicalCreateRequest,
  MedicalResponse,
  MedicalUpdateRequest,
  SpecialtyCreateRequest,
  SpecialtyResponse,
  SpecialtyUpdateRequest,
} from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtytypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";

const doctorMedicalSpecialtyAPI = axios.create({
  baseURL: API_BASE_URL,
});

// =========================
// Medical API
// =========================
export const fetchMedicalListApi = async (): Promise<ApiResponse<MedicalResponse[]>> => {
  const response = await doctorMedicalSpecialtyAPI.get<ApiResponse<MedicalResponse[]>>("/api/medical/list");
  return response.data;
};

export const fetchMedicalDetailApi = async (medicalId: number): Promise<ApiResponse<MedicalResponse>> => {
  const response = await doctorMedicalSpecialtyAPI.get<ApiResponse<MedicalResponse>>(`/api/medical/detail/${medicalId}`);
  return response.data;
};

export const createMedicalApi = async (
  medicalReq: MedicalCreateRequest
): Promise<ApiResponse<MedicalResponse>> => {
  const response = await doctorMedicalSpecialtyAPI.post<ApiResponse<MedicalResponse>>(
    "/api/medical/create",
    medicalReq
  );
  return response.data;
};

export const updateMedicalApi = async (
  medicalId: number ,medicalReq: MedicalUpdateRequest
): Promise<ApiResponse<MedicalResponse>> => {
  const response = await doctorMedicalSpecialtyAPI.put<ApiResponse<MedicalResponse>>(
    `/api/medical/update/${medicalId}`,
    medicalReq
  );
  return response.data;
};

export const deleteMedicalApi = async (medicalId: number | string): Promise<ApiResponse<void>> => {
  const response = await doctorMedicalSpecialtyAPI.delete<ApiResponse<void>>(`/api/medical/delete/${medicalId}`);
  return response.data;
};

// =========================
// Specialty API
// =========================
export const fetchSpecialtyListApi = async (): Promise<ApiResponse<SpecialtyResponse[]>> => {
  const response = await doctorMedicalSpecialtyAPI.get<ApiResponse<SpecialtyResponse[]>>("/api/specialty/list");
  return response.data;
};

export const fetchSpecialtyDetailApi = async (
  specialtyId: number | string
): Promise<ApiResponse<SpecialtyResponse>> => {
  const response = await doctorMedicalSpecialtyAPI.get<ApiResponse<SpecialtyResponse>>(`/api/specialty/detail/${specialtyId}`);
  return response.data;
};

export const createSpecialtyApi = async (
  specialtyReq: SpecialtyCreateRequest
): Promise<ApiResponse<SpecialtyResponse>> => {
  const response = await doctorMedicalSpecialtyAPI.post<ApiResponse<SpecialtyResponse>>(
    "/api/specialty/create",
    specialtyReq
  );
  return response.data;
};

export const updateSpecialtyApi = async (
  specialtyId: number | string,
  specialtyReq: SpecialtyUpdateRequest
): Promise<ApiResponse<SpecialtyResponse>> => {
  const response = await doctorMedicalSpecialtyAPI.put<ApiResponse<SpecialtyResponse>>(
    `/api/specialty/update/${specialtyId}`,
    specialtyReq
  );
  return response.data;
};

export const deleteSpecialtyApi = async (
  specialtyId: number | string
): Promise<ApiResponse<void>> => {
  const response = await doctorMedicalSpecialtyAPI.delete<ApiResponse<void>>(`/api/specialty/delete/${specialtyId}`);
  return response.data;
};
