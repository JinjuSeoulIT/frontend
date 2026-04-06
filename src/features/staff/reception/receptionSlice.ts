import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ReceptionCreateRequest,
  ReceptionIdNumber,
  ReceptionResponse,
  ReceptionUpdateNumber,
  SearchReceptionPayload,
} from "./receptionTypes";

export interface ReceptionState {
  receptionList: ReceptionResponse[];
  receptionSearch: ReceptionResponse[];
  receptionDetail: ReceptionResponse | null;
  receptionCreated: ReceptionResponse | null;
  receptionUpdated: ReceptionResponse | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
  loading: boolean;
  error: string | null;
  SuccessEnd: boolean;
}

const initialState: ReceptionState = {
  receptionList: [],
  receptionSearch: [],
  receptionDetail: null,
  receptionCreated: null,
  receptionUpdated: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  loading: false,
  error: null,
  SuccessEnd: false,
};

const receptionSlice = createSlice({
  name: "receptionStaff",
  initialState,
  reducers: {
    searchReceptionListRequest(state, _action: PayloadAction<SearchReceptionPayload>) {
      state.loading = true;
      state.error = null;
    },
    searchReceptionListSuccess(state, action: PayloadAction<ReceptionResponse[]>) {
      state.loading = false;
      state.receptionSearch = action.payload;
    },
    searchReceptionListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    ReceptionListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    ReceptionListSuccess(state, action: PayloadAction<ReceptionResponse[]>) {
      state.loading = false;
      state.receptionList = action.payload;
    },
    ReceptionListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    DetailReceptionRequest(state, _action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },
    DetailReceptionSuccess(state, action: PayloadAction<ReceptionResponse>) {
      state.loading = false;
      state.receptionDetail = action.payload;
    },
    DetailReceptionFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    createReceptionRequest(state, _action: PayloadAction<ReceptionCreateRequest>) {
      state.loading = true;
      state.error = null;
    },
    createReceptionSuccess(state, action: PayloadAction<ReceptionResponse>) {
      state.loading = false;
      state.createSuccess = true;
      state.receptionCreated = action.payload;
    },
    createReceptionFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    updateReceptionRequest(state, _action: PayloadAction<ReceptionUpdateNumber>) {
      state.loading = true;
      state.error = null;
    },
    updateReceptionSuccess(state, action: PayloadAction<ReceptionResponse>) {
      state.loading = false;
      state.updateSuccess = true;
      state.receptionUpdated = action.payload;
    },
    updateReceptionFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    deleteReceptionRequest(state, _action: PayloadAction<ReceptionIdNumber>) {
      state.loading = true;
      state.error = null;
    },
    deleteReceptionSuccess(state) {
      state.loading = false;
      state.deleteSuccess = true;
    },
    deleteReceptionFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    resetReceptionSuccessEnd(state) {
      state.SuccessEnd = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
  },
});

export const {
  searchReceptionListRequest,
  searchReceptionListSuccess,
  searchReceptionListFailure,
  ReceptionListRequest,
  ReceptionListSuccess,
  ReceptionListFailure,
  DetailReceptionRequest,
  DetailReceptionSuccess,
  DetailReceptionFailure,
  createReceptionRequest,
  createReceptionSuccess,
  createReceptionFailure,
  updateReceptionRequest,
  updateReceptionSuccess,
  updateReceptionFailure,
  deleteReceptionRequest,
  deleteReceptionSuccess,
  deleteReceptionFailure,
  resetReceptionSuccessEnd,
} = receptionSlice.actions;

export default receptionSlice.reducer;
