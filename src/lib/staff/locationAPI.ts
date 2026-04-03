import axios from "axios";
import {
  ApiResponse,
  LocationCreateRequest,
  LocationResponse,
  LocationUpdateRequest,
} from "@/features/staff/location/locationtypes";

const LOCATION_API_BASE_URL =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";




const LOCAL_API_BASE_URL =
  process.env.LOCAL_API_BASE_URL ?? "http://localhost:8022";

const locationApi = axios.create({
  baseURL: LOCATION_API_BASE_URL,
});

export const fetchLocationListApi = async (): Promise<ApiResponse<LocationResponse[]>> => {
  const response = await locationApi.get<ApiResponse<LocationResponse[]>>("/api/department/locations/list");
  return response.data;
};

export const fetchLocationDetailApi = async (deptId: string): Promise<ApiResponse<LocationResponse>> => {
  const response = await locationApi.get<ApiResponse<LocationResponse>>(`/api/department/locations/detail/${deptId}`);
  return response.data;
};

export const createLocationApi = async (
  locationDto: LocationCreateRequest
): Promise<ApiResponse<LocationResponse>> => {
  const response = await locationApi.post<ApiResponse<LocationResponse>>(
    "/api/department/locations/create",
    locationDto
  );
  return response.data;
};

export const updateLocationApi = async (
  deptId: string,
  locationDto: LocationUpdateRequest
): Promise<ApiResponse<LocationResponse>> => {
  const response = await locationApi.put<ApiResponse<LocationResponse>>(
    `/api/department/locations/update/${deptId}`,
    locationDto
  );
  return response.data;
};

export const deleteLocationApi = async (deptId: string): Promise<ApiResponse<void>> => {
  const response = await locationApi.delete<ApiResponse<void>>(`/api/department/locations/delete/${deptId}`);
  return response.data;
};
