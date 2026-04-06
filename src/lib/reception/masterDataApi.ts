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
  const list = (res.data.result ?? []) as Array<
    DepartmentOption & { departmentId?: string | number | null; departmentName?: string | null }
  >;
  return list
    .map((item) => ({
      departmentId: String(item.departmentId ?? "").trim(),
      departmentName: (item.departmentName ?? "").trim(),
    }))
    .filter((item) => item.departmentId.length > 0);
};

export const fetchDoctorsApi = async (
  departmentId?: string | null
): Promise<DoctorOption[]> => {
  const res = await receptionApi.get<ApiResponse<DoctorOption[]>>("/api/doctors", {
    params: departmentId?.trim() ? { departmentId: departmentId.trim() } : undefined,
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch doctors failed");
  }
  const list = (res.data.result ?? []) as Array<
    DoctorOption & {
      doctorId?: number | string | null;
      doctorName?: string | null;
      departmentId?: string | number | null;
    }
  >;
  return list
    .map((item) => ({
      doctorId: Number(item.doctorId),
      doctorName: (item.doctorName ?? "").trim(),
      departmentId: item.departmentId == null ? null : String(item.departmentId).trim(),
    }))
    .filter((item) => Number.isFinite(item.doctorId));
};



