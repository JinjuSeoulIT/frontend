import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "@/lib/medical_support/treatmentResultApi";
import { TreatmentResultActions as actions } from "./treatmentResultSlice";
import type {
  TreatmentResult,
  TreatmentResultCreatePayload,
  TreatmentResultUpdatePayload,
} from "@/features/medical_support/treatmentResult/treatmentResultType";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

function* fetchTreatmentResultsSaga(): SagaIterator {
  try {
    const items: TreatmentResult[] = yield call(api.fetchTreatmentResultsApi);
    yield put(actions.fetchTreatmentResultsSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchTreatmentResultsFailure(
        getErrorMessage(err, "처치 결과 목록 조회에 실패했습니다.")
      )
    );
  }
}

function* fetchTreatmentResultSaga(
  action: PayloadAction<string>
): SagaIterator {
  try {
    const item: TreatmentResult = yield call(
      api.fetchTreatmentResultApi,
      action.payload
    );
    yield put(actions.fetchTreatmentResultSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchTreatmentResultFailure(
        getErrorMessage(err, "처치 결과 상세 조회에 실패했습니다.")
      )
    );
  }
}

function* createTreatmentResultSaga(
  action: PayloadAction<TreatmentResultCreatePayload>
): SagaIterator {
  try {
    const item: TreatmentResult = yield call(
      api.createTreatmentResultApi,
      action.payload
    );
    yield put(actions.createTreatmentResultSuccess(item));
    yield put(actions.fetchTreatmentResultsRequest());
  } catch (err: unknown) {
    yield put(
      actions.createTreatmentResultFailure(
        getErrorMessage(err, "처치 결과 등록에 실패했습니다.")
      )
    );
  }
}

function* updateTreatmentResultSaga(
  action: PayloadAction<{
    procedureResultId: string;
    form: TreatmentResultUpdatePayload;
  }>
): SagaIterator {
  try {
    const { procedureResultId, form } = action.payload;
    const item: TreatmentResult = yield call(
      api.updateTreatmentResultApi,
      procedureResultId,
      form
    );
    yield put(actions.updateTreatmentResultSuccess(item));
    yield put(actions.fetchTreatmentResultsRequest());
    yield put(actions.fetchTreatmentResultRequest(procedureResultId));
  } catch (err: unknown) {
    yield put(
      actions.updateTreatmentResultFailure(
        getErrorMessage(err, "처치 결과 수정에 실패했습니다.")
      )
    );
  }
}

export function* watchTreatmentResultSaga(): SagaIterator {
  yield takeLatest(
    actions.fetchTreatmentResultsRequest.type,
    fetchTreatmentResultsSaga
  );
  yield takeLatest(
    actions.fetchTreatmentResultRequest.type,
    fetchTreatmentResultSaga
  );
  yield takeLatest(
    actions.createTreatmentResultRequest.type,
    createTreatmentResultSaga
  );
  yield takeLatest(
    actions.updateTreatmentResultRequest.type,
    updateTreatmentResultSaga
  );
}