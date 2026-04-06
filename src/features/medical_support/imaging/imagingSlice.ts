import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ImagingExam,
  ImagingExamCreatePayload,
  ImagingExamUpdatePayload,
} from "@/features/medical_support/imaging/imagingType";

type ImagingState = {
  list: ImagingExam[];
  selected: ImagingExam | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
};

const initialState: ImagingState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
};

const imagingSlice = createSlice({
  name: "imagings",
  initialState,
  reducers: {
    fetchImagingsRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    fetchImagingsSuccess: (state, action: PayloadAction<ImagingExam[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchImagingsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchImagingRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchImagingSuccess: (state, action: PayloadAction<ImagingExam>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchImagingFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createImagingRequest: (
      state,
      action: PayloadAction<ImagingExamCreatePayload>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createImagingSuccess: (state, action: PayloadAction<ImagingExam>) => {
      state.loading = false;
      state.createSuccess = true;
      state.selected = action.payload;
    },
    createImagingFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    },
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },

    updateImagingRequest: (
      state,
      action: PayloadAction<{
        imagingExamId: string;
        form: ImagingExamUpdatePayload;
      }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateImagingSuccess: (state, action: PayloadAction<ImagingExam>) => {
      state.loading = false;
      state.updateSuccess = true;
      state.selected = action.payload;
      state.list = state.list.map((item) =>
        String(item.imagingExamId) === String(action.payload.imagingExamId)
          ? action.payload
          : item
      );
    },
    updateImagingFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
});

export const ImagingActions = imagingSlice.actions;
export default imagingSlice.reducer;