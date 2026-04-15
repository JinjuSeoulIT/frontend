import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  EndoscopyExam,
  EndoscopyExamCreatePayload,
  EndoscopySearchParams,
  EndoscopyExamUpdatePayload,
} from "@/features/medical_support/endoscopy/endoscopyType";
import { cleanSearchParams } from "@/lib/medical_support/searchParams";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

type EndoscopyExamApiRaw = EndoscopyExam & {
  DETAIL_CODE?: string | null;
  PERFORMER_NAME?: string | null;
  performer_name?: string | null;
};

const normalizeEndoscopyExam = (item: EndoscopyExamApiRaw): EndoscopyExam => ({
  ...item,
  detailCode: item.detailCode ?? item.DETAIL_CODE ?? null,
  performerName:
    item.performerName ?? item.PERFORMER_NAME ?? item.performer_name ?? null,
});

export const fetchEndoscopyExamsApi = async (
  params?: EndoscopySearchParams
): Promise<EndoscopyExam[]> => {
  const res = await api.get<ApiResponse<EndoscopyExamApiRaw[]>>("/api/endoscopy", {
    params: cleanSearchParams(params),
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "내시경 검사 목록 조회에 실패했습니다.");
  }

  return (res.data.result ?? []).map(normalizeEndoscopyExam);
};

export const fetchEndoscopyExamApi = async (
  endoscopyExamId: string | number
): Promise<EndoscopyExam> => {
  const res = await api.get<ApiResponse<EndoscopyExamApiRaw>>(
    `/api/endoscopy/${endoscopyExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "내시경 검사 상세 조회에 실패했습니다.");
  }

  return normalizeEndoscopyExam((res.data.result ?? {}) as EndoscopyExamApiRaw);
};

export const createEndoscopyExamApi = async (
  payload: EndoscopyExamCreatePayload
): Promise<EndoscopyExam> => {
  const res = await api.post<ApiResponse<EndoscopyExamApiRaw>>(
    "/api/endoscopy",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "내시경 검사 등록에 실패했습니다.");
  }

  return normalizeEndoscopyExam((res.data.result ?? {}) as EndoscopyExamApiRaw);
};

export const updateEndoscopyExamApi = async (
  endoscopyExamId: string | number,
  payload: EndoscopyExamUpdatePayload
): Promise<EndoscopyExam> => {
  const res = await api.put<ApiResponse<EndoscopyExamApiRaw>>(
    `/api/endoscopy/${endoscopyExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "내시경 검사 수정에 실패했습니다.");
  }

  return normalizeEndoscopyExam((res.data.result ?? {}) as EndoscopyExamApiRaw);
};
