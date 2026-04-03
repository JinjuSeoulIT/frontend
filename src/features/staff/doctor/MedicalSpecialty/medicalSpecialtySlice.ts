import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  MedicalCreateRequest,
  MedicalResponse,
  MedicalUpdatePayload,
  SpecialtyCreateRequest,
  SpecialtyResponse,
  SpecialtyUpdatePayload,
} from "./medicalSpecialtytypes";

// =========================
// Medical
// =========================
export interface MedicalState {
  medicalList: MedicalResponse[];
  medicalDetail: MedicalResponse | null;
  medicalCreated: MedicalResponse | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialMedicalState: MedicalState = {
  medicalList: [],
  medicalDetail: null,
  medicalCreated: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const medicalSlice = createSlice({
  name: "medical",
  initialState: initialMedicalState,
  reducers: {
    medicalListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    medicalListSuccess(state, action: PayloadAction<MedicalResponse[]>) {
      state.loading = false;
      state.medicalList = action.payload;
    },
    medicalListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    medicalDetailRequest(state, _action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },
    medicalDetailSuccess(state, action: PayloadAction<MedicalResponse>) {
      state.loading = false;
      state.medicalDetail = action.payload;
    },
    medicalDetailFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    medicalCreateRequest(state, _action: PayloadAction<MedicalCreateRequest>) {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    medicalCreateSuccess(state, action: PayloadAction<MedicalResponse>) {
      state.loading = false;
      state.createSuccess = true;
      state.medicalCreated = action.payload;
    },
    medicalCreateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    medicalUpdateRequest(state, _action: PayloadAction<MedicalUpdatePayload>) {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    medicalUpdateSuccess(state, action: PayloadAction<MedicalResponse>) {
      state.loading = false;
      state.updateSuccess = true;
      state.medicalDetail = action.payload;
    },
    medicalUpdateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    medicalDeleteRequest(state, _action: PayloadAction<number | string>) {
      state.loading = true;
      state.error = null;
      state.deleteSuccess = false;
    },
    medicalDeleteSuccess(state) {
      state.loading = false;
      state.deleteSuccess = true;
    },
    medicalDeleteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    resetMedicalState(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
});

// =========================
// Specialty
// =========================
export interface SpecialtyState {
  specialtyList: SpecialtyResponse[];
  specialtyDetail: SpecialtyResponse | null;
  specialtyCreated: SpecialtyResponse | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialSpecialtyState: SpecialtyState = {
  specialtyList: [],
  specialtyDetail: null,
  specialtyCreated: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const specialtySlice = createSlice({
  name: "specialty",
  initialState: initialSpecialtyState,
  reducers: {
    specialtyListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    specialtyListSuccess(state, action: PayloadAction<SpecialtyResponse[]>) {
      state.loading = false;
      state.specialtyList = action.payload;
    },
    specialtyListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    specialtyDetailRequest(state, _action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },
    specialtyDetailSuccess(state, action: PayloadAction<SpecialtyResponse>) {
      state.loading = false;
      state.specialtyDetail = action.payload;
    },
    specialtyDetailFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    specialtyCreateRequest(state, _action: PayloadAction<SpecialtyCreateRequest>) {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    specialtyCreateSuccess(state, action: PayloadAction<SpecialtyResponse>) {
      state.loading = false;
      state.createSuccess = true;
      state.specialtyCreated = action.payload;
    },
    specialtyCreateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    specialtyUpdateRequest(state, _action: PayloadAction<SpecialtyUpdatePayload>) {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    specialtyUpdateSuccess(state, action: PayloadAction<SpecialtyResponse>) {
      state.loading = false;
      state.updateSuccess = true;
      state.specialtyDetail = action.payload;
    },
    specialtyUpdateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    specialtyDeleteRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
      state.deleteSuccess = false;
    },
    specialtyDeleteSuccess(state) {
      state.loading = false;
      state.deleteSuccess = true;
    },
    specialtyDeleteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    resetSpecialtyState(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
});

export const {
  medicalListRequest,
  medicalListSuccess,
  medicalListFailure,
  medicalDetailRequest,
  medicalDetailSuccess,
  medicalDetailFailure,
  medicalCreateRequest,
  medicalCreateSuccess,
  medicalCreateFailure,
  medicalUpdateRequest,
  medicalUpdateSuccess,
  medicalUpdateFailure,
  medicalDeleteRequest,
  medicalDeleteSuccess,
  medicalDeleteFailure,
  resetMedicalState,
} = medicalSlice.actions;

export const {
  specialtyListRequest,
  specialtyListSuccess,
  specialtyListFailure,
  specialtyDetailRequest,
  specialtyDetailSuccess,
  specialtyDetailFailure,
  specialtyCreateRequest,
  specialtyCreateSuccess,
  specialtyCreateFailure,
  specialtyUpdateRequest,
  specialtyUpdateSuccess,
  specialtyUpdateFailure,
  specialtyDeleteRequest,
  specialtyDeleteSuccess,
  specialtyDeleteFailure,
  resetSpecialtyState,
} = specialtySlice.actions;

export const medicalReducer = medicalSlice.reducer;
export const specialtyReducer = specialtySlice.reducer;
