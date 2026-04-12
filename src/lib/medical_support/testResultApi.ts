import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  TestResult,
  TestResultDetailData,
  TestResultDetailRequestPayload,
  TestResultSearchParams,
  TestResultUpdateRequestPayload,
} from "@/features/medical_support/testResult/testResultType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

type TestResultApiRaw = Partial<TestResult> & {
  RESULT_TYPE?: string | null;
  RESULT_TYPE_NAME?: string | null;
  RESULT_ID?: string | number | null;
  EXAM_ID?: string | number | null;
  TEST_EXECUTION_ID?: string | number | null;
  DETAIL_CODE?: string | null;
  PATIENT_ID?: number | null;
  PATIENT_NAME?: string | null;
  DEPARTMENT_NAME?: string | null;
  PERFORMER_ID?: string | number | null;
  performer_id?: string | number | null;
  PERFORMER_NAME?: string | null;
  performer_name?: string | null;
  SUMMARY?: string | null;
  RESULT_AT?: string | null;
  STATUS?: string | null;
  CREATED_AT?: string | null;
  DETAIL?: TestResultDetailData | null;
};

const cleanSearchParams = (params?: TestResultSearchParams) => {
  if (!params) {
    return undefined;
  }

  const cleaned: Record<string, string | boolean> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      if (value) {
        cleaned[key] = value;
      }
      return;
    }

    const normalized = value?.trim();
    if (normalized) {
      cleaned[key] = normalized;
    }
  });

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

const normalizeTestResult = (item?: TestResultApiRaw | null): TestResult => ({
  resultType: item?.resultType ?? item?.RESULT_TYPE ?? null,
  resultTypeName: item?.resultTypeName ?? item?.RESULT_TYPE_NAME ?? null,
  resultId: item?.resultId ?? item?.RESULT_ID ?? null,
  examId: item?.examId ?? item?.EXAM_ID ?? null,
  testExecutionId: item?.testExecutionId ?? item?.TEST_EXECUTION_ID ?? null,
  detailCode: item?.detailCode ?? item?.DETAIL_CODE ?? null,
  patientId: item?.patientId ?? item?.PATIENT_ID ?? null,
  patientName: item?.patientName ?? item?.PATIENT_NAME ?? null,
  departmentName: item?.departmentName ?? item?.DEPARTMENT_NAME ?? null,
  performerId: item?.performerId ?? item?.PERFORMER_ID ?? item?.performer_id ?? null,
  performerName:
    item?.performerName ?? item?.PERFORMER_NAME ?? item?.performer_name ?? null,
  summary: item?.summary ?? item?.SUMMARY ?? null,
  resultAt: item?.resultAt ?? item?.RESULT_AT ?? null,
  status: item?.status ?? item?.STATUS ?? null,
  createdAt: item?.createdAt ?? item?.CREATED_AT ?? null,
  detail: item?.detail ?? item?.DETAIL ?? null,
});

export const fetchTestResultsApi = async (
  params?: TestResultSearchParams
): Promise<TestResult[]> => {
  const res = await api.get<ApiResponse<TestResultApiRaw[]>>(
    "/api/testResult",
    {
      params: cleanSearchParams(params),
    }
  );

  if (!res.data.success) {
    throw new Error(
      res.data.message ||
        "\uAC80\uC0AC \uACB0\uACFC \uBAA9\uB85D \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4."
    );
  }

  return (res.data.result ?? []).map(normalizeTestResult);
};

export const fetchTestResultDetailApi = async ({
  resultType,
  resultId,
}: TestResultDetailRequestPayload): Promise<TestResult> => {
  const encodedResultType = encodeURIComponent(resultType.trim());
  const encodedResultId = encodeURIComponent(String(resultId).trim());
  const res = await api.get<ApiResponse<TestResultApiRaw>>(
    `/api/testResult/${encodedResultType}/${encodedResultId}`
  );

  if (!res.data.success) {
    throw new Error(
      res.data.message || "검사 결과 상세 조회에 실패했습니다."
    );
  }

  return normalizeTestResult(res.data.result);
};

export const updateTestResultApi = async ({
  resultType,
  resultId,
  form,
}: TestResultUpdateRequestPayload): Promise<TestResult> => {
  const encodedResultType = encodeURIComponent(resultType.trim());
  const encodedResultId = encodeURIComponent(String(resultId).trim());
  const res = await api.put<ApiResponse<TestResultApiRaw>>(
    `/api/testResult/${encodedResultType}/${encodedResultId}`,
    form
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "검사 결과 수정에 실패했습니다.");
  }

  return normalizeTestResult(res.data.result);
};
