import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type {
  TestResult,
  TestResultDetailData,
  TestResultDetailRequestPayload,
  TestResultProgressStatusUpdateRequestPayload,
  TestResultSearchParams,
  TestResultUpdateRequestPayload,
} from "@/features/medical_support/testResult/testResultType";
import { cleanSearchParams } from "@/lib/medical_support/searchParams";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

const LIST_ERROR_MESSAGE =
  "\uAC80\uC0AC \uACB0\uACFC \uBAA9\uB85D \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
const DETAIL_ERROR_MESSAGE =
  "\uAC80\uC0AC \uACB0\uACFC \uC0C1\uC138 \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
const UPDATE_ERROR_MESSAGE =
  "\uAC80\uC0AC \uACB0\uACFC \uC218\uC815\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";

const SEARCH_PARAM_KEYS: Array<keyof TestResultSearchParams> = [
  "resultType",
  "resultId",
  "patientName",
  "detailCode",
  "departmentName",
  "status",
  "startDate",
  "endDate",
  "includeInactive",
];

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
  RESULT_MANAGER_ID?: string | number | null;
  result_manager_id?: string | number | null;
  RESULT_MANAGER_NAME?: string | null;
  result_manager_name?: string | null;
  SUMMARY?: string | null;
  confirmedAt?: string | null;
  CONFIRMED_AT?: string | null;
  confirmed_at?: string | null;
  RESULT_AT?: string | null;
  STATUS?: string | null;
  PROGRESS_STATUS?: string | null;
  progress_status?: string | null;
  CREATED_AT?: string | null;
  DETAIL?: TestResultDetailData | null;
};

const normalizeTestResult = (item?: TestResultApiRaw | null): TestResult => {
  // Some responses return progress status in STATUS field.
  // Keep ACTIVE/INACTIVE for activation state, and map IN_PROGRESS/COMPLETED to progress.
  const rawStatus = item?.status ?? item?.STATUS ?? null;
  const normalizedRawStatus = rawStatus?.trim().toUpperCase() ?? "";
  const normalizedProgressStatusFromRawStatus =
    normalizedRawStatus === "IN_PROGRESS" || normalizedRawStatus === "COMPLETED"
      ? normalizedRawStatus
      : null;

  return {
    resultType: item?.resultType ?? item?.RESULT_TYPE ?? null,
    resultTypeName: item?.resultTypeName ?? item?.RESULT_TYPE_NAME ?? null,
    resultId: item?.resultId ?? item?.RESULT_ID ?? null,
    examId: item?.examId ?? item?.EXAM_ID ?? null,
    testExecutionId: item?.testExecutionId ?? item?.TEST_EXECUTION_ID ?? null,
    detailCode: item?.detailCode ?? item?.DETAIL_CODE ?? null,
    patientId: item?.patientId ?? item?.PATIENT_ID ?? null,
    patientName: item?.patientName ?? item?.PATIENT_NAME ?? null,
    departmentName: item?.departmentName ?? item?.DEPARTMENT_NAME ?? null,
    performerId:
      item?.performerId ?? item?.PERFORMER_ID ?? item?.performer_id ?? null,
    performerName:
      item?.performerName ?? item?.PERFORMER_NAME ?? item?.performer_name ?? null,
    resultManagerId:
      item?.resultManagerId ??
      item?.RESULT_MANAGER_ID ??
      item?.result_manager_id ??
      null,
    resultManagerName:
      item?.resultManagerName ??
      item?.RESULT_MANAGER_NAME ??
      item?.result_manager_name ??
      null,
    summary: item?.summary ?? item?.SUMMARY ?? null,
    resultAt:
      item?.resultAt ??
      item?.RESULT_AT ??
      item?.confirmedAt ??
      item?.CONFIRMED_AT ??
      item?.confirmed_at ??
      null,
    status: rawStatus,
    progressStatus:
      item?.progressStatus ??
      item?.PROGRESS_STATUS ??
      item?.progress_status ??
      normalizedProgressStatusFromRawStatus,
    createdAt: item?.createdAt ?? item?.CREATED_AT ?? null,
    detail: item?.detail ?? item?.DETAIL ?? null,
  };
};

export const fetchTestResultsApi = async (
  params?: TestResultSearchParams
): Promise<TestResult[]> => {
  const filteredParams = cleanSearchParams(
    SEARCH_PARAM_KEYS.reduce<Record<string, string | boolean | undefined>>(
      (accumulator, key) => {
        accumulator[key] = params?.[key];
        return accumulator;
      },
      {}
    )
  );

  const res = await api.get<ApiResponse<TestResultApiRaw[]>>(
    "/api/testResult",
    {
      params: filteredParams,
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || LIST_ERROR_MESSAGE);
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
    throw new Error(res.data.message || DETAIL_ERROR_MESSAGE);
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
  const payload =
    form.progressStatus !== undefined
      ? {
          ...form,
          progressStatus: form.progressStatus,
          progress_status: form.progressStatus,
        }
      : form;

  const res = await api.put<ApiResponse<TestResultApiRaw>>(
    `/api/testResult/${encodedResultType}/${encodedResultId}`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || UPDATE_ERROR_MESSAGE);
  }

  return normalizeTestResult(res.data.result);
};

export const updateTestResultProgressStatusApi = async ({
  resultId,
  progressStatus,
}: TestResultProgressStatusUpdateRequestPayload): Promise<TestResult> => {
  const encodedResultId = encodeURIComponent(String(resultId).trim());
  const res = await api.patch<ApiResponse<TestResultApiRaw>>(
    `/api/testResult/${encodedResultId}/status`,
    {
      progressStatus,
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || UPDATE_ERROR_MESSAGE);
  }

  return normalizeTestResult(res.data.result);
};
