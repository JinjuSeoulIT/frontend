import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SpecimenExam,
  SpecimenExamCreatePayload,
  SpecimenExamUpdatePayload,
} from "@/features/medical_support/specimen/specimenType";

type SpecimenState = {
  list: SpecimenExam[];
  selected: SpecimenExam | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
};

const initialState: SpecimenState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
};

const specimenSlice = createSlice({
  name: "specimens",
  initialState,
  reducers: {
    fetchSpecimensRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    fetchSpecimensSuccess: (state, action: PayloadAction<SpecimenExam[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchSpecimensFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchSpecimenRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchSpecimenSuccess: (state, action: PayloadAction<SpecimenExam>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchSpecimenFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createSpecimenRequest: (
      state,
      action: PayloadAction<SpecimenExamCreatePayload>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createSpecimenSuccess: (state, action: PayloadAction<SpecimenExam>) => {
      state.loading = false;
      state.createSuccess = true;
      state.selected = action.payload;
    },
    createSpecimenFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    },
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },

    updateSpecimenRequest: (
      state,
      action: PayloadAction<{
        specimenExamId: string;
        form: SpecimenExamUpdatePayload;
      }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateSpecimenSuccess: (state, action: PayloadAction<SpecimenExam>) => {
      state.loading = false;
      state.updateSuccess = true;
      state.selected = action.payload;
      state.list = state.list.map((item) =>
        String(item.specimenExamId) === String(action.payload.specimenExamId)
          ? action.payload
          : item
      );
    },
    updateSpecimenFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
});

export const SpecimenActions = specimenSlice.actions;
export default specimenSlice.reducer;