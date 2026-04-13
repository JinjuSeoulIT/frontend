import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  TestExecution,
  TestExecutionUpdatePayload,
} from "@/features/medical_support/testExecution/testExecutionType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

type TestExecutionApiRaw = Omit<Partial<TestExecution>, "status"> & {
  DETAIL_CODE?: string | null;
  PERFORMER_NAME?: string | null;
  performer_name?: string | null;
  status?: string | null;
  STATUS?: string | null;
};

const normalizeActiveStatus = (value?: string | null) => {
  const normalized = value?.trim().toUpperCase() ?? "";
  return normalized === "INACTIVE" ? "INACTIVE" : "ACTIVE";
};

const normalizeTestExecution = (
  item?: TestExecutionApiRaw | null
): TestExecution => ({
  testExecutionId: item?.testExecutionId ?? "",
  orderItemId: item?.orderItemId ?? null,
  detailCode: item?.detailCode ?? item?.DETAIL_CODE ?? null,
  executionType: item?.executionType ?? null,
  progressStatus: item?.progressStatus ?? null,
  status: normalizeActiveStatus(item?.status ?? item?.STATUS),
  retryNo: item?.retryNo ?? null,
  patientId: item?.patientId ?? null,
  patientName: item?.patientName ?? null,
  departmentName: item?.departmentName ?? null,
  createdAt: item?.createdAt ?? null,
  updatedAt: item?.updatedAt ?? null,
  startedAt: item?.startedAt ?? null,
  completedAt: item?.completedAt ?? null,
  performerId: item?.performerId ?? null,
  performerName:
    item?.performerName ?? item?.PERFORMER_NAME ?? item?.performer_name ?? null,
});

const normalizeTestExecutions = (
  items?: TestExecutionApiRaw[] | null
): TestExecution[] => (items ?? []).map((item) => normalizeTestExecution(item));

export const fetchTestExecutionsApi = async (
  executionType?: string
): Promise<TestExecution[]> => {
  const res = await api.get<ApiResponse<TestExecutionApiRaw[]>>(
    "/api/testExecution",
    {
      params: executionType ? { executionType } : undefined,
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 목록 조회에 실패했습니다.");
  }

  return normalizeTestExecutions(res.data.result);
};

export const fetchTestExecutionApi = async (
  testExecutionId: string | number
): Promise<TestExecution> => {
  const res = await api.get<ApiResponse<TestExecutionApiRaw>>(
    `/api/testExecution/${testExecutionId}`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 상세 조회에 실패했습니다.");
  }

  return normalizeTestExecution(res.data.result);
};

export const createTestExecutionApi = async (
  payload: TestExecution
): Promise<TestExecution> => {
  const res = await api.post<ApiResponse<TestExecutionApiRaw>>(
    "/api/testExecution",
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 등록에 실패했습니다.");
  }

  return normalizeTestExecution(res.data.result);
};

export const updateTestExecutionApi = async (
  testExecutionId: string | number,
  payload: TestExecutionUpdatePayload
): Promise<TestExecution> => {
  const res = await api.put<ApiResponse<TestExecutionApiRaw>>(
    `/api/testExecution/${testExecutionId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 수정에 실패했습니다.");
  }

  return normalizeTestExecution(res.data.result);
};