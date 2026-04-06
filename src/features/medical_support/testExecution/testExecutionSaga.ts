import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TestExecution } from "@/features/medical_support/testExecution/testExecutionType";
import * as api from "@/lib/medical_support/testExecutionApi";
import { TestExecutionActions as actions } from "./testExecutionSlice";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchTestExecutionsSaga(
  action: PayloadAction<{ executionType?: string } | undefined>
): SagaIterator {
  try {
    const executionType = action.payload?.executionType;
    const items: TestExecution[] = yield call(api.fetchTestExecutionsApi, executionType);
    yield put(actions.fetchTestExecutionsSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchTestExecutionsFailure(
        getErrorMessage(err, "검사 수행 목록 조회에 실패했습니다.")
      )
    );
  }
}

function* fetchTestExecutionSaga(
  action: PayloadAction<string>
): SagaIterator {
  try {
    const item: TestExecution = yield call(api.fetchTestExecutionApi, action.payload);
    yield put(actions.fetchTestExecutionSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchTestExecutionFailure(
        getErrorMessage(err, "검사 수행 상세 조회에 실패했습니다.")
      )
    );
  }
}

function* createTestExecutionSaga(
  action: PayloadAction<TestExecution>
): SagaIterator {
  try {
    const item: TestExecution = yield call(api.createTestExecutionApi, action.payload);
    yield put(actions.createTestExecutionSuccess(item));
    yield put(actions.fetchTestExecutionsRequest(undefined));
  } catch (err: unknown) {
    yield put(
      actions.createTestExecutionFailure(
        getErrorMessage(err, "검사 수행 등록에 실패했습니다.")
      )
    );
  }
}

function* updateTestExecutionSaga(
  action: PayloadAction<{ testExecutionId: string; form: TestExecution }>
): SagaIterator {
  try {
    const { testExecutionId, form } = action.payload;
    const item: TestExecution = yield call(
      api.updateTestExecutionApi,
      testExecutionId,
      form
    );
    yield put(actions.updateTestExecutionSuccess(item));
    yield put(actions.fetchTestExecutionsRequest(undefined));
    yield put(actions.fetchTestExecutionRequest(testExecutionId));
  } catch (err: unknown) {
    yield put(
      actions.updateTestExecutionFailure(
        getErrorMessage(err, "검사 수행 수정에 실패했습니다.")
      )
    );
  }
}

export function* watchTestExecutionSaga(): SagaIterator {
  yield takeLatest(actions.fetchTestExecutionsRequest.type, fetchTestExecutionsSaga);
  yield takeLatest(actions.fetchTestExecutionRequest.type, fetchTestExecutionSaga);
  yield takeLatest(actions.createTestExecutionRequest.type, createTestExecutionSaga);
  yield takeLatest(actions.updateTestExecutionRequest.type, updateTestExecutionSaga);
}
