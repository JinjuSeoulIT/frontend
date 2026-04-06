import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { consentActions as actions } from "./consentSlice";
import type { Consent, ConsentCreateReq, ConsentUpdateReq } from "./consentTypes";
import * as api from "../../lib/patient/consentApi";

function* fetchConsentSaga(action: PayloadAction<{ patientId: number }>) {
  try {
    const list: Consent[] = yield call(
      api.fetchConsentListApi,
      action.payload.patientId
    );
    yield put(actions.fetchConsentSuccess(list));
  } catch (err: any) {
    yield put(actions.fetchConsentFailure(err.message ?? "Fetch failed"));
  }
}

function* createConsentSaga(
  action: PayloadAction<{ patientId: number; form: ConsentCreateReq; file?: File | null }>
) {
  try {
    yield call(
      api.createConsentApi,
      action.payload.patientId,
      action.payload.form,
      action.payload.file
    );
    yield put(actions.createConsentSuccess());
    yield put(actions.fetchConsentRequest({ patientId: action.payload.patientId }));
  } catch (err: any) {
    yield put(actions.createConsentFailure(err.message ?? "Create failed"));
  }
}

function* updateConsentSaga(
  action: PayloadAction<{
    patientId: number;
    consentId: number;
    form: ConsentUpdateReq;
    file?: File | null;
  }>
) {
  try {
    yield call(
      api.updateConsentApi,
      action.payload.patientId,
      action.payload.consentId,
      action.payload.form,
      action.payload.file
    );
    yield put(actions.updateConsentSuccess());
    yield put(actions.fetchConsentRequest({ patientId: action.payload.patientId }));
  } catch (err: any) {
    yield put(actions.updateConsentFailure(err.message ?? "Update failed"));
  }
}

function* deleteConsentSaga(
  action: PayloadAction<{ patientId: number; consentId: number }>
) {
  try {
    yield call(
      api.deleteConsentApi,
      action.payload.patientId,
      action.payload.consentId
    );
    yield put(actions.deleteConsentSuccess());
    yield put(actions.fetchConsentRequest({ patientId: action.payload.patientId }));
  } catch (err: any) {
    yield put(actions.deleteConsentFailure(err.message ?? "Delete failed"));
  }
}

export function* watchConsentSaga() {
  yield takeLatest(actions.fetchConsentRequest.type, fetchConsentSaga);
  yield takeLatest(actions.createConsentRequest.type, createConsentSaga);
  yield takeLatest(actions.updateConsentRequest.type, updateConsentSaga);
  yield takeLatest(actions.deleteConsentRequest.type, deleteConsentSaga);
}

