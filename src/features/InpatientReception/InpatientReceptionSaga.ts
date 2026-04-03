import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { inpatientReceptionActions as actions } from "./InpatientReceptionSlice";
import type {
  InpatientReception,
  InpatientReceptionForm,
  InpatientReceptionSearchPayload,
} from "./InpatientReceptionTypes";
import * as api from "../../lib/reception/inpatientReceptionApi";

function* fetchInpatientReceptionsSaga() {
  try {
    const list: InpatientReception[] = yield call(api.fetchInpatientReceptionsApi);
    yield put(actions.fetchInpatientReceptionsSuccess(list));
  } catch (err: any) {
    yield put(actions.fetchInpatientReceptionsFailure(err.message ?? "입원 접수 목록 조회 실패"));
  }
}

function* fetchInpatientReceptionSaga(action: PayloadAction<{ receptionId: string }>) {
  try {
    const p: InpatientReception = yield call(
      api.fetchInpatientReceptionApi,
      action.payload.receptionId
    );
    yield put(actions.fetchInpatientReceptionSuccess(p));
  } catch (err: any) {
    yield put(actions.fetchInpatientReceptionFailure(err.message ?? "입원 접수 조회 실패"));
  }
}

function* createInpatientReceptionSaga(action: PayloadAction<InpatientReceptionForm>) {
  try {
    yield call(api.createInpatientReceptionApi, action.payload);
    yield put(actions.createInpatientReceptionSuccess());
    yield put(actions.fetchInpatientReceptionsRequest());
  } catch (err: any) {
    yield put(actions.createInpatientReceptionFailure(err.message ?? "입원 접수 등록 실패"));
  }
}

function* updateInpatientReceptionSaga(
  action: PayloadAction<{ receptionId: string; form: InpatientReceptionForm }>
) {
  try {
    yield call(
      api.updateInpatientReceptionApi,
      action.payload.receptionId,
      action.payload.form
    );
    yield put(actions.updateInpatientReceptionSuccess());
    yield put(actions.fetchInpatientReceptionsRequest());
  } catch (err: any) {
    yield put(actions.updateInpatientReceptionFailure(err.message ?? "입원 접수 수정 실패"));
  }
}

function* searchInpatientReceptionsSaga(
  action: PayloadAction<InpatientReceptionSearchPayload>
) {
  try {
    const { type, keyword } = action.payload;
    const list: InpatientReception[] = yield call(
      api.searchInpatientReceptionsApi,
      type,
      keyword
    );
    yield put(actions.fetchInpatientReceptionsSuccess(list));
  } catch (err: any) {
    alert(err.message ?? "입원 접수 검색 실패");
    yield put(actions.fetchInpatientReceptionsFailure(err.message ?? "입원 접수 검색 실패"));
  }
}

export function* watchInpatientReceptionSaga() {
  yield takeLatest(actions.fetchInpatientReceptionsRequest.type, fetchInpatientReceptionsSaga);
  yield takeLatest(actions.fetchInpatientReceptionRequest.type, fetchInpatientReceptionSaga);
  yield takeLatest(actions.createInpatientReceptionRequest.type, createInpatientReceptionSaga);
  yield takeLatest(actions.updateInpatientReceptionRequest.type, updateInpatientReceptionSaga);
  yield takeLatest(actions.searchInpatientReceptionsRequest.type, searchInpatientReceptionsSaga);
}
