import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Consent,
  ConsentCreateReq,
  ConsentState,
  ConsentUpdateReq,
} from "./consentTypes";

interface FetchConsentPayload {
  patientId: number;
}

interface CreateConsentPayload {
  patientId: number;
  form: ConsentCreateReq;
  file?: File | null;
}

interface UpdateConsentPayload {
  patientId: number;
  consentId: number;
  form: ConsentUpdateReq;
  file?: File | null;
}

interface DeleteConsentPayload {
  patientId: number;
  consentId: number;
}

const initialState: ConsentState = {
  list: [],
  loading: false,
  error: null,
};

const consentSlice = createSlice({
  name: "consent",
  initialState,
  reducers: {
    fetchConsentRequest: (state, _action: PayloadAction<FetchConsentPayload>) => {
      state.loading = true;
      state.error = null;
    },
    fetchConsentSuccess: (state, action: PayloadAction<Consent[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchConsentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearConsent: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },

    createConsentRequest: (
      state,
      _action: PayloadAction<CreateConsentPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    createConsentSuccess: (state) => {
      state.loading = false;
    },
    createConsentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateConsentRequest: (
      state,
      _action: PayloadAction<UpdateConsentPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateConsentSuccess: (state) => {
      state.loading = false;
    },
    updateConsentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteConsentRequest: (
      state,
      _action: PayloadAction<DeleteConsentPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    deleteConsentSuccess: (state) => {
      state.loading = false;
    },
    deleteConsentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const consentActions = consentSlice.actions;
export default consentSlice.reducer;

