import axios from "axios";
import type {
  ApiResponse,
  DepartmentOption,
  DoctorOption,
  PatientOption,
} from "@/features/Reservations/ReservationTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181",
});

const receptionApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

export const fetchPatientsApi = async (): Promise<PatientOption[]> => {
  const res = await api.get<ApiResponse<PatientOption[]>>("/api/patients");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch patients failed");
  }
  const list = (res.data.result ?? []) as Array<
    PatientOption & { name?: string | null; patientNo?: string | null }
  >;

  return list
    .map((item) => ({
      patientId: Number(item.patientId),
      patientName: (item.patientName ?? item.name ?? "").trim(),
    }))
    .filter((item) => Number.isFinite(item.patientId));
};

export const fetchDepartmentsApi = async (): Promise<DepartmentOption[]> => {
  const res = await receptionApi.get<ApiResponse<DepartmentOption[]>>("/api/departments");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch departments failed");
  }
  return res.data.result ?? [];
};

export const fetchDoctorsApi = async (
  departmentId?: number | null
): Promise<DoctorOption[]> => {
  const res = await receptionApi.get<ApiResponse<DoctorOption[]>>("/api/doctors", {
    params: departmentId ? { departmentId } : undefined,
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch doctors failed");
  }
  return res.data.result ?? [];
};



