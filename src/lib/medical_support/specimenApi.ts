import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  SpecimenExam,
  SpecimenExamCreatePayload,
  SpecimenExamUpdatePayload,
} from "@/features/medical_support/specimen/specimenType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

type SpecimenExamApiRaw = SpecimenExam & {
  PERFORMER_NAME?: string | null;
  performer_name?: string | null;
};

const normalizeSpecimenExam = (item: SpecimenExamApiRaw): SpecimenExam => ({
  ...item,
  performerName:
    item.performerName ?? item.PERFORMER_NAME ?? item.performer_name ?? null,
});

export const fetchSpecimenExamsApi = async (): Promise<SpecimenExam[]> => {
  const res = await api.get<ApiResponse<SpecimenExamApiRaw[]>>("/api/specimen");

  if (!res.data.success) {
    throw new Error(res.data.message || "검체 검사 목록 조회에 실패했습니다.");
  }

  return (res.data.result ?? []).map(normalizeSpecimenExam);
};

export const fetchSpecimenExamApi = async (
  specimenExamId: string | number
): Promise<SpecimenExam> => {
  const res = await api.get<ApiResponse<SpecimenExamApiRaw>>(
    `/api/specimen/${specimenExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검체 검사 상세 조회에 실패했습니다.");
  }

  return normalizeSpecimenExam((res.data.result ?? {}) as SpecimenExamApiRaw);
};

export const createSpecimenExamApi = async (
  payload: SpecimenExamCreatePayload
): Promise<SpecimenExam> => {
  const res = await api.post<ApiResponse<SpecimenExamApiRaw>>(
    "/api/specimen",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검체 검사 등록에 실패했습니다.");
  }

  return normalizeSpecimenExam((res.data.result ?? {}) as SpecimenExamApiRaw);
};

export const updateSpecimenExamApi = async (
  specimenExamId: string | number,
  payload: SpecimenExamUpdatePayload
): Promise<SpecimenExam> => {
  const res = await api.put<ApiResponse<SpecimenExamApiRaw>>(
    `/api/specimen/${specimenExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검체 검사 수정에 실패했습니다.");
  }

  return normalizeSpecimenExam((res.data.result ?? {}) as SpecimenExamApiRaw);
};
