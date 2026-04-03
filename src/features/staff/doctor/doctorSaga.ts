import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";

import type {
  ApiResponse,
  DoctorCreateRequest,
  DoctorFile,
  DoctorResponse,
  DoctorIdNumber,
  DoctorUpdateNumber,
  FileUploadResDTO,
  SearchDoctorPayload,
} from "./doctortypes";

import {
  DoctorListRequest,
  DoctorListSuccess,
  DoctorListFailure,

  DetailDoctorRequest,
  DetailDoctorSuccess,
  DetailDoctorFailure,

  createDoctorRequest,
  createDoctorSuccess,
  createDoctorFailure,

  updateDoctorRequest,
  updateDoctorSuccess,
  updateDoctorFailure,

  deleteDoctorRequest,
  deleteDoctorSuccess,
  deleteDoctorFailure,

  uploadDoctorFileRequest,
  uploadDoctorFileSuccess,
  uploadDoctorFileFailure,

  searchDoctorListSuccess,
  searchDoctorListFailure,
  searchDoctorListRequest,
} from "./doctorSlice";

import {
  DoctorProfileListApi,
  DoctorProfileDetailApi,
  createDoctorApi,
  updateDoctorApi,
  deleteDoctorApi,
  uploadFileApi,
  searchDoctorListApi,
} from "@/lib/staff/employeedoctorAPI";

// 검색
function* searchDoctorListSaga(action: PayloadAction<SearchDoctorPayload>): SagaIterator {
  try {
    const { search, searchType } = action.payload;
    const response: ApiResponse<DoctorResponse[]> = yield call(searchDoctorListApi, search, searchType);
    console.log(response);
    if (response.success) {
      yield put(searchDoctorListSuccess(response.data));
    } else {
      yield put(searchDoctorListFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(searchDoctorListFailure("의사 검색 실패 500"));
  }
}

// 조회
function* doctorListSaga(): SagaIterator {
  try {
    const response: ApiResponse<DoctorResponse[]> = yield call(DoctorProfileListApi);
    if (response.success) {
      yield put(DoctorListSuccess(response.data));
    } else {
      yield put(DoctorListFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(DoctorListFailure("의사 목록 조회 실패 500"));
  }
}

// 상세조회
function* detailDoctorSaga(action: PayloadAction<number>): SagaIterator {
  try {
    // ✅ slice에서 payload를 number로 보내므로 saga도 number 기준으로 맞춤
    const staffId = action.payload;

    // ✅ NaN / undefined 방어
    if (!Number.isFinite(staffId)) {
      throw new Error(`유효하지 않은 staffId: ${staffId}`);
    }

    const response: ApiResponse<DoctorResponse> = yield call(DoctorProfileDetailApi, { staffId });
    if (response.success) {
      yield put(DetailDoctorSuccess(response.data));
    } else {
      yield put(DetailDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(DetailDoctorFailure("의사 상세 조회 실패 500"));
  }
}

// 생성
function* createDoctorSaga(action: PayloadAction<DoctorCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<DoctorResponse> = yield call(createDoctorApi, action.payload);
    if (response.success) {
      yield put(createDoctorSuccess(response.data));
    } else {
      yield put(createDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(createDoctorFailure("의사 등록 실패 500"));
  }
}

// 수정
function* updateDoctorSaga(action: PayloadAction<DoctorUpdateNumber>): SagaIterator {
  try {
    const { staffId, doctorReq } = action.payload;
    const response: ApiResponse<DoctorResponse> = yield call(updateDoctorApi, staffId, doctorReq);
    if (response.success) {
      yield put(updateDoctorSuccess(response.data));
    } else {
      yield put(updateDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(updateDoctorFailure("의사 수정 실패 500"));
  }
}

// 삭제
function* deleteDoctorSaga(action: PayloadAction<DoctorIdNumber>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteDoctorApi, action.payload.staffId);
    if (response.success) {
      yield put(deleteDoctorSuccess());
    } else {
      yield put(deleteDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(deleteDoctorFailure("의사 삭제 실패 500"));
  }
}

// 업로드
function* uploadDoctorFileSaga(action: PayloadAction<DoctorFile>): SagaIterator {
  try {
    const { staffId, file } = action.payload;
    const response: ApiResponse<FileUploadResDTO> = yield call(uploadFileApi, staffId, file);
    if (response.success) {
      yield put(uploadDoctorFileSuccess(response.data));
    } else {
      yield put(uploadDoctorFileFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(uploadDoctorFileFailure("파일 업로드 실패 500"));
  }
}

export function* watchEmployeeDoctorSaga(): SagaIterator {
  yield takeLatest(searchDoctorListRequest.type, searchDoctorListSaga);
  yield takeLatest(DoctorListRequest.type, doctorListSaga);
  yield takeLatest(DetailDoctorRequest.type, detailDoctorSaga);
  yield takeLatest(createDoctorRequest.type, createDoctorSaga);
  yield takeLatest(updateDoctorRequest.type, updateDoctorSaga);
  yield takeLatest(deleteDoctorRequest.type, deleteDoctorSaga);
  yield takeLatest(uploadDoctorFileRequest.type, uploadDoctorFileSaga);
}
