import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import {
  createLocationApi,
  deleteLocationApi,
  fetchLocationDetailApi,
  fetchLocationListApi,
  updateLocationApi,
} from "@/lib/staff/locationAPI";
import {
  ApiResponse,
  LocationCreateRequest,
  LocationResponse,
  LocationUpdatePayload,
} from "./locationtypes";
import {
  locationCreateFailure,
  locationCreateRequest,
  locationCreateSuccess,
  locationDeleteFailure,
  locationDeleteRequest,
  locationDeleteSuccess,
  locationDetailFailure,
  locationDetailRequest,
  locationDetailSuccess,
  locationListFailure,
  locationListRequest,
  locationListSuccess,
  locationUpdateFailure,
  locationUpdateRequest,
  locationUpdateSuccess,
} from "./locationSlice";

function* listLocationSaga(): SagaIterator {
  try {
    const response: ApiResponse<LocationResponse[]> = yield call(fetchLocationListApi);
    if (response.success) {
      yield put(locationListSuccess(response.data));
    } else {
      yield put(locationListFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(locationListFailure("부서 위치 목록 조회 실패"));
  }
}

function* detailLocationSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<LocationResponse> = yield call(fetchLocationDetailApi, action.payload);
    if (response.success) {
      yield put(locationDetailSuccess(response.data));
    } else {
      yield put(locationDetailFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(locationDetailFailure("부서 위치 상세 조회 실패"));
  }
}

function* createLocationSaga(action: PayloadAction<LocationCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<LocationResponse> = yield call(createLocationApi, action.payload);
    if (response.success) {
      yield put(locationCreateSuccess(response.data));
    } else {
      yield put(locationCreateFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(locationCreateFailure("부서 위치 등록 실패"));
  }
}

function* updateLocationSaga(action: PayloadAction<LocationUpdatePayload>): SagaIterator {
  try {
    const { deptId, locationReq } = action.payload;
    const response: ApiResponse<LocationResponse> = yield call(updateLocationApi, deptId, locationReq);
    if (response.success) {
      yield put(locationUpdateSuccess(response.data));
    } else {
      yield put(locationUpdateFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(locationUpdateFailure("부서 위치 수정 실패"));
  }
}

function* deleteLocationSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteLocationApi, action.payload);
    if (response.success) {
      yield put(locationDeleteSuccess());
    } else {
      yield put(locationDeleteFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(locationDeleteFailure("부서 위치 삭제 실패"));
  }
}

export default function* watchStaffLocationSaga() {
  yield takeLatest(locationListRequest.type, listLocationSaga);
  yield takeLatest(locationDetailRequest.type, detailLocationSaga);
  yield takeLatest(locationCreateRequest.type, createLocationSaga);
  yield takeLatest(locationUpdateRequest.type, updateLocationSaga);
  yield takeLatest(locationDeleteRequest.type, deleteLocationSaga);
}
