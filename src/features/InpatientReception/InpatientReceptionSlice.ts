import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  InpatientReception,
  InpatientReceptionForm,
  InpatientReceptionSearchPayload,
  InpatientReceptionState,
} from "./InpatientReceptionTypes";

interface FetchInpatientReceptionPayload {
  receptionId: string;
}

interface UpdateInpatientReceptionPayload {
  receptionId: string;
  form: InpatientReceptionForm;
}

const initialState: InpatientReceptionState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

const inpatientReceptionSlice = createSlice({
  name: "inpatientReceptions",
  initialState,
  reducers: {
    fetchInpatientReceptionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchInpatientReceptionsSuccess: (state, action: PayloadAction<InpatientReception[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchInpatientReceptionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    searchInpatientReceptionsRequest: (
      state,
      _action: PayloadAction<InpatientReceptionSearchPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },

    fetchInpatientReceptionRequest: (
      state,
      _action: PayloadAction<FetchInpatientReceptionPayload>
    ) => {
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchInpatientReceptionSuccess: (state, action: PayloadAction<InpatientReception>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchInpatientReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createInpatientReceptionRequest: (
      state,
      _action: PayloadAction<InpatientReceptionForm>
    ) => {
      state.loading = true;
      state.error = null;
    },
    createInpatientReceptionSuccess: (state) => {
      state.loading = false;
    },
    createInpatientReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateInpatientReceptionRequest: (
      state,
      _action: PayloadAction<UpdateInpatientReceptionPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateInpatientReceptionSuccess: (state) => {
      state.loading = false;
    },
    updateInpatientReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const inpatientReceptionActions = inpatientReceptionSlice.actions;
export default inpatientReceptionSlice.reducer;
