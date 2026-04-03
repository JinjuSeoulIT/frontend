import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { emergencyReceptionActions as actions } from "./EmergencyReceptionSlice";
import type {
  EmergencyReception,
  EmergencyReceptionForm,
  EmergencyReceptionSearchPayload,
} from "./EmergencyReceptionTypes";
import * as api from "../../lib/reception/emergencyReceptionApi";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
};

function* fetchEmergencyReceptionsSaga() {
  try {
    const list: EmergencyReception[] = yield call(api.fetchEmergencyReceptionsApi);
    yield put(actions.fetchEmergencyReceptionsSuccess(list));
  } catch (err: unknown) {
    yield put(
      actions.fetchEmergencyReceptionsFailure(
        getErrorMessage(err, "Failed to fetch emergency receptions")
      )
    );
  }
}

function* fetchEmergencyReceptionSaga(action: PayloadAction<{ receptionId: string }>) {
  try {
    const p: EmergencyReception = yield call(
      api.fetchEmergencyReceptionApi,
      action.payload.receptionId
    );
    yield put(actions.fetchEmergencyReceptionSuccess(p));
  } catch (err: unknown) {
    try {
      // Fallback: detail endpoint can return 400 for some statuses, while list still contains the record.
      const list: EmergencyReception[] = yield call(api.fetchEmergencyReceptionsApi);
      const target = list.find(
        (item) => String(item.receptionId) === String(action.payload.receptionId)
      );
      if (target) {
        yield put(actions.fetchEmergencyReceptionSuccess(target));
        return;
      }
    } catch {
      // Keep original error.
    }
    yield put(
      actions.fetchEmergencyReceptionFailure(
        getErrorMessage(err, "Failed to fetch emergency reception")
      )
    );
  }
}

function* createEmergencyReceptionSaga(action: PayloadAction<EmergencyReceptionForm>) {
  try {
    const created: EmergencyReception | null = yield call(
      api.createEmergencyReceptionApi,
      action.payload
    );
    yield put(actions.createEmergencyReceptionSuccess(created));
    yield put(actions.fetchEmergencyReceptionsRequest());
  } catch (err: unknown) {
    yield put(
      actions.createEmergencyReceptionFailure(
        getErrorMessage(err, "Failed to create emergency reception")
      )
    );
  }
}

function* updateEmergencyReceptionSaga(
  action: PayloadAction<{ receptionId: string; form: EmergencyReceptionForm }>
) {
  try {
    yield call(
      api.updateEmergencyReceptionApi,
      action.payload.receptionId,
      action.payload.form
    );
    yield put(actions.updateEmergencyReceptionSuccess());
    yield put(actions.fetchEmergencyReceptionsRequest());
  } catch (err: unknown) {
    yield put(
      actions.updateEmergencyReceptionFailure(
        getErrorMessage(err, "Failed to update emergency reception")
      )
    );
  }
}

function* searchEmergencyReceptionsSaga(
  action: PayloadAction<EmergencyReceptionSearchPayload>
) {
  try {
    const { type, keyword } = action.payload;
    const list: EmergencyReception[] = yield call(
      api.searchEmergencyReceptionsApi,
      type,
      keyword
    );
    yield put(actions.fetchEmergencyReceptionsSuccess(list));
  } catch (err: unknown) {
    const message = getErrorMessage(err, "Failed to search emergency receptions");
    alert(message);
    yield put(actions.fetchEmergencyReceptionsFailure(message));
  }
}

export function* watchEmergencyReceptionSaga() {
  yield takeLatest(actions.fetchEmergencyReceptionsRequest.type, fetchEmergencyReceptionsSaga);
  yield takeLatest(actions.fetchEmergencyReceptionRequest.type, fetchEmergencyReceptionSaga);
  yield takeLatest(actions.createEmergencyReceptionRequest.type, createEmergencyReceptionSaga);
  yield takeLatest(actions.updateEmergencyReceptionRequest.type, updateEmergencyReceptionSaga);
  yield takeLatest(actions.searchEmergencyReceptionsRequest.type, searchEmergencyReceptionsSaga);
}
