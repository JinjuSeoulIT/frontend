import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  PathologyExam,
  PathologyExamCreatePayload,
  PathologyExamUpdatePayload,
} from "@/features/medical_support/pathology/pathologyType";

type PathologyState = {
  list: PathologyExam[];
  selected: PathologyExam | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
};

const initialState: PathologyState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
};

const pathologySlice = createSlice({
  name: "pathologies",
  initialState,
  reducers: {
    fetchPathologiesRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    fetchPathologiesSuccess: (state, action: PayloadAction<PathologyExam[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchPathologiesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchPathologyRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchPathologySuccess: (state, action: PayloadAction<PathologyExam>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchPathologyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createPathologyRequest: (
      state,
      action: PayloadAction<PathologyExamCreatePayload>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createPathologySuccess: (state, action: PayloadAction<PathologyExam>) => {
      state.loading = false;
      state.createSuccess = true;
      state.selected = action.payload;
    },
    createPathologyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    },
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },

    updatePathologyRequest: (
      state,
      action: PayloadAction<{
        pathologyExamId: string;
        form: PathologyExamUpdatePayload;
      }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updatePathologySuccess: (state, action: PayloadAction<PathologyExam>) => {
      state.loading = false;
      state.updateSuccess = true;
      state.selected = action.payload;
      state.list = state.list.map((item) =>
        String(item.pathologyExamId) === String(action.payload.pathologyExamId)
          ? action.payload
          : item
      );
    },
    updatePathologyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
});

export const PathologyActions = pathologySlice.actions;
export default pathologySlice.reducer;