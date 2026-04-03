import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ClinicalState,
  Patient,
  ClinicalRes,
  ReceptionQueueItem,
  VisitNotePersistPayload,
} from "./clinicalTypes";

const initialState: ClinicalState = {
  patients: [],
  clinicals: [],
  receptions: [],
  bootstrapLoading: false,
  receptionLoading: false,
  errorMessage: null,
  noteSaveInflight: 0,
  persistNoteError: null,
  startVisitPhase: "idle",
  startVisitError: null,
  endVisitPhase: "idle",
  endVisitError: null,
};

const clinicalSlice = createSlice({
  name: "clinical",
  initialState,
  reducers: {
    fetchClinicalBootstrapRequest: (state) => {
      state.bootstrapLoading = true;
      state.errorMessage = null;
    },
    fetchClinicalBootstrapSuccess: (
      state,
      action: PayloadAction<{ patients: Patient[]; clinicals: ClinicalRes[] }>
    ) => {
      state.bootstrapLoading = false;
      state.patients = action.payload.patients;
      state.clinicals = action.payload.clinicals;
    },
    fetchClinicalBootstrapFailure: (state, action: PayloadAction<string>) => {
      state.bootstrapLoading = false;
      state.errorMessage = action.payload;
    },

    fetchReceptionQueueRequest: (state) => {
      state.receptionLoading = true;
      state.errorMessage = null;
    },
    fetchReceptionQueueSuccess: (state, action: PayloadAction<ReceptionQueueItem[]>) => {
      state.receptionLoading = false;
      state.receptions = action.payload;
    },
    fetchReceptionQueueFailure: (state, action: PayloadAction<string>) => {
      state.receptionLoading = false;
      state.errorMessage = action.payload;
    },

    persistVisitNoteRequest: (state, action: PayloadAction<VisitNotePersistPayload>) => {
      void action;
      state.noteSaveInflight += 1;
      state.persistNoteError = null;
    },
    persistVisitNoteSuccess: (state) => {
      state.noteSaveInflight = Math.max(0, state.noteSaveInflight - 1);
    },
    persistVisitNoteFailure: (state, action: PayloadAction<string>) => {
      state.noteSaveInflight = Math.max(0, state.noteSaveInflight - 1);
      state.persistNoteError = action.payload;
    },
    clearPersistVisitNoteError: (state) => {
      state.persistNoteError = null;
    },

    startVisitRequest: (state, action: PayloadAction<{ receptionId: number }>) => {
      void action;
      state.startVisitPhase = "loading";
      state.startVisitError = null;
    },
    startVisitSuccess: (state) => {
      state.startVisitPhase = "success";
    },
    startVisitFailure: (state, action: PayloadAction<string>) => {
      state.startVisitPhase = "error";
      state.startVisitError = action.payload;
    },
    clearStartVisitOutcome: (state) => {
      state.startVisitPhase = "idle";
      state.startVisitError = null;
    },

    endVisitRequest: (state, action: PayloadAction<VisitNotePersistPayload>) => {
      void action;
      state.endVisitPhase = "loading";
      state.endVisitError = null;
    },
    endVisitSuccess: (state) => {
      state.endVisitPhase = "success";
    },
    endVisitFailure: (state, action: PayloadAction<string>) => {
      state.endVisitPhase = "error";
      state.endVisitError = action.payload;
    },
    clearEndVisitOutcome: (state) => {
      state.endVisitPhase = "idle";
      state.endVisitError = null;
    },
  },
});

export const clinicalActions = clinicalSlice.actions;
export default clinicalSlice.reducer;
