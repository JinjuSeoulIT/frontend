import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "@/lib/medical_support/specimenApi";
import { SpecimenActions as actions } from "./specimenSlice";
import type {
  SpecimenExam,
  SpecimenExamCreatePayload,
  SpecimenExamUpdatePayload,
} from "@/features/medical_support/specimen/specimenType";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchSpecimensSaga(): SagaIterator {
  try {
    const items: SpecimenExam[] = yield call(api.fetchSpecimenExamsApi);
    yield put(actions.fetchSpecimensSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchSpecimensFailure(
        getErrorMessage(err, "검체 검사 목록 조회에 실패했습니다.")
      )
    );
  }
}

function* fetchSpecimenSaga(
  action: PayloadAction<string>
): SagaIterator {
  try {
    const item: SpecimenExam = yield call(
      api.fetchSpecimenExamApi,
      action.payload
    );
    yield put(actions.fetchSpecimenSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchSpecimenFailure(
        getErrorMessage(err, "검체 검사 상세 조회에 실패했습니다.")
      )
    );
  }
}

function* createSpecimenSaga(
  action: PayloadAction<SpecimenExamCreatePayload>
): SagaIterator {
  try {
    const item: SpecimenExam = yield call(
      api.createSpecimenExamApi,
      action.payload
    );
    yield put(actions.createSpecimenSuccess(item));
    yield put(actions.fetchSpecimensRequest());
  } catch (err: unknown) {
    yield put(
      actions.createSpecimenFailure(
        getErrorMessage(err, "검체 검사 등록에 실패했습니다.")
      )
    );
  }
}

function* updateSpecimenSaga(
  action: PayloadAction<{
    specimenExamId: string;
    form: SpecimenExamUpdatePayload;
  }>
): SagaIterator {
  try {
    const { specimenExamId, form } = action.payload;
    const item: SpecimenExam = yield call(
      api.updateSpecimenExamApi,
      specimenExamId,
      form
    );
    yield put(actions.updateSpecimenSuccess(item));
    yield put(actions.fetchSpecimensRequest());
    yield put(actions.fetchSpecimenRequest(specimenExamId));
  } catch (err: unknown) {
    yield put(
      actions.updateSpecimenFailure(
        getErrorMessage(err, "검체 검사 수정에 실패했습니다.")
      )
    );
  }
}

export function* watchSpecimenSaga(): SagaIterator {
  yield takeLatest(actions.fetchSpecimensRequest.type, fetchSpecimensSaga);
  yield takeLatest(actions.fetchSpecimenRequest.type, fetchSpecimenSaga);
  yield takeLatest(actions.createSpecimenRequest.type, createSpecimenSaga);
  yield takeLatest(actions.updateSpecimenRequest.type, updateSpecimenSaga);
}