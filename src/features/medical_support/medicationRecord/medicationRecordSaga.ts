import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "@/lib/medical_support/medicationRecordApi";
import { MedicationRecordActions as actions } from "./medicationRecordSlice";
import type {
  MedicationRecord,
  MedicationRecordCreatePayload,
  MedicationRecordSearchParams,
  MedicationRecordUpdatePayload,
} from "@/features/medical_support/medicationRecord/medicationRecordType";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

const hasSearchParams = (
  params?: MedicationRecordSearchParams
): params is MedicationRecordSearchParams =>
  Boolean(
    params &&
      Object.values(params).some((value) => value != null && value.trim() !== "")
  );

function* fetchMedicationRecordsSaga(
  action: PayloadAction<MedicationRecordSearchParams | undefined>
): SagaIterator {
  try {
    const items: MedicationRecord[] = hasSearchParams(action.payload)
      ? yield call(api.searchMedicationRecordsApi, action.payload)
      : yield call(api.fetchMedicationRecordsApi);
    yield put(actions.fetchMedicationRecordsSuccess(items));
  } catch (err: unknown) {
    yield put(
      actions.fetchMedicationRecordsFailure(
        getErrorMessage(err, "투약 기록 목록 조회에 실패했습니다.")
      )
    );
  }
}

function* fetchMedicationRecordSaga(
  action: PayloadAction<string>
): SagaIterator {
  try {
    const item: MedicationRecord = yield call(
      api.fetchMedicationRecordApi,
      action.payload
    );
    yield put(actions.fetchMedicationRecordSuccess(item));
  } catch (err: unknown) {
    yield put(
      actions.fetchMedicationRecordFailure(
        getErrorMessage(err, "투약 기록 상세 조회에 실패했습니다.")
      )
    );
  }
}

function* createMedicationRecordSaga(
  action: PayloadAction<MedicationRecordCreatePayload>
): SagaIterator {
  try {
    const item: MedicationRecord = yield call(
      api.createMedicationRecordApi,
      action.payload
    );
    yield put(actions.createMedicationRecordSuccess(item));
    yield put(actions.fetchMedicationRecordsRequest());
  } catch (err: unknown) {
    yield put(
      actions.createMedicationRecordFailure(
        getErrorMessage(err, "투약 기록 등록에 실패했습니다.")
      )
    );
  }
}

function* updateMedicationRecordSaga(
  action: PayloadAction<{
    medicationRecordId: string;
    form: MedicationRecordUpdatePayload;
  }>
): SagaIterator {
  try {
    const { medicationRecordId, form } = action.payload;
    const item: MedicationRecord = yield call(
      api.updateMedicationRecordApi,
      medicationRecordId,
      form
    );
    yield put(actions.updateMedicationRecordSuccess(item));
    yield put(actions.fetchMedicationRecordsRequest());
    yield put(actions.fetchMedicationRecordRequest(medicationRecordId));
  } catch (err: unknown) {
    yield put(
      actions.updateMedicationRecordFailure(
        getErrorMessage(err, "투약 기록 수정에 실패했습니다.")
      )
    );
  }
}

export function* watchMedicationRecordSaga(): SagaIterator {
  yield takeLatest(
    actions.fetchMedicationRecordsRequest.type,
    fetchMedicationRecordsSaga
  );
  yield takeLatest(
    actions.fetchMedicationRecordRequest.type,
    fetchMedicationRecordSaga
  );
  yield takeLatest(
    actions.createMedicationRecordRequest.type,
    createMedicationRecordSaga
  );
  yield takeLatest(
    actions.updateMedicationRecordRequest.type,
    updateMedicationRecordSaga
  );
}
