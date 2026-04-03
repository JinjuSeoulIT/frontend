import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  EndoscopyExam,
  EndoscopyExamCreatePayload,
  EndoscopyExamUpdatePayload,
} from "@/features/medical_support/endoscopy/endoscopyType";

type EndoscopyState = {
  list: EndoscopyExam[];
  selected: EndoscopyExam | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
};

const initialState: EndoscopyState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
};

const endoscopySlice = createSlice({
  name: "endoscopies",
  initialState,
  reducers: {
    fetchEndoscopiesRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    fetchEndoscopiesSuccess: (state, action: PayloadAction<EndoscopyExam[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchEndoscopiesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchEndoscopyRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchEndoscopySuccess: (state, action: PayloadAction<EndoscopyExam>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchEndoscopyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createEndoscopyRequest: (
      state,
      action: PayloadAction<EndoscopyExamCreatePayload>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createEndoscopySuccess: (state, action: PayloadAction<EndoscopyExam>) => {
      state.loading = false;
      state.createSuccess = true;
      state.selected = action.payload;
    },
    createEndoscopyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    },
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },

    updateEndoscopyRequest: (
      state,
      action: PayloadAction<{
        endoscopyExamId: string;
        form: EndoscopyExamUpdatePayload;
      }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateEndoscopySuccess: (state, action: PayloadAction<EndoscopyExam>) => {
      state.loading = false;
      state.updateSuccess = true;
      state.selected = action.payload;
      state.list = state.list.map((item) =>
        String(item.endoscopyExamId) === String(action.payload.endoscopyExamId)
          ? action.payload
          : item
      );
    },
    updateEndoscopyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
});

export const EndoscopyActions = endoscopySlice.actions;
export default endoscopySlice.reducer;