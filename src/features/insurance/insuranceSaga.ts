import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { insuranceActions as actions } from "./insuranceSlice";
import type {
  Insurance,
  InsuranceCreateReq,
  InsuranceUpdateReq,
} from "./insuranceTypes";
import * as api from "../../lib/patient/insuranceApi";

function* fetchInsuranceSaga(action: PayloadAction<{ patientId: number }>) {
  try {
    const list: Insurance[] = yield call(
      api.fetchInsuranceListApi,
      action.payload.patientId
    );
    yield put(actions.fetchInsuranceSuccess(list));
  } catch (err: any) {
    yield put(actions.fetchInsuranceFailure(err.message ?? "Fetch failed"));
  }
}

function* createInsuranceSaga(
  action: PayloadAction<{ patientId: number; form: InsuranceCreateReq }>
) {
  try {
    yield call(api.createInsuranceApi, action.payload.form);
    yield put(actions.createInsuranceSuccess());
    yield put(
      actions.fetchInsuranceRequest({ patientId: action.payload.patientId })
    );
  } catch (err: any) {
    yield put(actions.createInsuranceFailure(err.message ?? "Create failed"));
  }
}

function* updateInsuranceSaga(
  action: PayloadAction<{
    patientId: number;
    insuranceId: number;
    form: InsuranceUpdateReq;
  }>
) {
  try {
    yield call(
      api.updateInsuranceApi,
      action.payload.insuranceId,
      action.payload.form
    );
    yield put(actions.updateInsuranceSuccess());
    yield put(
      actions.fetchInsuranceRequest({ patientId: action.payload.patientId })
    );
  } catch (err: any) {
    yield put(actions.updateInsuranceFailure(err.message ?? "Update failed"));
  }
}

function* deleteInsuranceSaga(
  action: PayloadAction<{ patientId: number; insuranceId: number }>
) {
  try {
    yield call(api.updateInsuranceApi, action.payload.insuranceId, {
      activeYn: false,
    });
    yield put(actions.deleteInsuranceSuccess());
    yield put(
      actions.fetchInsuranceRequest({ patientId: action.payload.patientId })
    );
  } catch (err: any) {
    yield put(actions.deleteInsuranceFailure(err.message ?? "Delete failed"));
  }
}

export function* watchInsuranceSaga() {
  yield takeLatest(actions.fetchInsuranceRequest.type, fetchInsuranceSaga);
  yield takeLatest(actions.createInsuranceRequest.type, createInsuranceSaga);
  yield takeLatest(actions.updateInsuranceRequest.type, updateInsuranceSaga);
  yield takeLatest(actions.deleteInsuranceRequest.type, deleteInsuranceSaga);
}

