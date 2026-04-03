import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "@/lib/medical_support/physiologicalApi";
import { PhysiologicalActions as actions } from "./physiologicalSlice";
import type {
  PhysiologicalExam,
  PhysiologicalExamCreatePayload,
  PhysiologicalExamUpdatePayload,
} from "@/features/medical_support/physiological/physiologicalType";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchPhysiologicalsSaga(): SagaIterator {
  try {
    const items: PhysiologicalExam[] = yield call(api.fetchPhysiologicalExamsApi);
    yield put(actions.fetchPhysiologicalsSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchPhysiologicalsFailure(
        getErrorMessage(err, "생리 기능 검사 목록 조회에 실패했습니다.")
      )
    );
  }
}

function* fetchPhysiologicalSaga(
  action: PayloadAction<string>
): SagaIterator {
  try {
    const item: PhysiologicalExam = yield call(
      api.fetchPhysiologicalExamApi,
      action.payload
    );
    yield put(actions.fetchPhysiologicalSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchPhysiologicalFailure(
        getErrorMessage(err, "생리 기능 검사 상세 조회에 실패했습니다.")
      )
    );
  }
}

function* createPhysiologicalSaga(
  action: PayloadAction<PhysiologicalExamCreatePayload>
): SagaIterator {
  try {
    const item: PhysiologicalExam = yield call(
      api.createPhysiologicalExamApi,
      action.payload
    );
    yield put(actions.createPhysiologicalSuccess(item));
    yield put(actions.fetchPhysiologicalsRequest());
  } catch (err: unknown) {
    yield put(
      actions.createPhysiologicalFailure(
        getErrorMessage(err, "생리 기능 검사 등록에 실패했습니다.")
      )
    );
  }
}

function* updatePhysiologicalSaga(
  action: PayloadAction<{
    physiologicalExamId: string;
    form: PhysiologicalExamUpdatePayload;
  }>
): SagaIterator {
  try {
    const { physiologicalExamId, form } = action.payload;
    const item: PhysiologicalExam = yield call(
      api.updatePhysiologicalExamApi,
      physiologicalExamId,
      form
    );
    yield put(actions.updatePhysiologicalSuccess(item));
    yield put(actions.fetchPhysiologicalsRequest());
    yield put(actions.fetchPhysiologicalRequest(physiologicalExamId));
  } catch (err: unknown) {
    yield put(
      actions.updatePhysiologicalFailure(
        getErrorMessage(err, "생리 기능 검사 수정에 실패했습니다.")
      )
    );
  }
}

export function* watchPhysiologicalSaga(): SagaIterator {
  yield takeLatest(
    actions.fetchPhysiologicalsRequest.type,
    fetchPhysiologicalsSaga
  );
  yield takeLatest(
    actions.fetchPhysiologicalRequest.type,
    fetchPhysiologicalSaga
  );
  yield takeLatest(
    actions.createPhysiologicalRequest.type,
    createPhysiologicalSaga
  );
  yield takeLatest(
    actions.updatePhysiologicalRequest.type,
    updatePhysiologicalSaga
  );
}