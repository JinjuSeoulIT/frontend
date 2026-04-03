import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  MedicationRecord,
  MedicationRecordCreatePayload,
  MedicationRecordUpdatePayload,
} from "@/features/medical_support/medicationRecord/medicationRecordType";

type MedicationRecordState = {
  list: MedicationRecord[];
  selected: MedicationRecord | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
};

const initialState: MedicationRecordState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
};

const medicationRecordSlice = createSlice({
  name: "medicationRecords",
  initialState,
  reducers: {
    fetchMedicationRecordsRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    fetchMedicationRecordsSuccess: (
      state,
      action: PayloadAction<MedicationRecord[]>
    ) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchMedicationRecordsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchMedicationRecordRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchMedicationRecordSuccess: (
      state,
      action: PayloadAction<MedicationRecord>
    ) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchMedicationRecordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createMedicationRecordRequest: (
      state,
      action: PayloadAction<MedicationRecordCreatePayload>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createMedicationRecordSuccess: (
      state,
      action: PayloadAction<MedicationRecord>
    ) => {
      state.loading = false;
      state.createSuccess = true;
      state.selected = action.payload;
    },
    createMedicationRecordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    },
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },

    updateMedicationRecordRequest: (
      state,
      action: PayloadAction<{
        medicationId: string;
        form: MedicationRecordUpdatePayload;
      }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateMedicationRecordSuccess: (
      state,
      action: PayloadAction<MedicationRecord>
    ) => {
      state.loading = false;
      state.updateSuccess = true;
      state.selected = action.payload;
      state.list = state.list.map((item) =>
        String(item.medicationId) === String(action.payload.medicationId)
          ? action.payload
          : item
      );
    },
    updateMedicationRecordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
});

export const MedicationRecordActions = medicationRecordSlice.actions;
export default medicationRecordSlice.reducer;