import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import {
  createPositionApi,
  deletePositionApi,
  fetchPositionDetailApi,
  fetchPositionListApi,
  updatePositionApi,
} from "@/lib/staff/positionAPI";
import {
  ApiResponse,
  PositionRequest,
  PositionResponse,
  PositionUpdatePayload,
} from "./positiontypes";
import {
  positionCreateFailure,
  positionCreateRequest,
  positionCreateSuccess,
  positionDeleteFailure,
  positionDeleteRequest,
  positionDeleteSuccess,
  positionDetailFailure,
  positionDetailRequest,
  positionDetailSuccess,
  positionListFailure,
  positionListRequest,
  positionListSuccess,
  positionUpdateFailure,
  positionUpdateRequest,
  positionUpdateSuccess,
} from "./positionSlice";

function* listPositionSaga(): SagaIterator {
  try {
    const response: ApiResponse<PositionResponse[]> = yield call(fetchPositionListApi);
    if (response.success) {
      yield put(positionListSuccess(response.data));
    } else {
      yield put(positionListFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(positionListFailure("직책 목록 조회 실패"));
  }
}

function* detailPositionSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<PositionResponse> = yield call(fetchPositionDetailApi, action.payload);
    if (response.success) {
      yield put(positionDetailSuccess(response.data));
    } else {
      yield put(positionDetailFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(positionDetailFailure("직책 상세 조회 실패"));
  }
}

function* createPositionSaga(action: PayloadAction<PositionRequest>): SagaIterator {
  try {
    const response: ApiResponse<PositionResponse> = yield call(createPositionApi, action.payload);
    if (response.success) {
      yield put(positionCreateSuccess(response.data));
    } else {
      yield put(positionCreateFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(positionCreateFailure("직책 등록 실패"));
  }
}

function* updatePositionSaga(action: PayloadAction<PositionUpdatePayload>): SagaIterator {
  try {
    const { positionId, positionReq } = action.payload;
    const response: ApiResponse<PositionResponse> = yield call(updatePositionApi, positionId, positionReq);
    if (response.success) {
      yield put(positionUpdateSuccess(response.data));
    } else {
      yield put(positionUpdateFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(positionUpdateFailure("직책 수정 실패"));
  }
}

function* deletePositionSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deletePositionApi, action.payload);
    if (response.success) {
      yield put(positionDeleteSuccess());
    } else {
      yield put(positionDeleteFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(positionDeleteFailure("직책 삭제 실패"));
  }
}

export default function* watchStaffPositionSaga() {
  yield takeLatest(positionListRequest.type, listPositionSaga);
  yield takeLatest(positionDetailRequest.type, detailPositionSaga);
  yield takeLatest(positionCreateRequest.type, createPositionSaga);
  yield takeLatest(positionUpdateRequest.type, updatePositionSaga);
  yield takeLatest(positionDeleteRequest.type, deletePositionSaga);
}
