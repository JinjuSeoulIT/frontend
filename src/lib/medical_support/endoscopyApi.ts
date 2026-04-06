import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  EndoscopyExam,
  EndoscopyExamCreatePayload,
  EndoscopyExamUpdatePayload,
} from "@/features/medical_support/endoscopy/endoscopyType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchEndoscopyExamsApi = async (): Promise<EndoscopyExam[]> => {
  const res = await api.get<ApiResponse<EndoscopyExam[]>>("/api/endoscopy");

  if (!res.data.success) {
    throw new Error(res.data.message || "내시경 검사 목록 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const fetchEndoscopyExamApi = async (
  endoscopyExamId: string | number
): Promise<EndoscopyExam> => {
  const res = await api.get<ApiResponse<EndoscopyExam>>(
    `/api/endoscopy/${endoscopyExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "내시경 검사 상세 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const createEndoscopyExamApi = async (
  payload: EndoscopyExamCreatePayload
): Promise<EndoscopyExam> => {
  const res = await api.post<ApiResponse<EndoscopyExam>>("/api/endoscopy", payload);

  if (!res.data.success) {
    throw new Error(res.data.message || "내시경 검사 등록에 실패했습니다.");
  }

  return res.data.result;
};

export const updateEndoscopyExamApi = async (
  endoscopyExamId: string | number,
  payload: EndoscopyExamUpdatePayload
): Promise<EndoscopyExam> => {
  const res = await api.put<ApiResponse<EndoscopyExam>>(
    `/api/endoscopy/${endoscopyExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "내시경 검사 수정에 실패했습니다.");
  }

  return res.data.result;
};