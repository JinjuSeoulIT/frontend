import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  EmergencyReception,
  EmergencyReceptionForm,
  EmergencyReceptionSearchPayload,
  EmergencyReceptionState,
} from "./EmergencyReceptionTypes";

interface FetchEmergencyReceptionPayload {
  receptionId: string;
}

interface UpdateEmergencyReceptionPayload {
  receptionId: string;
  form: EmergencyReceptionForm;
}

const initialState: EmergencyReceptionState = {
  list: [],
  selected: null,
  lastCreated: null,
  loading: false,
  error: null,
};

const emergencyReceptionSlice = createSlice({
  name: "emergencyReceptions",
  initialState,
  reducers: {
    fetchEmergencyReceptionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEmergencyReceptionsSuccess: (state, action: PayloadAction<EmergencyReception[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchEmergencyReceptionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    searchEmergencyReceptionsRequest: (
      state,
      _action: PayloadAction<EmergencyReceptionSearchPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },

    fetchEmergencyReceptionRequest: (
      state,
      _action: PayloadAction<FetchEmergencyReceptionPayload>
    ) => {
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchEmergencyReceptionSuccess: (state, action: PayloadAction<EmergencyReception>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchEmergencyReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createEmergencyReceptionRequest: (
      state,
      _action: PayloadAction<EmergencyReceptionForm>
    ) => {
      state.loading = true;
      state.error = null;
      state.lastCreated = null;
    },
    createEmergencyReceptionSuccess: (
      state,
      action: PayloadAction<EmergencyReception | null>
    ) => {
      state.loading = false;
      state.lastCreated = action.payload;
    },
    createEmergencyReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateEmergencyReceptionRequest: (
      state,
      _action: PayloadAction<UpdateEmergencyReceptionPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateEmergencyReceptionSuccess: (state) => {
      state.loading = false;
    },
    updateEmergencyReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const emergencyReceptionActions = emergencyReceptionSlice.actions;
export default emergencyReceptionSlice.reducer;
