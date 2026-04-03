import axios, { type AxiosResponse } from "axios";
import type {
  ApiResponse,
  ReceptionCreateRequest,
  ReceptionIdNumber,
  ReceptionResponse,
  ReceptionSearchType,
  ReceptionUpdateRequest,
} from "@/features/staff/reception/receptionTypes";

const RECEPTION_API_BASE_URL = process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";

const receptionApi = axios.create({
  baseURL: RECEPTION_API_BASE_URL,
});





export async function searchReceptionListApi(search: string,searchType: ReceptionSearchType,): Promise<ApiResponse<ReceptionResponse[]>> {
  const response = await receptionApi.get("/api/reception/search", {params: {search,searchType,}});
  return response.data;
}

export const ReceptionlistApi = async (): Promise<ApiResponse<ReceptionResponse[]>> => {
  const response = await receptionApi.get<ApiResponse<ReceptionResponse[]>>(`/api/reception/list`);
  return response.data;
};

//상세조회
export const DetailReceptionApi = async ({ staffId }: ReceptionIdNumber): Promise<ApiResponse<ReceptionResponse>> => {
  const response = await receptionApi.get<ApiResponse<ReceptionResponse>>(`/api/reception/detail/${staffId}`);
  return response.data;
};


//생성
export const createReceptionApi = async (receptionReq: ReceptionCreateRequest): Promise<ApiResponse<ReceptionResponse>> => {
  const response = await receptionApi.post<ApiResponse<ReceptionResponse>>(`/api/reception/create`, receptionReq);
  return response.data;
};


//수정
export const updateReceptiondApi = async (staffId: number, receptionReq: ReceptionUpdateRequest): Promise<ApiResponse<ReceptionResponse>> => {
  const response = await receptionApi.put<ApiResponse<ReceptionResponse>>(`/api/reception/edit/${staffId}`, receptionReq);
  return response.data;
};



//영구 삭제
export const deleteReceptionApi = async (staffId: number): Promise<ApiResponse<void>> => {
  const response = await receptionApi.delete<ApiResponse<void>>(`/api/reception/delete/${staffId}`);
  return response.data;
};
