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

type PhysiologicalExamApiRaw = PhysiologicalExam & {
  DETAIL_CODE?: string | null;
  PERFORMER_NAME?: string | null;
  performer_name?: string | null;
};

const normalizePhysiologicalExam = (
  item: PhysiologicalExamApiRaw
): PhysiologicalExam => ({
  ...item,
  detailCode: item.detailCode ?? item.DETAIL_CODE ?? null,
  performerName:
    item.performerName ?? item.PERFORMER_NAME ?? item.performer_name ?? null,
});

export const fetchPhysiologicalExamsApi = async (): Promise<PhysiologicalExam[]> => {
  const res = await api.get<ApiResponse<PhysiologicalExamApiRaw[]>>(
    "/api/physiological"
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "생리 기능 검사 목록 조회에 실패했습니다.");
  }

  return (res.data.result ?? []).map(normalizePhysiologicalExam);
};

export const fetchPhysiologicalExamApi = async (
  physiologicalExamId: string | number
): Promise<PhysiologicalExam> => {
  const res = await api.get<ApiResponse<PhysiologicalExamApiRaw>>(
    `/api/physiological/${physiologicalExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "생리 기능 검사 상세 조회에 실패했습니다.");
  }

  return normalizePhysiologicalExam(
    (res.data.result ?? {}) as PhysiologicalExamApiRaw
  );
};

export const createPhysiologicalExamApi = async (
  payload: PhysiologicalExamCreatePayload
): Promise<PhysiologicalExam> => {
  const res = await api.post<ApiResponse<PhysiologicalExamApiRaw>>(
    "/api/physiological",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "생리 기능 검사 등록에 실패했습니다.");
  }

  return normalizePhysiologicalExam(
    (res.data.result ?? {}) as PhysiologicalExamApiRaw
  );
};

export const updatePhysiologicalExamApi = async (
  physiologicalExamId: string | number,
  payload: PhysiologicalExamUpdatePayload
): Promise<PhysiologicalExam> => {
  const res = await api.put<ApiResponse<PhysiologicalExamApiRaw>>(
    `/api/physiological/${physiologicalExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "생리 기능 검사 수정에 실패했습니다.");
  }

  return normalizePhysiologicalExam(
    (res.data.result ?? {}) as PhysiologicalExamApiRaw
  );
};
