import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  LocationCreateRequest,
  LocationResponse,
  LocationUpdatePayload,
} from "./locationtypes";

export interface LocationState {
  locationList: LocationResponse[];
  locationDetail: LocationResponse | null;
  locationCreate: LocationResponse | null;
  
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: LocationState = {
  locationList: [],
  locationDetail: null,
  locationCreate: null,

  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    locationListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    locationListSuccess(state, action: PayloadAction<LocationResponse[]>) {
      state.loading = false;
      state.locationList = action.payload;
    },
    locationListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    locationDetailRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    locationDetailSuccess(state, action: PayloadAction<LocationResponse>) {
      state.loading = false;
      state.locationDetail = action.payload;
    },
    locationDetailFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    locationCreateRequest(state, _action: PayloadAction<LocationCreateRequest>) {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    locationCreateSuccess(state, action: PayloadAction<LocationResponse>) {
      state.loading = false;
      state.createSuccess = true;
      state.locationCreate = action.payload;
    },
    locationCreateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    locationUpdateRequest(state, _action: PayloadAction<LocationUpdatePayload>) {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    locationUpdateSuccess(state, action: PayloadAction<LocationResponse>) {
      state.loading = false;
      state.updateSuccess = true;
      state.locationDetail = action.payload;
    },
    locationUpdateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    locationDeleteRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
      state.deleteSuccess = false;
    },
    locationDeleteSuccess(state) {
      state.loading = false;
      state.deleteSuccess = true;
    },
    locationDeleteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    resetLocationState(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
});

export const {
  locationListRequest,
  locationListSuccess,
  locationListFailure,

  locationDetailRequest,
  locationDetailSuccess,
  locationDetailFailure,

  locationCreateRequest,
  locationCreateSuccess,
  locationCreateFailure,

  locationUpdateRequest,
  locationUpdateSuccess,
  locationUpdateFailure,

  locationDeleteRequest,
  locationDeleteSuccess,
  locationDeleteFailure,
  
  resetLocationState,
} = locationSlice.actions;

export default locationSlice.reducer;
