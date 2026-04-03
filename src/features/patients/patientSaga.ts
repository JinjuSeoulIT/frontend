import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { patientActions as actions } from "./patientSlice";
import type {
  Patient,
  PatientForm,
  PatientSearchPayload,
  PatientMultiSearchPayload,
} from "./patientTypes";
import * as api from "../../lib/reception/patientApi";

function* fetchPatientsSaga() {
  try {
    const list: Patient[] = yield call(api.fetchPatientsApi);
    yield put(actions.fetchPatientsSuccess(list));
  } catch (err: any) {
    yield put(actions.fetchPatientsFailure(err.message ?? "ȯ�� ��� ��ȸ ����"));
  }
}

function* fetchPatientSaga(action: PayloadAction<{ patientId: number }>) {
  try {
    const p: Patient = yield call(api.fetchPatientApi, action.payload.patientId);
    yield put(actions.fetchPatientSuccess(p));
  } catch (err: any) {
    yield put(actions.fetchPatientFailure(err.message ?? "ȯ�� ��ȸ ����"));
  }
}

function* createPatientSaga(action: PayloadAction<PatientForm>) {
  try {
     console.log("[patient] saga createPatientRequest", action.payload);
    yield call(api.createPatientApi, action.payload);
    yield put(actions.createPatientSuccess());
    yield put(actions.fetchPatientsRequest());
  } catch (err: any) {
    yield put(actions.createPatientFailure(err.message ?? "ȯ�� ��� ����"));
  }
}

function* updatePatientSaga(
  action: PayloadAction<{ patientId: number; form: PatientForm }>
) {
  try {
    yield call(
      api.updatePatientApi,
      action.payload.patientId,
      action.payload.form
    );
    yield put(actions.updatePatientSuccess());
    yield put(actions.fetchPatientsRequest());
  } catch (err: any) {
    yield put(actions.updatePatientFailure(err.message ?? "ȯ�� ���� ����"));
  }
}

function* updatePatientVipSaga(
  action: PayloadAction<{ patientId: number; isVip: boolean }>
) {
  try {
    const { patientId, isVip } = action.payload;
    yield call(api.changePatientVipApi, patientId, { isVip });
    yield put(actions.updatePatientVipSuccess());
    yield put(actions.fetchPatientRequest({ patientId }));
    yield put(actions.fetchPatientsRequest());
  } catch (err: any) {
    yield put(actions.updatePatientVipFailure(err.message ?? "VIP ���� ����"));
  }
}

function* deletePatientSaga(action: PayloadAction<number>) {
  try {
    yield call(api.deletePatientApi, action.payload);
    yield put(actions.deletePatientSuccess(action.payload));
  } catch (err: any) {
    yield put(actions.deletePatientFailure(err.message ?? "ȯ�� ��Ȱ�� ó�� ����"));
  }
}

function* searchPatientsMultiSaga(
  action: PayloadAction<PatientMultiSearchPayload>
) {
  try {
    const list: Patient[] = yield call(api.searchPatientsMultiApi, action.payload);
    yield put(actions.fetchPatientsSuccess(list));
  } catch (err: any) {
    alert(err.message ?? "ȯ�� �˻� ����");
    yield put(actions.fetchPatientsFailure(err.message ?? "ȯ�� �˻� ����"));
  }
}

function* searchPatientsSaga(action: PayloadAction<PatientSearchPayload>) {
  try {
    const { type, keyword } = action.payload;
    const list: Patient[] = yield call(api.searchPatientsApi, type, keyword);
    yield put(actions.fetchPatientsSuccess(list));
  } catch (err: any) {
    alert(err.message ?? "ȯ�� �˻� ����");
    yield put(actions.fetchPatientsFailure(err.message ?? "ȯ�� �˻� ����"));
  }
}

export function* watchPatientSaga() {
  yield takeLatest(actions.fetchPatientsRequest.type, fetchPatientsSaga);
  yield takeLatest(actions.fetchPatientRequest.type, fetchPatientSaga);
  yield takeLatest(actions.createPatientRequest.type, createPatientSaga);
  yield takeLatest(actions.updatePatientRequest.type, updatePatientSaga);
  yield takeLatest(actions.updatePatientVipRequest.type, updatePatientVipSaga);
  yield takeLatest(actions.deletePatientRequest.type, deletePatientSaga);
  yield takeLatest(actions.searchPatientsRequest.type, searchPatientsSaga);
  yield takeLatest(actions.searchPatientsMultiRequest.type, searchPatientsMultiSaga);
}

