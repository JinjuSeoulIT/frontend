import axios from "axios";
import type {
  RecordFormType,
  RecordSearchPayload,
} from "@/features/medical_support/record/recordTypes";

const api = axios.create({
  baseURL: "http://192.168.1.66:8181",
});

type RecordApiRaw = Omit<Partial<RecordFormType>, "patientId"> & {
  patientId?: string | number | null;
  PATIENT_ID?: string | number | null;
  CREATED_AT?: string | null;
  UPDATED_AT?: string | null;
  RECORDED_AT?: string | null;
};

const normalizeNullableNumber = (
  value?: string | number | null
): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const numericValue =
    typeof value === "number" ? value : Number(String(value).trim());

  return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizeRecord = (record: RecordApiRaw): RecordFormType =>
  ({
    ...record,
    patientId: normalizeNullableNumber(record.patientId ?? record.PATIENT_ID),
    createdAt: record.createdAt ?? record.CREATED_AT ?? "",
    updatedAt: record.updatedAt ?? record.UPDATED_AT ?? "",
    recordedAt: record.recordedAt ?? record.RECORDED_AT ?? "",
  }) as RecordFormType;

const normalizeRecords = (records: RecordApiRaw[]): RecordFormType[] =>
  records.map(normalizeRecord);

export const fetchRecordsApi = async (): Promise<RecordFormType[]> => {
  const res = await api.get<{ result: RecordApiRaw[] }>("/api/record");
  return normalizeRecords(res.data.result ?? []);
};

export const fetchRecordApi = async (
  recordId: string
): Promise<RecordFormType> => {
  const res = await api.get<{ result: RecordApiRaw }>(`/api/record/${recordId}`);
  return normalizeRecord(res.data.result ?? {});
};

export const createRecordApi = async (
  form: RecordFormType
): Promise<RecordFormType> => {
  const res = await api.post<{ result: RecordApiRaw }>("/api/record", form);
  return normalizeRecord(res.data.result ?? {});
};

export const updateRecordApi = async (
  recordId: string,
  form: RecordFormType
): Promise<RecordFormType> => {
  const res = await api.put<{ result: RecordApiRaw }>(
    `/api/record/${recordId}`,
    form
  );
  return normalizeRecord(res.data.result ?? {});
};

export const updateRecordStatusApi = async (
  recordId: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<RecordFormType> => {
  const res = await api.patch<{ result: RecordApiRaw }>(
    `/api/record/${recordId}/status`,
    {
      status,
    }
  );
  return normalizeRecord(res.data.result ?? {});
};

export const searchRecordsApi = async (
  payload: RecordSearchPayload
): Promise<RecordFormType[]> => {
  const params =
    payload.searchType === "createdAt"
      ? {
          searchType: payload.searchType,
          startDate: payload.startDate,
          endDate: payload.endDate,
        }
      : {
          searchType: payload.searchType,
          searchValue: payload.searchValue,
        };

  const res = await api.get<{ result: RecordApiRaw[] }>("/api/record/search", {
    params,
  });

  return normalizeRecords(res.data.result ?? []);
};
