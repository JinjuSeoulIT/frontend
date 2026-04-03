import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Insurance,
  InsuranceCreateReq,
  InsuranceState,
  InsuranceUpdateReq,
} from "./insuranceTypes";

interface FetchInsurancePayload {
  patientId: number;
}

interface CreateInsurancePayload {
  patientId: number;
  form: InsuranceCreateReq;
}

interface UpdateInsurancePayload {
  patientId: number;
  insuranceId: number;
  form: InsuranceUpdateReq;
}

interface DeleteInsurancePayload {
  patientId: number;
  insuranceId: number;
}

const initialState: InsuranceState = {
  list: [],
  loading: false,
  error: null,
};

const insuranceSlice = createSlice({
  name: "insurance",
  initialState,
  reducers: {
    fetchInsuranceRequest: (state, _action: PayloadAction<FetchInsurancePayload>) => {
      state.loading = true;
      state.error = null;
    },
    fetchInsuranceSuccess: (state, action: PayloadAction<Insurance[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchInsuranceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearInsurance: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },

    createInsuranceRequest: (
      state,
      _action: PayloadAction<CreateInsurancePayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    createInsuranceSuccess: (state) => {
      state.loading = false;
    },
    createInsuranceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateInsuranceRequest: (
      state,
      _action: PayloadAction<UpdateInsurancePayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateInsuranceSuccess: (state) => {
      state.loading = false;
    },
    updateInsuranceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteInsuranceRequest: (
      state,
      _action: PayloadAction<DeleteInsurancePayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    deleteInsuranceSuccess: (state) => {
      state.loading = false;
    },
    deleteInsuranceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const insuranceActions = insuranceSlice.actions;
export default insuranceSlice.reducer;

