import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  PhysiologicalExam,
  PhysiologicalExamCreatePayload,
  PhysiologicalExamUpdatePayload,
} from "@/features/medical_support/physiological/physiologicalType";

type PhysiologicalState = {
  list: PhysiologicalExam[];
  selected: PhysiologicalExam | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
};

const initialState: PhysiologicalState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
};

const physiologicalSlice = createSlice({
  name: "physiologicals",
  initialState,
  reducers: {
    fetchPhysiologicalsRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    fetchPhysiologicalsSuccess: (
      state,
      action: PayloadAction<PhysiologicalExam[]>
    ) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchPhysiologicalsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchPhysiologicalRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchPhysiologicalSuccess: (
      state,
      action: PayloadAction<PhysiologicalExam>
    ) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchPhysiologicalFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createPhysiologicalRequest: (
      state,
      action: PayloadAction<PhysiologicalExamCreatePayload>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createPhysiologicalSuccess: (
      state,
      action: PayloadAction<PhysiologicalExam>
    ) => {
      state.loading = false;
      state.createSuccess = true;
      state.selected = action.payload;
    },
    createPhysiologicalFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    },
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },

    updatePhysiologicalRequest: (
      state,
      action: PayloadAction<{
        physiologicalExamId: string;
        form: PhysiologicalExamUpdatePayload;
      }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updatePhysiologicalSuccess: (
      state,
      action: PayloadAction<PhysiologicalExam>
    ) => {
      state.loading = false;
      state.updateSuccess = true;
      state.selected = action.payload;
      state.list = state.list.map((item) =>
        String(item.physiologicalExamId) ===
        String(action.payload.physiologicalExamId)
          ? action.payload
          : item
      );
    },
    updatePhysiologicalFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
});

export const PhysiologicalActions = physiologicalSlice.actions;
export default physiologicalSlice.reducer;