import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "@/lib/medical_support/pathologyApi";
import { PathologyActions as actions } from "./pathologySlice";
import type {
  PathologyExam,
  PathologyExamCreatePayload,
  PathologyExamUpdatePayload,
} from "@/features/medical_support/pathology/pathologyType";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchPathologiesSaga(): SagaIterator {
  try {
    const items: PathologyExam[] = yield call(api.fetchPathologyExamsApi);
    yield put(actions.fetchPathologiesSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchPathologiesFailure(
        getErrorMessage(err, "병리 검사 목록 조회에 실패했습니다.")
      )
    );
  }
}

function* fetchPathologySaga(
  action: PayloadAction<string>
): SagaIterator {
  try {
    const item: PathologyExam = yield call(
      api.fetchPathologyExamApi,
      action.payload
    );
    yield put(actions.fetchPathologySuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchPathologyFailure(
        getErrorMessage(err, "병리 검사 상세 조회에 실패했습니다.")
      )
    );
  }
}

function* createPathologySaga(
  action: PayloadAction<PathologyExamCreatePayload>
): SagaIterator {
  try {
    const item: PathologyExam = yield call(
      api.createPathologyExamApi,
      action.payload
    );
    yield put(actions.createPathologySuccess(item));
    yield put(actions.fetchPathologiesRequest());
  } catch (err: unknown) {
    yield put(
      actions.createPathologyFailure(
        getErrorMessage(err, "병리 검사 등록에 실패했습니다.")
      )
    );
  }
}

function* updatePathologySaga(
  action: PayloadAction<{
    pathologyExamId: string;
    form: PathologyExamUpdatePayload;
  }>
): SagaIterator {
  try {
    const { pathologyExamId, form } = action.payload;
    const item: PathologyExam = yield call(
      api.updatePathologyExamApi,
      pathologyExamId,
      form
    );
    yield put(actions.updatePathologySuccess(item));
    yield put(actions.fetchPathologiesRequest());
    yield put(actions.fetchPathologyRequest(pathologyExamId));
  } catch (err: unknown) {
    yield put(
      actions.updatePathologyFailure(
        getErrorMessage(err, "병리 검사 수정에 실패했습니다.")
      )
    );
  }
}

export function* watchPathologySaga(): SagaIterator {
  yield takeLatest(actions.fetchPathologiesRequest.type, fetchPathologiesSaga);
  yield takeLatest(actions.fetchPathologyRequest.type, fetchPathologySaga);
  yield takeLatest(actions.createPathologyRequest.type, createPathologySaga);
  yield takeLatest(actions.updatePathologyRequest.type, updatePathologySaga);
}