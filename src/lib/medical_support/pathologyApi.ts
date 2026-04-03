import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  PathologyExam,
  PathologyExamCreatePayload,
  PathologyExamUpdatePayload,
} from "@/features/medical_support/pathology/pathologyType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchPathologyExamsApi = async (): Promise<PathologyExam[]> => {
  const res = await api.get<ApiResponse<PathologyExam[]>>("/api/pathology");

  if (!res.data.success) {
    throw new Error(res.data.message || "병리 검사 목록 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const fetchPathologyExamApi = async (
  pathologyExamId: string | number
): Promise<PathologyExam> => {
  const res = await api.get<ApiResponse<PathologyExam>>(
    `/api/pathology/${pathologyExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "병리 검사 상세 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const createPathologyExamApi = async (
  payload: PathologyExamCreatePayload
): Promise<PathologyExam> => {
  const res = await api.post<ApiResponse<PathologyExam>>("/api/pathology", payload);

  if (!res.data.success) {
    throw new Error(res.data.message || "병리 검사 등록에 실패했습니다.");
  }

  return res.data.result;
};

export const updatePathologyExamApi = async (
  pathologyExamId: string | number,
  payload: PathologyExamUpdatePayload
): Promise<PathologyExam> => {
  const res = await api.put<ApiResponse<PathologyExam>>(
    `/api/pathology/${pathologyExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "병리 검사 수정에 실패했습니다.");
  }

  return res.data.result;
};