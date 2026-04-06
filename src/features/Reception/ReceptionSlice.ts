import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Reception,
  ReceptionForm,
  ReceptionSearchPayload,
  ReceptionState,
} from "./ReceptionTypes";

interface FetchReceptionPayload {
  receptionId: string;
}

interface UpdateReceptionPayload {
  receptionId: string;
  form: ReceptionForm;
}

interface CancelReceptionPayload {
  receptionId: string;
  reasonText?: string;
}

const initialState: ReceptionState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

const receptionSlice = createSlice({
  name: "receptions",
  initialState,
  reducers: {
    // 목록
    fetchReceptionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchReceptionsSuccess: (state, action: PayloadAction<Reception[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchReceptionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 검색
    searchReceptionsRequest: (
      state,
      _action: PayloadAction<ReceptionSearchPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },

    // 조회
    fetchReceptionRequest: (state, _action: PayloadAction<FetchReceptionPayload>) => {
      state.loading = true;
      state.error = null;
    },
    fetchReceptionSuccess: (state, action: PayloadAction<Reception>) => {
      state.loading = false;
      state.selected = action.payload;
      state.list = state.list.map((p) =>
        p.receptionId === action.payload.receptionId ? { ...p, ...action.payload } : p
      );
    },
    fetchReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 생성
    createReceptionRequest: (state, _action: PayloadAction<ReceptionForm>) => {
      state.loading = true;
      state.error = null;
    },
    createReceptionSuccess: (state) => {
      state.loading = false;
    },
    createReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 수정
    updateReceptionRequest: (
      state,
      _action: PayloadAction<UpdateReceptionPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateReceptionSuccess: (state) => {
      state.loading = false;
    },
    updateReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 취소
    cancelReceptionRequest: (state, _action: PayloadAction<CancelReceptionPayload>) => {
      state.loading = true;
      state.error = null;
    },
    cancelReceptionSuccess: (state, action: PayloadAction<Reception>) => {
      state.loading = false;
      state.list = state.list.map((p) =>
        p.receptionId === action.payload.receptionId ? action.payload : p
      );
      if (state.selected?.receptionId === action.payload.receptionId) {
        state.selected = action.payload;
      }
    },
    cancelReceptionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const receptionActions = receptionSlice.actions;
export default receptionSlice.reducer;
