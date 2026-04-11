import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  MedicationRecord,
  MedicationRecordCreatePayload,
  MedicationRecordSearchParams,
  MedicationRecordUpdatePayload,
} from "@/features/medical_support/medicationRecord/medicationRecordType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

const cleanSearchParams = (params: MedicationRecordSearchParams) => {
  const cleaned: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    const normalized = value?.trim();
    if (normalized) {
      cleaned[key] = normalized;
    }
  });

  return cleaned;
};

type MedicationRecordApiRaw = MedicationRecord & {
  ADMINISTERED_AT?: string | null;
  administered_at?: string | null;
  NURSE_NAME?: string | null;
  PROGRESS_STATUS?: string | null;
  progress_status?: string | null;
  STATUS?: string | null;
};

const normalizeMedicationRecord = (
  item: MedicationRecordApiRaw
): MedicationRecord => {
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
    administeredAt:
      item.administeredAt ?? item.ADMINISTERED_AT ?? item.administered_at ?? null,
    nurseName: item.nurseName ?? item.NURSE_NAME ?? null,
    progressStatus,
    status: activeStatus ?? "ACTIVE",
  };
};

export const fetchMedicationRecordsApi = async (): Promise<MedicationRecord[]> => {
  const res = await api.get<ApiResponse<MedicationRecordApiRaw[]>>(
    "/api/medicationRecord"
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "투약 기록 목록 조회에 실패했습니다.");
  }

  return (res.data.result ?? []).map(normalizeMedicationRecord);
};

export const searchMedicationRecordsApi = async (
  params: MedicationRecordSearchParams
): Promise<MedicationRecord[]> => {
  const res = await api.get<ApiResponse<MedicationRecordApiRaw[]>>(
    "/api/medicationRecord/search",
    { params: cleanSearchParams(params) }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "?ъ빟 湲곕줉 寃??議고쉶???ㅽ뙣?덉뒿?덈떎.");
  }

  return (res.data.result ?? []).map(normalizeMedicationRecord);
};

export const fetchMedicationRecordApi = async (
  medicationRecordId: string | number
): Promise<MedicationRecord> => {
  const res = await api.get<ApiResponse<MedicationRecordApiRaw>>(
    `/api/medicationRecord/${medicationRecordId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "투약 기록 상세 조회에 실패했습니다.");
  }

  return normalizeMedicationRecord(res.data.result ?? {});
};

export const createMedicationRecordApi = async (
  payload: MedicationRecordCreatePayload
): Promise<MedicationRecord> => {
  const res = await api.post<ApiResponse<MedicationRecordApiRaw>>(
    "/api/medicationRecord",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "투약 기록 등록에 실패했습니다.");
  }

  return normalizeMedicationRecord(res.data.result ?? {});
};

export const updateMedicationRecordApi = async (
  medicationRecordId: string | number,
  payload: MedicationRecordUpdatePayload
): Promise<MedicationRecord> => {
  const res = await api.put<ApiResponse<MedicationRecordApiRaw>>(
    `/api/medicationRecord/${medicationRecordId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "투약 기록 수정에 실패했습니다.");
  }

  return normalizeMedicationRecord(res.data.result ?? {});
};
