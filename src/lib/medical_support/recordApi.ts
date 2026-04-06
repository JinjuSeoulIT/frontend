import axios from "axios";
import { RecordFormType } from "@/features/medical_support/record/recordTypes";

const api = axios.create({
  baseURL: "http://192.168.1.66:8181",
});

export const fetchRecordsApi = async (): Promise<RecordFormType[]> => {
  const res = await api.get("/api/record");
  return res.data.result;
};

export const fetchRecordApi = async (
  recordId: string
): Promise<RecordFormType> => {
  const res = await api.get(`/api/record/${recordId}`);
  return res.data.result;
};

export const createRecordApi = async (
  form: RecordFormType
): Promise<RecordFormType> => {
  const res = await api.post("/api/record", form);
  return res.data.result;
};

export const updateRecordApi = async (
  recordId: string,
  form: RecordFormType
): Promise<RecordFormType> => {
  const res = await api.put(`/api/record/${recordId}`, form);
  return res.data.result;
};

export const updateRecordStatusApi = async (
  recordId: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<RecordFormType> => {
  const res = await api.patch(`/api/record/${recordId}/status`, {
    status,
  });
  return res.data.result;
};

export const searchRecordsApi = async (payload: {
  searchType?: string;
  searchValue?: string;
  startDate?: string;
  endDate?: string;
}): Promise<RecordFormType[]> => {
  const res = await api.get("/api/record/search", {
    params: {
      searchType: payload.searchType,
      searchValue: payload.searchValue,
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
  });

  return res.data.result;
};
