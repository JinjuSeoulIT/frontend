import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  TestResult,
  TestResultDetailRequestPayload,
  TestResultSearchParams,
  TestResultUpdateRequestPayload,
} from "@/features/medical_support/testResult/testResultType";

type TestResultState = {
  list: TestResult[];
  loading: boolean;
  error: string | null;
  detail: TestResult | null;
  detailLoading: boolean;
  detailError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
};

const initialState: TestResultState = {
  list: [],
  loading: false,
  error: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

const isSameTestResult = (left: TestResult, right: TestResult) =>
  String(left.resultType ?? "").trim().toUpperCase() ===
    String(right.resultType ?? "").trim().toUpperCase() &&
  String(left.resultId ?? "").trim() === String(right.resultId ?? "").trim();

const testResultSlice = createSlice({
  name: "testResults",
  initialState,
  reducers: {
    fetchTestResultsRequest: (
      state,
      action: PayloadAction<TestResultSearchParams | undefined>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    fetchTestResultsSuccess: (state, action: PayloadAction<TestResult[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchTestResultsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchTestResultDetailRequest: (
      state,
      action: PayloadAction<TestResultDetailRequestPayload>
    ) => {
      void action;
      state.detail = null;
      state.detailLoading = true;
      state.detailError = null;
    },
    fetchTestResultDetailSuccess: (
      state,
      action: PayloadAction<TestResult>
    ) => {
      state.detailLoading = false;
      state.detail = action.payload;
    },
    fetchTestResultDetailFailure: (state, action: PayloadAction<string>) => {
      state.detailLoading = false;
      state.detailError = action.payload;
    },
    clearTestResultDetail: (state) => {
      state.detail = null;
      state.detailLoading = false;
      state.detailError = null;
    },
    updateTestResultRequest: (
      state,
      action: PayloadAction<TestResultUpdateRequestPayload>
    ) => {
      void action;
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    },
    updateTestResultSuccess: (state, action: PayloadAction<TestResult>) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      state.updateError = null;
      state.detail = action.payload;
      state.list = state.list.map((item) =>
        isSameTestResult(item, action.payload) ? action.payload : item
      );
    },
    updateTestResultFailure: (state, action: PayloadAction<string>) => {
      state.updateLoading = false;
      state.updateError = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
      state.updateError = null;
    },
  },
});

export const TestResultActions = testResultSlice.actions;
export default testResultSlice.reducer;
