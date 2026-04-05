import axios from "axios";
import type {
  Patient,
  PatientForm,
  PatientSearchPayload,
  ApiResponse,
} from "@/features/patients/patientTypes";

const api = axios.create({  
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.55:8181",
});

api.interceptors.request.use((config) => {
  console.log("[patient] axios request", {
    method: config.method,
    baseURL: config.baseURL,
    url: config.url,
    data: config.data,
  });
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("[patient] axios response", res.config.method, res.config.url, res.status, res.data);
    return res;
  },
  (err) => {
    console.error("[patient] axios error", err);
    throw err;
  }
);



const buildFormData = (
  data: Omit<PatientForm, "photoFile">,
  file?: File | null
) => {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );
  if (file) {
    formData.append("file", file);
  }
  return formData;
};

// List
export const fetchPatientsApi = async (): Promise<Patient[]> => {
  const res = await api.get<ApiResponse<Patient[]>>("/api/patients");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

// Detail
export const fetchPatientApi = async (patientId: number): Promise<Patient> => {
  const res = await api.get<ApiResponse<Patient>>(`/api/patients/${patientId}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

// Create (multipart)
export const createPatientApi = async (form: PatientForm): Promise<Patient> => {
  const { photoFile, ...payload } = form;
  const res = await api.post<ApiResponse<Patient>>(
    "/api/patients",
    buildFormData(payload, photoFile ?? null)
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

// Update
export const updatePatientApi = async (
  patientId: number,
  form: PatientForm
): Promise<void> => {
  const { photoFile, ...payload } = form;
  const res = await api.put<ApiResponse<void>>(
    `/api/patients/${patientId}`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
};

// Delete
export const deletePatientApi = async (patientId: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/patients/${patientId}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};

export type PatientStatusChangePayload = {
  statusCode: string;
  reason?: string;
  changedBy?: string;
};

export const changePatientStatusApi = async (
  patientId: number,
  payload: PatientStatusChangePayload
): Promise<Patient> => {
  const res = await api.put<ApiResponse<Patient>>(
    `/api/patients/${patientId}/status`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Status update failed");
  }
  return res.data.result;
};

// Search
export const searchPatientsApi = async (
  type: PatientSearchPayload["type"],
  keyword: string
): Promise<Patient[]> => {
  const res = await api.get<ApiResponse<Patient[]>>("/api/patients/search", {
    params: { type, keyword },
  });

  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};

export type PatientMultiSearchPayload = {
  name?: string;
  birthDate?: string;
  phone?: string;
};

export const searchPatientsMultiApi = async (
  payload: PatientMultiSearchPayload
): Promise<Patient[]> => {
  const res = await api.get<ApiResponse<Patient[]>>("/api/patients/search/multi", {
    params: payload,
  });

  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};

export type PatientVipChangePayload = {
  isVip: boolean;
};

export const changePatientVipApi = async (
  patientId: number,
  payload: PatientVipChangePayload
): Promise<Patient> => {
  const res = await api.put<ApiResponse<Patient>>(
    `/api/patients/${patientId}/vip`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "VIP update failed");
  }
  return res.data.result;
};
