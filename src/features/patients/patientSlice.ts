import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Patient,
  PatientForm,
  PatientSearchPayload,
  PatientMultiSearchPayload,
  PatientState,
} from "./patientTypes";

interface FetchPatientPayload {
  patientId: number;
}

interface UpdatePatientPayload {
  patientId: number;
  form: PatientForm;
}

const initialState: PatientState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    // 목록
    fetchPatientsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPatientsSuccess: (state, action: PayloadAction<Patient[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchPatientsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 검색
    searchPatientsRequest: (
      state,
      _action: PayloadAction<PatientSearchPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },

    searchPatientsMultiRequest: (
      state,
      _action: PayloadAction<PatientMultiSearchPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },

    // 단건
    fetchPatientRequest: (state, _action: PayloadAction<FetchPatientPayload>) => {
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchPatientSuccess: (state, action: PayloadAction<Patient>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchPatientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 생성
    createPatientRequest: (state, _action: PayloadAction<PatientForm>) => {
      state.loading = true;
      state.error = null;
    },
    createPatientSuccess: (state) => {
      state.loading = false;
    },
    createPatientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 수정
    updatePatientRequest: (
      state,
      _action: PayloadAction<UpdatePatientPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updatePatientSuccess: (state) => {
      state.loading = false;
    },
    updatePatientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // VIP
    updatePatientVipRequest: (
      state,
      _action: PayloadAction<{ patientId: number; isVip: boolean }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updatePatientVipSuccess: (state) => {
      state.loading = false;
    },
    updatePatientVipFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 삭제
    deletePatientRequest: (state, _action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    deletePatientSuccess: (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.list = state.list.filter((p) => p.patientId !== action.payload);
    },
    deletePatientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const patientActions = patientSlice.actions;
export default patientSlice.reducer;
