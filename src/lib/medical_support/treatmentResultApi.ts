import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  TreatmentResult,
  TreatmentResultCreatePayload,
  TreatmentResultUpdatePayload,
} from "@/features/medical_support/treatmentResult/treatmentResultType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchTreatmentResultsApi = async (): Promise<TreatmentResult[]> => {
  const res = await api.get<ApiResponse<TreatmentResult[]>>("/api/treatmentResult");

  if (!res.data.success) {
    throw new Error(res.data.message || "처치 결과 목록 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const fetchTreatmentResultApi = async (
  procedureResultId: string | number
): Promise<TreatmentResult> => {
  const res = await api.get<ApiResponse<TreatmentResult>>(
    `/api/treatmentResult/${procedureResultId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "처치 결과 상세 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const createTreatmentResultApi = async (
  payload: TreatmentResultCreatePayload
): Promise<TreatmentResult> => {
  const res = await api.post<ApiResponse<TreatmentResult>>(
    "/api/treatmentResult",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "처치 결과 등록에 실패했습니다.");
  }

  return res.data.result;
};

export const updateTreatmentResultApi = async (
  procedureResultId: string | number,
  payload: TreatmentResultUpdatePayload
): Promise<TreatmentResult> => {
  const res = await api.put<ApiResponse<TreatmentResult>>(
    `/api/treatmentResult/${procedureResultId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "처치 결과 수정에 실패했습니다.");
  }

  return res.data.result;
};