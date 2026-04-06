import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type { TestExecution } from "@/features/medical_support/testExecution/testExecutionType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchTestExecutionsApi = async (
  executionType?: string
): Promise<TestExecution[]> => {
  const res = await api.get<ApiResponse<TestExecution[]>>("/api/testExecution", {
    params: executionType ? { executionType } : undefined,
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 목록 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const fetchTestExecutionApi = async (
  testExecutionId: string | number
): Promise<TestExecution> => {
  const res = await api.get<ApiResponse<TestExecution>>(
    `/api/testExecution/${testExecutionId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 상세 조회에 실패했습니다.");
  }

  return res.data.result;
};

export const createTestExecutionApi = async (
  payload: TestExecution
): Promise<TestExecution> => {
  const res = await api.post<ApiResponse<TestExecution>>(
    "/api/testExecution",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 등록에 실패했습니다.");
  }

  return res.data.result;
};

export const updateTestExecutionApi = async (
  testExecutionId: string | number,
  payload: TestExecution
): Promise<TestExecution> => {
  const res = await api.put<ApiResponse<TestExecution>>(
    `/api/testExecution/${testExecutionId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 수정에 실패했습니다.");
  }

  return res.data.result;
};
