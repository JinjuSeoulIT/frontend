import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PositionRequest,
  PositionResponse,
  PositionUpdatePayload,
} from "./positiontypes";

export interface PositionState {
  positionList: PositionResponse[];
  positionDetail: PositionResponse | null;
  positionCreate: PositionResponse | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: PositionState = {
  positionList: [],
  positionDetail: null,
  positionCreate: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const positionSlice = createSlice({
  name: "position",
  initialState,
  reducers: {
    positionListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    positionListSuccess(state, action: PayloadAction<PositionResponse[]>) {
      state.loading = false;
      state.positionList = action.payload;
    },
    positionListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    positionDetailRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    positionDetailSuccess(state, action: PayloadAction<PositionResponse>) {
      state.loading = false;
      state.positionDetail = action.payload;
    },
    positionDetailFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    positionCreateRequest(state, _action: PayloadAction<PositionRequest>) {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    positionCreateSuccess(state, action: PayloadAction<PositionResponse>) {
      state.loading = false;
      state.createSuccess = true;
      state.positionCreate = action.payload;
    },
    positionCreateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    positionUpdateRequest(state, _action: PayloadAction<PositionUpdatePayload>) {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    positionUpdateSuccess(state, action: PayloadAction<PositionResponse>) {
      state.loading = false;
      state.updateSuccess = true;
      state.positionDetail = action.payload;
    },
    positionUpdateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    positionDeleteRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
      state.deleteSuccess = false;
    },
    positionDeleteSuccess(state) {
      state.loading = false;
      state.deleteSuccess = true;
    },
    positionDeleteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    resetPositionState(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
});

export const {
  positionListRequest,
  positionListSuccess,
  positionListFailure,
  positionDetailRequest,
  positionDetailSuccess,
  positionDetailFailure,
  positionCreateRequest,
  positionCreateSuccess,
  positionCreateFailure,
  positionUpdateRequest,
  positionUpdateSuccess,
  positionUpdateFailure,
  positionDeleteRequest,
  positionDeleteSuccess,
  positionDeleteFailure,
  resetPositionState,
} = positionSlice.actions;

export default positionSlice.reducer;
