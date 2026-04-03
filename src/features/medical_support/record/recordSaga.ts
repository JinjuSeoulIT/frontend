import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import { PayloadAction } from "@reduxjs/toolkit";

import { RecActions as actions } from "./recordSlice";
import * as api from "../../../lib/medical_support/recordApi";
import type { RecordFormType } from "@/features/medical_support/record/recordTypes";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchRecordsSaga(): SagaIterator {
  try {
    const records: RecordFormType[] = yield call(api.fetchRecordsApi);
    yield put(actions.fetchRecordsSuccess(records));
  } catch (err: unknown) {
    yield put(
      actions.fetchRecordsFailure(getErrorMessage(err, "Failed to fetch records"))
    );
  }
}

function* fetchRecordSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const record: RecordFormType = yield call(
      api.fetchRecordApi,
      action.payload
    );
    yield put(actions.fetchRecordSuccess(record));
  } catch (err: unknown) {
    yield put(
      actions.fetchRecordFailure(getErrorMessage(err, "Failed to fetch record"))
    );
  }
}

function* createRecordSaga(
  action: PayloadAction<RecordFormType>
): SagaIterator {
  try {
    yield call(api.createRecordApi, action.payload);
    yield put(actions.createRecordSuccess());
    yield put(actions.fetchRecordsRequest());
  } catch (err: unknown) {
    yield put(
      actions.createRecordFailure(getErrorMessage(err, "Failed to create record"))
    );
  }
}

function* updateRecordSaga(
  action: PayloadAction<{ recordId: string; form: RecordFormType }>
): SagaIterator {
  try {
    const { recordId, form } = action.payload;
    yield call(api.updateRecordApi, recordId, form);
    yield put(actions.updateRecordSuccess());
    yield put(actions.fetchRecordsRequest());
    yield put(actions.fetchRecordRequest(recordId));
  } catch (err: unknown) {
    yield put(
      actions.updateRecordFailure(getErrorMessage(err, "Failed to update record"))
    );
  }
}

function* toggleRecordStatusSaga(
  action: PayloadAction<{
    recordId: string;
    status: "ACTIVE" | "INACTIVE";
  }>
): SagaIterator {
  try {
    const { recordId, status } = action.payload;
    const updatedRecord: RecordFormType = yield call(
      api.updateRecordStatusApi,
      recordId,
      status
    );

    yield put(actions.toggleRecordStatusSuccess(updatedRecord));
    yield put(actions.fetchRecordsRequest());
  } catch (err: unknown) {
    yield put(
      actions.toggleRecordStatusFailure(
        getErrorMessage(err, "Failed to toggle record status")
      )
    );
  }
}

function* searchRecordsSaga(
  action: PayloadAction<{
    searchType: string;
    searchValue?: string;
    startDate?: string;
    endDate?: string;
  }>
): SagaIterator {
  try {
    const records: RecordFormType[] = yield call(
      api.searchRecordsApi,
      action.payload
    );

    yield put(actions.searchRecordsSuccess(records));

  } catch (err: unknown) {
    yield put(
      actions.searchRecordsFailure(getErrorMessage(err, "Failed to search records"))
    );
  }
}

export function* watchRecordSaga(): SagaIterator {
  yield takeLatest(actions.fetchRecordsRequest.type, fetchRecordsSaga);
  yield takeLatest(actions.fetchRecordRequest.type, fetchRecordSaga);
  yield takeLatest(actions.createRecordRequest.type, createRecordSaga);
  yield takeLatest(actions.updateRecordRequest.type, updateRecordSaga);
  yield takeLatest(actions.toggleRecordStatusRequest.type, toggleRecordStatusSaga);
  yield takeLatest(actions.searchRecordsRequest.type, searchRecordsSaga);
}
