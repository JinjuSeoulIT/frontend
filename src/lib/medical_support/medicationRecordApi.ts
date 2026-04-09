import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  MedicationRecord,
  MedicationRecordCreatePayload,
  MedicationRecordUpdatePayload,
} from "@/features/medical_support/medicationRecord/medicationRecordType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchMedicationRecordsApi = async (): Promise<MedicationRecord[]> => {
  const res = await api.get<ApiResponse<MedicationRecord[]>>(
    "/api/medicationRecord"
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "투약 기록 목록 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const fetchMedicationRecordApi = async (
  medicationRecordId: string | number
): Promise<MedicationRecord> => {
  const res = await api.get<ApiResponse<MedicationRecord>>(
    `/api/medicationRecord/${medicationRecordId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "투약 기록 상세 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const createMedicationRecordApi = async (
  payload: MedicationRecordCreatePayload
): Promise<MedicationRecord> => {
  const res = await api.post<ApiResponse<MedicationRecord>>(
    "/api/medicationRecord",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "투약 기록 등록에 실패했습니다.");
  }

  return res.data.result;
};

export const updateMedicationRecordApi = async (
  medicationRecordId: string | number,
  payload: MedicationRecordUpdatePayload
): Promise<MedicationRecord> => {
  const res = await api.put<ApiResponse<MedicationRecord>>(
    `/api/medicationRecord/${medicationRecordId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "투약 기록 수정에 실패했습니다.");
  }

  return res.data.result;
};
