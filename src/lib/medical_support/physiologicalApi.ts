import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  PhysiologicalExam,
  PhysiologicalExamCreatePayload,
  PhysiologicalExamUpdatePayload,
} from "@/features/medical_support/physiological/physiologicalType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchPhysiologicalExamsApi = async (): Promise<PhysiologicalExam[]> => {
  const res = await api.get<ApiResponse<PhysiologicalExam[]>>("/api/physiological");

  if (!res.data.success) {
    throw new Error(res.data.message || "생리 기능 검사 목록 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const fetchPhysiologicalExamApi = async (
  physiologicalExamId: string | number
): Promise<PhysiologicalExam> => {
  const res = await api.get<ApiResponse<PhysiologicalExam>>(
    `/api/physiological/${physiologicalExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "생리 기능 검사 상세 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const createPhysiologicalExamApi = async (
  payload: PhysiologicalExamCreatePayload
): Promise<PhysiologicalExam> => {
  const res = await api.post<ApiResponse<PhysiologicalExam>>(
    "/api/physiological",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "생리 기능 검사 등록에 실패했습니다.");
  }

  return res.data.result;
};

export const updatePhysiologicalExamApi = async (
  physiologicalExamId: string | number,
  payload: PhysiologicalExamUpdatePayload
): Promise<PhysiologicalExam> => {
  const res = await api.put<ApiResponse<PhysiologicalExam>>(
    `/api/physiological/${physiologicalExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "생리 기능 검사 수정에 실패했습니다.");
  }

  return res.data.result;
};