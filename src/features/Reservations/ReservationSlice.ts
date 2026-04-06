import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Reservation,
  ReservationForm,
  ReservationSearchPayload,
  ReservationState,
} from "./ReservationTypes";

interface FetchReservationPayload {
  reservationId: string;
}

interface UpdateReservationPayload {
  reservationId: string;
  form: ReservationForm;
}

const initialState: ReservationState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

const reservationSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    // 목록
    fetchReservationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchReservationsSuccess: (state, action: PayloadAction<Reservation[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchReservationsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 검색
    searchReservationsRequest: (
      state,
      _action: PayloadAction<ReservationSearchPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },

    // 조회
    fetchReservationRequest: (state, _action: PayloadAction<FetchReservationPayload>) => {
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchReservationSuccess: (state, action: PayloadAction<Reservation>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchReservationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 생성
    createReservationRequest: (state, _action: PayloadAction<ReservationForm>) => {
      state.loading = true;
      state.error = null;
    },
    createReservationSuccess: (state) => {
      state.loading = false;
    },
    createReservationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 수정
    updateReservationRequest: (
      state,
      _action: PayloadAction<UpdateReservationPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateReservationSuccess: (state) => {
      state.loading = false;
    },
    updateReservationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const reservationActions = reservationSlice.actions;
export default reservationSlice.reducer;
