import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  ImagingExam,
  ImagingExamCreatePayload,
  ImagingSearchParams,
  ImagingExamUpdatePayload,
} from "@/features/medical_support/imaging/imagingType";
import { cleanSearchParams } from "@/lib/medical_support/searchParams";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

type ImagingExamApiRaw = ImagingExam & {
  DETAIL_CODE?: string | null;
  PERFORMER_NAME?: string | null;
  performer_name?: string | null;
};

const normalizeImagingExam = (item: ImagingExamApiRaw): ImagingExam => ({
  imagingExamId: item.imagingExamId,
  testExecutionId: item.testExecutionId ?? null,
  detailCode: item.detailCode ?? item.DETAIL_CODE ?? null,
  patientId: item.patientId ?? null,
  patientName: item.patientName ?? null,
  departmentName: item.departmentName ?? null,
  performerId: item.performerId ?? null,
  performerName:
    item.performerName ?? item.PERFORMER_NAME ?? item.performer_name ?? null,
  progressStatus: item.progressStatus ?? null,
  status: item.status ?? null,
  createdAt: item.createdAt ?? null,
  updatedAt: item.updatedAt ?? null,
});

export const fetchImagingExamsApi = async (
  params?: ImagingSearchParams
): Promise<ImagingExam[]> => {
  const res = await api.get<ApiResponse<ImagingExamApiRaw[]>>("/api/imaging", {
    params: cleanSearchParams(params),
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "영상 검사 목록 조회에 실패했습니다.");
  }

  return (res.data.result ?? []).map(normalizeImagingExam);
};

export const fetchImagingExamApi = async (
  imagingExamId: string | number
): Promise<ImagingExam> => {
  const res = await api.get<ApiResponse<ImagingExamApiRaw>>(
    `/api/imaging/${imagingExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "영상 검사 상세 조회에 실패했습니다.");
  }

  return normalizeImagingExam((res.data.result ?? {}) as ImagingExamApiRaw);
};

export const createImagingExamApi = async (
  payload: ImagingExamCreatePayload
): Promise<ImagingExam> => {
  const res = await api.post<ApiResponse<ImagingExamApiRaw>>(
    "/api/imaging",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "영상 검사 등록에 실패했습니다.");
  }

  return normalizeImagingExam((res.data.result ?? {}) as ImagingExamApiRaw);
};

export const updateImagingExamApi = async (
  imagingExamId: string | number,
  payload: ImagingExamUpdatePayload
): Promise<ImagingExam> => {
  const res = await api.put<ApiResponse<ImagingExamApiRaw>>(
    `/api/imaging/${imagingExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "영상 검사 수정에 실패했습니다.");
  }

  return normalizeImagingExam((res.data.result ?? {}) as ImagingExamApiRaw);
};
