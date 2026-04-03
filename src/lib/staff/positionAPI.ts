import axios from "axios";
import {
  ApiResponse,
  PositionRequest,
  PositionResponse,
} from "@/features/staff/position/positiontypes";

const POSITION_API_BASE_URL =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";

const LOCAL_API_BASE_URL =
  process.env.LOCAL_API_BASE_URL ?? "http://localhost:8022";


const positionApi = axios.create({
  baseURL: POSITION_API_BASE_URL,
});

export const fetchPositionListApi = async (): Promise<ApiResponse<PositionResponse[]>> => {
  const response = await positionApi.get<ApiResponse<PositionResponse[]>>("/api/positions/list");
  return response.data;
};

export const fetchPositionTypeListApi = async (
  positionType: string
): Promise<ApiResponse<PositionResponse[]>> => {
  const response = await positionApi.get<ApiResponse<PositionResponse[]>>(
    `/api/positions/type/${positionType}`
  );
  return response.data;
};

export const fetchPositionDetailApi = async (
  positionId: string
): Promise<ApiResponse<PositionResponse>> => {
  const response = await positionApi.get<ApiResponse<PositionResponse>>(
    `/api/positions/${positionId}`
  );
  return response.data;
};

export const createPositionApi = async (
  positionReq: PositionRequest
): Promise<ApiResponse<PositionResponse>> => {
  const response = await positionApi.post<ApiResponse<PositionResponse>>(
    "/api/positions/create",
    positionReq
  );
  return response.data;
};

export const updatePositionApi = async (
  positionId: string,
  positionReq: PositionRequest
): Promise<ApiResponse<PositionResponse>> => {
  const response = await positionApi.put<ApiResponse<PositionResponse>>(
    `/api/positions/update/${positionId}`,
    positionReq
  );
  return response.data;
};

export const deletePositionApi = async (
  positionId: string
): Promise<ApiResponse<void>> => {
  const response = await positionApi.delete<ApiResponse<void>>(
    `/api/positions/delete/${positionId}`
  );
  return response.data;
};
