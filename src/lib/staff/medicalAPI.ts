import axios from "axios";
import type {
  ApiResponse,
  MedicalCreateRequest,
  MedicalResponse,
  MedicalUpdateRequest,
} from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtytypes";

const MEDICAL_API_BASE_URL =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";

const medicalApi = axios.create({
  baseURL: MEDICAL_API_BASE_URL,
});

export const fetchMedicalListApi = async (): Promise<ApiResponse<MedicalResponse[]>> => {
  const response = await medicalApi.get<ApiResponse<MedicalResponse[]>>("/api/medical/list");
  return response.data;
};

export const fetchMedicalDetailApi = async (medicalId: number | string): Promise<ApiResponse<MedicalResponse>> => {
  const response = await medicalApi.get<ApiResponse<MedicalResponse>>(`/api/medical/detail/${medicalId}`);
  return response.data;
};

export const createMedicalApi = async (
  medicalReq: MedicalCreateRequest
): Promise<ApiResponse<MedicalResponse>> => {
  const response = await medicalApi.post<ApiResponse<MedicalResponse>>("/api/medical/create", medicalReq);
  return response.data;
};

export const updateMedicalApi = async (
  medicalId: number | string,
  medicalReq: MedicalUpdateRequest
): Promise<ApiResponse<MedicalResponse>> => {
  const response = await medicalApi.put<ApiResponse<MedicalResponse>>(
    `/api/medical/update/${medicalId}`,
    medicalReq
  );
  return response.data;
};

export const deleteMedicalApi = async (medicalId: number | string): Promise<ApiResponse<void>> => {
  const response = await medicalApi.delete<ApiResponse<void>>(`/api/medical/delete/${medicalId}`);
  return response.data;
};
