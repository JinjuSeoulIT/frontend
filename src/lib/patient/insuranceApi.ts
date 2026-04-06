import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  Insurance,
  InsuranceCreateReq,
  InsuranceUpdateReq,
  InsuranceHistory,
} from "@/features/insurance/insuranceTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181",
});


// 환자 보험 목록 조회
export const fetchInsuranceListApi = async (
  patientId: number
): Promise<Insurance[]> => {
  const res = await api.get<ApiResponse<Insurance[]>>(
    `/api/insurances`,
    { params: { patientId } }
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "보험 조회 실패");
  }
  return res.data.result;
};

// 현재 유효 보험 조회
export const fetchValidInsuranceApi = async (
  patientId: number
): Promise<Insurance | null> => {
  const res = await api.get<ApiResponse<Insurance | null>>(
    `/api/insurances/valid`,
    { params: { patientId } }
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "유효 보험 조회 실패");
  }
  return res.data.result ?? null;
};

// 보험 이력 조회
export const fetchInsuranceHistoryApi = async (
  patientId: number
): Promise<InsuranceHistory[]> => {
  const res = await api.get<ApiResponse<InsuranceHistory[]>>(
    `/api/insurances/history`,
    { params: { patientId } }
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "보험 이력 조회 실패");
  }
  return res.data.result;
};

// create
export const createInsuranceApi = async (
  form: InsuranceCreateReq
): Promise<void> => {
  const res = await api.post<ApiResponse<void>>(`/api/insurances`, form);
  if (!res.data.success) {
    throw new Error(res.data.message || "보험 등록 실패");
  }
};

// update
export const updateInsuranceApi = async (
  insuranceId: number,
  form: InsuranceUpdateReq
): Promise<void> => {
  const res = await api.put<ApiResponse<void>>(
    `/api/insurances/id/${insuranceId}`,
    form
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "보험 수정 실패");
  }
};

// 삭제 (소프트 삭제는 백엔드 처리)
export const deleteInsuranceApi = async (insuranceId: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(
    `/api/insurances/id/${insuranceId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "보험 삭제 실패");
  }
};

