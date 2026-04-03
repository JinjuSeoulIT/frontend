import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TestExecution } from "@/features/medical_support/testExecution/testExecutionType";

type TestExecutionState = {
  list: TestExecution[];
  selected: TestExecution | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
};

const initialState: TestExecutionState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
};

const testexecutionSlice = createSlice({
  name: "testexecutions",
  initialState,
  reducers: {
    fetchTestExecutionsRequest: (
      state,
      action: PayloadAction<{ executionType?: string } | undefined>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    fetchTestExecutionsSuccess: (
      state,
      action: PayloadAction<TestExecution[]>
    ) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchTestExecutionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchTestExecutionRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchTestExecutionSuccess: (state, action: PayloadAction<TestExecution>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchTestExecutionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createTestExecutionRequest: (state, action: PayloadAction<TestExecution>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createTestExecutionSuccess: (state, action: PayloadAction<TestExecution>) => {
      state.loading = false;
      state.createSuccess = true;
      state.selected = action.payload;
    },
    createTestExecutionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    },
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },

    updateTestExecutionRequest: (
      state,
      action: PayloadAction<{ testExecutionId: string; form: TestExecution }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateTestExecutionSuccess: (state, action: PayloadAction<TestExecution>) => {
      state.loading = false;
      state.updateSuccess = true;
      state.selected = action.payload;
      state.list = state.list.map((item) =>
        String(item.testExecutionId) === String(action.payload.testExecutionId)
          ? action.payload
          : item
      );
    },
    updateTestExecutionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
});

export const TestExecutionActions = testexecutionSlice.actions;
export default testexecutionSlice.reducer;
