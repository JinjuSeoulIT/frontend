import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  ImagingExam,
  ImagingExamCreatePayload,
  ImagingExamUpdatePayload,
} from "@/features/medical_support/imaging/imagingType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchImagingExamsApi = async (): Promise<ImagingExam[]> => {
  const res = await api.get<ApiResponse<ImagingExam[]>>("/api/imaging");

  if (!res.data.success) {
    throw new Error(res.data.message || "영상 검사 목록 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const fetchImagingExamApi = async (
  imagingExamId: string | number
): Promise<ImagingExam> => {
  const res = await api.get<ApiResponse<ImagingExam>>(
    `/api/imaging/${imagingExamId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "영상 검사 상세 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const createImagingExamApi = async (
  payload: ImagingExamCreatePayload
): Promise<ImagingExam> => {
  const res = await api.post<ApiResponse<ImagingExam>>("/api/imaging", payload);

  if (!res.data.success) {
    throw new Error(res.data.message || "영상 검사 등록에 실패했습니다.");
  }

  return res.data.result;
};

export const updateImagingExamApi = async (
  imagingExamId: string | number,
  payload: ImagingExamUpdatePayload
): Promise<ImagingExam> => {
  const res = await api.put<ApiResponse<ImagingExam>>(
    `/api/imaging/${imagingExamId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "영상 검사 수정에 실패했습니다.");
  }

  return res.data.result;
};