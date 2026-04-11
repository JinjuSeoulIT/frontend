import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  TestResult,
  TestResultSearchParams,
} from "@/features/medical_support/testResult/testResultType";

type TestResultState = {
  list: TestResult[];
  loading: boolean;
  error: string | null;
};

const initialState: TestResultState = {
  list: [],
  loading: false,
  error: null,
};

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
  },
});

export const TestResultActions = testResultSlice.actions;
export default testResultSlice.reducer;
