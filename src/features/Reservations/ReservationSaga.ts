import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { reservationActions as actions } from "./ReservationSlice";
import type {
  Reservation,
  ReservationForm,
  ReservationSearchPayload,
} from "./ReservationTypes";
import * as api from "../../lib/reception/reservationAdminApi";

function* fetchReservationsSaga() {
  try {
    const list: Reservation[] = yield call(api.fetchReservationsApi);
    yield put(actions.fetchReservationsSuccess(list));
  } catch (err: any) {
    yield put(actions.fetchReservationsFailure(err.message ?? "예약 목록 조회 실패"));
  }
}

function* fetchReservationSaga(action: PayloadAction<{ reservationId: string }>) {
  try {
    const p: Reservation = yield call(api.fetchReservationApi, action.payload.reservationId);
    yield put(actions.fetchReservationSuccess(p));
  } catch (err: any) {
    yield put(actions.fetchReservationFailure(err.message ?? "예약 조회 실패"));
  }
}

function* createReservationSaga(action: PayloadAction<ReservationForm>) {
  try {
    yield call(api.createReservationApi, action.payload);
    yield put(actions.createReservationSuccess());
    yield put(actions.fetchReservationsRequest());
  } catch (err: any) {
    yield put(actions.createReservationFailure(err.message ?? "예약 등록 실패"));
  }
}

function* updateReservationSaga(
  action: PayloadAction<{ reservationId: string; form: ReservationForm }>
) {
  try {
    yield call(
      api.updateReservationApi,
      action.payload.reservationId,
      action.payload.form
    );
    yield put(actions.updateReservationSuccess());
    yield put(actions.fetchReservationsRequest());
  } catch (err: any) {
    yield put(actions.updateReservationFailure(err.message ?? "예약 수정 실패"));
  }
}

function* searchReservationsSaga(action: PayloadAction<ReservationSearchPayload>) {
  try {
    const { type, keyword } = action.payload;
    const list: Reservation[] = yield call(api.searchReservationsApi, type, keyword);
    yield put(actions.fetchReservationsSuccess(list));
  } catch (err: any) {
    alert(err.message ?? "예약 검색 실패");
    yield put(actions.fetchReservationsFailure(err.message ?? "예약 검색 실패"));
  }
}

export function* watchReservationSaga() {
  yield takeLatest(actions.fetchReservationsRequest.type, fetchReservationsSaga);
  yield takeLatest(actions.fetchReservationRequest.type, fetchReservationSaga);
  yield takeLatest(actions.createReservationRequest.type, createReservationSaga);
  yield takeLatest(actions.updateReservationRequest.type, updateReservationSaga);
  yield takeLatest(actions.searchReservationsRequest.type, searchReservationsSaga);
}
