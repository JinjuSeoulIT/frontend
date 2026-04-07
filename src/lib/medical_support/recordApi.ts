import axios from "axios";
import type {
  RecordFormType,
  RecordSearchPayload,
} from "@/features/medical_support/record/recordTypes";

const api = axios.create({
  baseURL: "http://192.168.1.66:8181",
});

type RecordApiRaw = Partial<RecordFormType> & {
  CREATED_AT?: string | null;
  UPDATED_AT?: string | null;
  RECORDED_AT?: string | null;
};

const normalizeRecord = (record: RecordApiRaw): RecordFormType =>
  ({
    ...record,
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
  const res = await api.get<{ result: RecordApiRaw[] }>("/api/record/search", {
    params: {
      searchType: payload.searchType,
      searchValue: payload.searchValue,
      // startDate: payload.startDate,
      // endDate: payload.endDate,
    },
  });

  return normalizeRecords(res.data.result ?? []);
};