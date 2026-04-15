import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";
import * as api from "@/lib/medical_support/testResultApi";
import { TestResultActions as actions } from "./testResultSlice";
import type {
  TestResult,
  TestResultDetailRequestPayload,
  TestResultProgressStatusUpdateRequestPayload,
  TestResultSearchParams,
  TestResultUpdateRequestPayload,
} from "@/features/medical_support/testResult/testResultType";

const LIST_ERROR_MESSAGE =
  "\uAC80\uC0AC \uACB0\uACFC \uBAA9\uB85D \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
const DETAIL_ERROR_MESSAGE =
  "\uAC80\uC0AC \uACB0\uACFC \uC0C1\uC138 \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
const UPDATE_ERROR_MESSAGE =
  "\uAC80\uC0AC \uACB0\uACFC \uC218\uC815\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchTestResultsSaga(
  action: PayloadAction<TestResultSearchParams | undefined>
): SagaIterator {
  try {
    const items: TestResult[] = yield call(
      api.fetchTestResultsApi,
      action.payload
    );
    yield put(actions.fetchTestResultsSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchTestResultsFailure(getErrorMessage(err, LIST_ERROR_MESSAGE))
    );
  }
}

function* fetchTestResultDetailSaga(
  action: PayloadAction<TestResultDetailRequestPayload>
): SagaIterator {
  try {
    const item: TestResult = yield call(
      api.fetchTestResultDetailApi,
      action.payload
    );
    yield put(actions.fetchTestResultDetailSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchTestResultDetailFailure(
        getErrorMessage(err, DETAIL_ERROR_MESSAGE)
      )
    );
  }
}

function* updateTestResultSaga(
  action: PayloadAction<TestResultUpdateRequestPayload>
): SagaIterator {
  try {
    const item: TestResult = yield call(api.updateTestResultApi, action.payload);
    yield put(actions.updateTestResultSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.updateTestResultFailure(getErrorMessage(err, UPDATE_ERROR_MESSAGE))
    );
  }
}

function* updateTestResultProgressStatusSaga(
  action: PayloadAction<TestResultProgressStatusUpdateRequestPayload>
): SagaIterator {
  try {
    const item: TestResult = yield call(
      api.updateTestResultProgressStatusApi,
      action.payload
    );
    yield put(actions.updateTestResultSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.updateTestResultFailure(getErrorMessage(err, UPDATE_ERROR_MESSAGE))
    );
  }
}

export function* watchTestResultSaga(): SagaIterator {
  yield takeLatest(actions.fetchTestResultsRequest.type, fetchTestResultsSaga);
  yield takeLatest(
    actions.fetchTestResultDetailRequest.type,
    fetchTestResultDetailSaga
  );
  yield takeLatest(actions.updateTestResultRequest.type, updateTestResultSaga);
  yield takeLatest(
    actions.updateTestResultProgressStatusRequest.type,
    updateTestResultProgressStatusSaga
  );
}
