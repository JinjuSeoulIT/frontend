import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "@/lib/medical_support/imagingApi";
import { ImagingActions as actions } from "./imagingSlice";
import type {
  ImagingExam,
  ImagingExamCreatePayload,
  ImagingExamUpdatePayload,
} from "@/features/medical_support/imaging/imagingType";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchImagingsSaga(): SagaIterator {
  try {
    const items: ImagingExam[] = yield call(api.fetchImagingExamsApi);
    yield put(actions.fetchImagingsSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchImagingsFailure(
        getErrorMessage(err, "영상 검사 목록 조회에 실패했습니다.")
      )
    );
  }
}

function* fetchImagingSaga(
  action: PayloadAction<string>
): SagaIterator {
  try {
    const item: ImagingExam = yield call(
      api.fetchImagingExamApi,
      action.payload
    );
    yield put(actions.fetchImagingSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchImagingFailure(
        getErrorMessage(err, "영상 검사 상세 조회에 실패했습니다.")
      )
    );
  }
}

function* createImagingSaga(
  action: PayloadAction<ImagingExamCreatePayload>
): SagaIterator {
  try {
    const item: ImagingExam = yield call(
      api.createImagingExamApi,
      action.payload
    );
    yield put(actions.createImagingSuccess(item));
    yield put(actions.fetchImagingsRequest());
  } catch (err: unknown) {
    yield put(
      actions.createImagingFailure(
        getErrorMessage(err, "영상 검사 등록에 실패했습니다.")
      )
    );
  }
}

function* updateImagingSaga(
  action: PayloadAction<{
    imagingExamId: string;
    form: ImagingExamUpdatePayload;
  }>
): SagaIterator {
  try {
    const { imagingExamId, form } = action.payload;
    const item: ImagingExam = yield call(
      api.updateImagingExamApi,
      imagingExamId,
      form
    );
    yield put(actions.updateImagingSuccess(item));
    yield put(actions.fetchImagingsRequest());
    yield put(actions.fetchImagingRequest(imagingExamId));
  } catch (err: unknown) {
    yield put(
      actions.updateImagingFailure(
        getErrorMessage(err, "영상 검사 수정에 실패했습니다.")
      )
    );
  }
}

export function* watchImagingSaga(): SagaIterator {
  yield takeLatest(actions.fetchImagingsRequest.type, fetchImagingsSaga);
  yield takeLatest(actions.fetchImagingRequest.type, fetchImagingSaga);
  yield takeLatest(actions.createImagingRequest.type, createImagingSaga);
  yield takeLatest(actions.updateImagingRequest.type, updateImagingSaga);
}