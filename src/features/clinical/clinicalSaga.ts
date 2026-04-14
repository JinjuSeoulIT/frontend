import { call, put, take, takeEvery, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clinicalActions as actions } from "./clinicalSlice";
import type { VisitNotePersistPayload } from "./clinicalTypes";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import { fetchClinicalApi, fetchReceptionQueueApi, startVisitApi, endVisitApi } from "@/lib/clinical/visitApi";
import { updateDoctorNoteApi } from "@/lib/clinical/clinicalRecordApi";

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function* fetchClinicalBootstrapSaga() {
  let patients: Awaited<ReturnType<typeof fetchPatientsApi>> = [];
  let clinicals: Awaited<ReturnType<typeof fetchClinicalApi>> = [];
  let message: string | undefined;
  try {
    try {
      patients = yield call(fetchPatientsApi);
    } catch {
      patients = [];
      message = "환자 목록을 불러오지 못했습니다.";
    }
    try {
      clinicals = yield call(fetchClinicalApi);
    } catch {
      clinicals = [];
      message = "진료 목록 연결에 실패했습니다. 환자 목록만 표시합니다.";
    }
    yield put(actions.fetchClinicalBootstrapSuccess({ patients, clinicals }));
    if (message) {
      yield put(actions.fetchClinicalBootstrapFailure(message));
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.";
    yield put(actions.fetchClinicalBootstrapFailure(msg));
  }
}

function* fetchReceptionQueueSaga() {
  try {
    const today = toDateKey(new Date());
    let list: Awaited<ReturnType<typeof fetchReceptionQueueApi>> = yield call(
      fetchReceptionQueueApi,
      { date: today }
    );
    if (list.length === 0) {
      try {
        const anyList: Awaited<ReturnType<typeof fetchReceptionQueueApi>> = yield call(
          fetchReceptionQueueApi,
          {}
        );
        const todayPrefix = today.replace(/-/g, "");
        list = anyList.filter(
          (r) =>
            (r.receptionNo && r.receptionNo.startsWith(todayPrefix)) ||
            (r as { arrivedAt?: string; createdAt?: string }).arrivedAt?.startsWith?.(today) ||
            (r as { arrivedAt?: string; createdAt?: string }).createdAt?.startsWith?.(today)
        );
      } catch {
        list = [];
      }
    }
    yield put(actions.fetchReceptionQueueSuccess(list));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "접수 대기열을 불러오지 못했습니다.";
    yield put(actions.fetchReceptionQueueFailure(msg));
  }
}

function* persistVisitNoteSaga(action: PayloadAction<VisitNotePersistPayload>) {
  const { visitId, chiefComplaint, presentIllness, clinicalMemo } = action.payload;
  try {
    yield call(updateDoctorNoteApi, visitId, {
      chiefComplaint,
      presentIllness,
      clinicalMemo,
    });
    yield put(actions.persistVisitNoteSuccess());
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "진료노트 저장에 실패했습니다.";
    yield put(actions.persistVisitNoteFailure(msg));
  }
}

function isBootstrapRefreshDone(a: { type: string }) {
  return (
    a.type === actions.fetchClinicalBootstrapSuccess.type ||
    a.type === actions.fetchClinicalBootstrapFailure.type
  );
}

function isReceptionQueueRefreshDone(a: { type: string }) {
  return (
    a.type === actions.fetchReceptionQueueSuccess.type ||
    a.type === actions.fetchReceptionQueueFailure.type
  );
}

function* endVisitSaga(action: PayloadAction<VisitNotePersistPayload>) {
  const { visitId, chiefComplaint, presentIllness, clinicalMemo } = action.payload;
  try {
    yield call(updateDoctorNoteApi, visitId, {
      chiefComplaint,
      presentIllness,
      clinicalMemo,
    });
    yield call(endVisitApi, visitId);
    yield put(actions.fetchClinicalBootstrapRequest());
    yield take(isBootstrapRefreshDone);
    yield put(actions.fetchReceptionQueueRequest());
    yield take(isReceptionQueueRefreshDone);
    yield put(actions.endVisitSuccess());
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "진료 완료 처리 실패";
    yield put(actions.endVisitFailure(msg));
  }
}

function* startVisitSaga(action: PayloadAction<{ receptionId: number }>) {
  try {
    yield call(startVisitApi, action.payload.receptionId);
    yield put(actions.startVisitSuccess());
    yield put(actions.fetchClinicalBootstrapRequest());
    yield put(actions.fetchReceptionQueueRequest());
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "진료 시작에 실패했습니다.";
    yield put(actions.startVisitFailure(msg));
  }
}

export function* watchClinicalSaga() {
  yield takeLatest(actions.fetchClinicalBootstrapRequest.type, fetchClinicalBootstrapSaga); //액션객체를 받음.
  yield takeLatest(actions.fetchReceptionQueueRequest.type, fetchReceptionQueueSaga);
  yield takeEvery(actions.persistVisitNoteRequest.type, persistVisitNoteSaga);
  yield takeLatest(actions.endVisitRequest.type, endVisitSaga);
  yield takeLatest(actions.startVisitRequest.type, startVisitSaga);
}

export default watchClinicalSaga;
