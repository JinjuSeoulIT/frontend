import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchDepartmentListApi,
  fetchDepartmentDetailApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  createDepartmentApi,
} from "@/lib/staff/departmentAPI";
import {
  departmentListRequest,
  departmentListSuccess,
  departmentListFailure,
  departmentDetailRequest,
  departmentDetailSuccess,
  departmentDetailFailure,
  departmentCreateRequest,
  departmentCreateFailure,
  departmentUpdateRequest,
  departmentUpdateSuccess,
  departmentUpdateFailure,
  departmentDeleteRequest,
  departmentDeleteSuccess,
  departmentDeleteFailure,
  departmentCreateSuccess,
} from "./departmentSlisct";
import {
  ApiResponse,
  DepartmentCreateRequest,
  DepartmentResponse,
  DepartmentUpdatePayload,
} from "./departmentType";
import { PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";

function* ListDepartmentSaga(): SagaIterator {
  try {
    const response: ApiResponse<DepartmentResponse[]> = yield call(fetchDepartmentListApi);
    if (response.success) {
      yield put(departmentListSuccess(response.data));
    } else {
      yield put(departmentListFailure(response.message));
    }
  } catch(error: unknown) {
    yield put(departmentListFailure("부서 목록 조회 실패"));
  }
}

function* DetailDepartmentSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<DepartmentResponse> = yield call(fetchDepartmentDetailApi, action.payload);
    if (response.success) {
      yield put(departmentDetailSuccess(response.data));
    } else {
      yield put(departmentDetailFailure(response.message));
    }
  } catch (error: unknown){
    yield put(departmentDetailFailure("부서 상세 조회 실패"));
  }
}

function* createDepartmentSaga(action: PayloadAction<DepartmentCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<DepartmentResponse> = yield call(createDepartmentApi, action.payload);
    if (response.success) {
      yield put(departmentCreateSuccess(response.data));
    } else {
      yield put(departmentCreateFailure(response.message));
    }
  } catch (error: unknown){
    yield put(departmentCreateFailure("부서 생성 실패"));
  }
}

//수정
function* updateDepartmentSaga(action: PayloadAction<DepartmentUpdatePayload>): SagaIterator {
  try {
    const { deptId, deptReq } = action.payload;
    const response: ApiResponse<DepartmentResponse> = yield call(updateDepartmentApi, deptId, deptReq);
    if (response.success) {
      yield put(departmentUpdateSuccess(response.data));
    } else {
      yield put(departmentUpdateFailure(response.message));
    }
  } catch (error: unknown){
    yield put(departmentUpdateFailure("부서 수정 실패"));
  }
}

function* deleteDepartmentSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteDepartmentApi, action.payload);
    if (response.success) {
      yield put(departmentDeleteSuccess());
    } else {
      yield put(departmentDeleteFailure(response.message));
    }
  } catch  (error: unknown)  {
    yield put(departmentDeleteFailure("부서 삭제 실패"));
  }
}

export default function* watchStaffDepartmentSaga() {
  yield takeLatest(departmentListRequest.type, ListDepartmentSaga);
  yield takeLatest(departmentDetailRequest.type, DetailDepartmentSaga);
  yield takeLatest(departmentCreateRequest.type, createDepartmentSaga);
  yield takeLatest(departmentUpdateRequest.type, updateDepartmentSaga);
  yield takeLatest(departmentDeleteRequest.type, deleteDepartmentSaga);
}
