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

type PathologyExamApiRaw = PathologyExam & {
  PERFORMER_NAME?: string | null;
  performer_name?: string | null;
};

const normalizePathologyExam = (item: PathologyExamApiRaw): PathologyExam => ({
  ...item,
  performerName:
    item.performerName ?? item.PERFORMER_NAME ?? item.performer_name ?? null,
});

export const fetchPathologyExamsApi = async (): Promise<PathologyExam[]> => {
  const res = await api.get<ApiResponse<PathologyExamApiRaw[]>>("/api/pathology");

  if (!res.data.success) {
    throw new Error(res.data.message || "병리 검사 목록 조회에 실패했습니다.");
  }

  return (res.data.result ?? []).map(normalizePathologyExam);
};

export const fetchPathologyExamApi = async (
  pathologyExamId: string | number
): Promise<PathologyExam> => {
  const res = await api.get<ApiResponse<PathologyExamApiRaw>>(
    `/api/pathology/${pathologyExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "병리 검사 상세 조회에 실패했습니다.");
  }

  return normalizePathologyExam((res.data.result ?? {}) as PathologyExamApiRaw);
};

export const createPathologyExamApi = async (
  payload: PathologyExamCreatePayload
): Promise<PathologyExam> => {
  const res = await api.post<ApiResponse<PathologyExamApiRaw>>(
    "/api/pathology",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "병리 검사 등록에 실패했습니다.");
  }

  return normalizePathologyExam((res.data.result ?? {}) as PathologyExamApiRaw);
};

export const updatePathologyExamApi = async (
  pathologyExamId: string | number,
  payload: PathologyExamUpdatePayload
): Promise<PathologyExam> => {
  const res = await api.put<ApiResponse<PathologyExamApiRaw>>(
    `/api/pathology/${pathologyExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "병리 검사 수정에 실패했습니다.");
  }

  return normalizePathologyExam((res.data.result ?? {}) as PathologyExamApiRaw);
};
