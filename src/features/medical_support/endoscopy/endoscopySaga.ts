import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "@/lib/medical_support/endoscopyApi";
import { EndoscopyActions as actions } from "./endoscopySlice";
import type {
  EndoscopyExam,
  EndoscopyExamCreatePayload,
  EndoscopyExamUpdatePayload,
} from "@/features/medical_support/endoscopy/endoscopyType";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchEndoscopiesSaga(): SagaIterator {
  try {
    const items: EndoscopyExam[] = yield call(api.fetchEndoscopyExamsApi);
    yield put(actions.fetchEndoscopiesSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchEndoscopiesFailure(
        getErrorMessage(err, "내시경 검사 목록 조회에 실패했습니다.")
      )
    );
  }
}

function* fetchEndoscopySaga(
  action: PayloadAction<string>
): SagaIterator {
  try {
    const item: EndoscopyExam = yield call(
      api.fetchEndoscopyExamApi,
      action.payload
    );
    yield put(actions.fetchEndoscopySuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchEndoscopyFailure(
        getErrorMessage(err, "내시경 검사 상세 조회에 실패했습니다.")
      )
    );
  }
}

function* createEndoscopySaga(
  action: PayloadAction<EndoscopyExamCreatePayload>
): SagaIterator {
  try {
    const item: EndoscopyExam = yield call(
      api.createEndoscopyExamApi,
      action.payload
    );
    yield put(actions.createEndoscopySuccess(item));
    yield put(actions.fetchEndoscopiesRequest());
  } catch (err: unknown) {
    yield put(
      actions.createEndoscopyFailure(
        getErrorMessage(err, "내시경 검사 등록에 실패했습니다.")
      )
    );
  }
}

function* updateEndoscopySaga(
  action: PayloadAction<{
    endoscopyExamId: string;
    form: EndoscopyExamUpdatePayload;
  }>
): SagaIterator {
  try {
    const { endoscopyExamId, form } = action.payload;
    const item: EndoscopyExam = yield call(
      api.updateEndoscopyExamApi,
      endoscopyExamId,
      form
    );
    yield put(actions.updateEndoscopySuccess(item));
    yield put(actions.fetchEndoscopiesRequest());
    yield put(actions.fetchEndoscopyRequest(endoscopyExamId));
  } catch (err: unknown) {
    yield put(
      actions.updateEndoscopyFailure(
        getErrorMessage(err, "내시경 검사 수정에 실패했습니다.")
      )
    );
  }
}

export function* watchEndoscopySaga(): SagaIterator {
  yield takeLatest(actions.fetchEndoscopiesRequest.type, fetchEndoscopiesSaga);
  yield takeLatest(actions.fetchEndoscopyRequest.type, fetchEndoscopySaga);
  yield takeLatest(actions.createEndoscopyRequest.type, createEndoscopySaga);
  yield takeLatest(actions.updateEndoscopyRequest.type, updateEndoscopySaga);
}