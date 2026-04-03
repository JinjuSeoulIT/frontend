import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  TreatmentResult,
  TreatmentResultCreatePayload,
  TreatmentResultUpdatePayload,
} from "@/features/medical_support/treatmentResult/treatmentResultType";

type TreatmentResultState = {
  list: TreatmentResult[];
  selected: TreatmentResult | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
};

const initialState: TreatmentResultState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
};

const treatmentResultSlice = createSlice({
  name: "treatmentResults",
  initialState,
  reducers: {
    fetchTreatmentResultsRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    fetchTreatmentResultsSuccess: (
      state,
      action: PayloadAction<TreatmentResult[]>
    ) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchTreatmentResultsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchTreatmentResultRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchTreatmentResultSuccess: (
      state,
      action: PayloadAction<TreatmentResult>
    ) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchTreatmentResultFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createTreatmentResultRequest: (
      state,
      action: PayloadAction<TreatmentResultCreatePayload>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createTreatmentResultSuccess: (
      state,
      action: PayloadAction<TreatmentResult>
    ) => {
      state.loading = false;
      state.createSuccess = true;
      state.selected = action.payload;
    },
    createTreatmentResultFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    },
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },

    updateTreatmentResultRequest: (
      state,
      action: PayloadAction<{
        procedureResultId: string;
        form: TreatmentResultUpdatePayload;
      }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateTreatmentResultSuccess: (
      state,
      action: PayloadAction<TreatmentResult>
    ) => {
      state.loading = false;
      state.updateSuccess = true;
      state.selected = action.payload;
      state.list = state.list.map((item) =>
        String(item.procedureResultId) ===
        String(action.payload.procedureResultId)
          ? action.payload
          : item
      );
    },
    updateTreatmentResultFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
});

export const TreatmentResultActions = treatmentResultSlice.actions;
export default treatmentResultSlice.reducer;