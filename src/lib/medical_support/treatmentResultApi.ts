import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  TreatmentResult,
  TreatmentResultCreatePayload,
  TreatmentResultSearchParams,
  TreatmentResultUpdatePayload,
} from "@/features/medical_support/treatmentResult/treatmentResultType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

const cleanSearchParams = (params: TreatmentResultSearchParams) => {
  const cleaned: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    const normalized = value?.trim();
    if (normalized) {
      cleaned[key] = normalized;
    }
  });

  return cleaned;
};

type TreatmentResultApiRaw = TreatmentResult & {
  NURSE_NAME?: string | null;
  PROGRESS_STATUS?: string | null;
  progress_status?: string | null;
  STATUS?: string | null;
  TREATMENT_AT?: string | null;
  treatment_at?: string | null;
};

const normalizeTreatmentResult = (
  item: TreatmentResultApiRaw
): TreatmentResult => {
  const rawStatus = item.status ?? item.STATUS ?? null;
  const rawProgressStatus =
    item.progressStatus ?? item.PROGRESS_STATUS ?? item.progress_status ?? null;
  const normalizedStatus = rawStatus?.trim().toUpperCase() ?? "";
  const activeStatus =
    normalizedStatus === "ACTIVE" || normalizedStatus === "INACTIVE"
      ? rawStatus
      : null;
  const progressStatus =
    rawProgressStatus ??
    (activeStatus === null && rawStatus != null && rawStatus.trim() !== ""
      ? rawStatus
      : null);

  return {
    ...item,
    treatmentAt:
      item.treatmentAt ?? item.TREATMENT_AT ?? item.treatment_at ?? null,
    nurseName: item.nurseName ?? item.NURSE_NAME ?? null,
    progressStatus,
    status: activeStatus ?? "ACTIVE",
  };
};

export const fetchTreatmentResultsApi = async (): Promise<TreatmentResult[]> => {
  const res = await api.get<ApiResponse<TreatmentResultApiRaw[]>>(
    "/api/treatmentResult"
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "처치 결과 목록 조회에 실패했습니다.");
  }

  return (res.data.result ?? []).map(normalizeTreatmentResult);
};

export const searchTreatmentResultsApi = async (
  params: TreatmentResultSearchParams
): Promise<TreatmentResult[]> => {
  const res = await api.get<ApiResponse<TreatmentResultApiRaw[]>>(
    "/api/treatmentResult/search",
    { params: cleanSearchParams(params) }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "泥섏튂 寃곌낵 寃??議고쉶???ㅽ뙣?덉뒿?덈떎.");
  }

  return (res.data.result ?? []).map(normalizeTreatmentResult);
};

export const fetchTreatmentResultApi = async (
  treatmentResultId: string
): Promise<TreatmentResult> => {
  const res = await api.get<ApiResponse<TreatmentResultApiRaw>>(
    `/api/treatmentResult/${treatmentResultId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "처치 결과 상세 조회에 실패했습니다.");
  }

  return normalizeTreatmentResult(res.data.result ?? {});
};

export const createTreatmentResultApi = async (
  payload: TreatmentResultCreatePayload
): Promise<TreatmentResult> => {
  const res = await api.post<ApiResponse<TreatmentResultApiRaw>>(
    "/api/treatmentResult",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "처치 결과 등록에 실패했습니다.");
  }

  return normalizeTreatmentResult(res.data.result ?? {});
};

export const updateTreatmentResultApi = async (
  treatmentResultId: string,
  payload: TreatmentResultUpdatePayload
): Promise<TreatmentResult> => {
  const res = await api.put<ApiResponse<TreatmentResultApiRaw>>(
    `/api/treatmentResult/${treatmentResultId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "처치 결과 수정에 실패했습니다.");
  }

  return normalizeTreatmentResult(res.data.result ?? {});
};
