import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";

import {
  createNurseFailure,
  createNurseRequest,
  createNurseSuccess,
  deleteNurseFailure,
  deleteNurseRequest,
  deleteNurseSuccess,
  DetailNurseFailure,
  DetailNurseRequest,
  DetailNurseSuccess,
  nurselistFailure,
  nurselistRequest,
  nurselistSuccess,
  updateNursedRequest,
  updateNurseFailure,
  updateNurseSuccess,
  uploadNurseFileFailure,
  uploadNurseFileRequest,
  uploadNurseFileSuccess,
  searchNurseListRequest,
  searchNurseListSuccess,
  searchNurseListFailure,
} from "@/features/staff/nurse/nurseSlice";

import type {
  ApiResponse,
  FileUploadResDTO,
  NurseCreateRequest,
  NurseFile,
  NurseIdNumber,
  NurseResponse,
  NurseUpdateNumber,
  SearchNursePayload,
} from "./nurseTypes";

import {
  createNurseApi,
  deleteNurseApi,
  DetailNurseApi,
  nurselistApi,
  updateNursedApi,
  uploadFileApi,
  searchNurseListApi,
} from "@/lib/staff/employeeNurseApi";


//검색
function* searchNurseListSaga(action: PayloadAction<SearchNursePayload>): SagaIterator {
  try {
    const { search, searchType } = action.payload;

    const response: ApiResponse<NurseResponse[]> = yield call(searchNurseListApi, search, searchType);
    if(response.success){
    yield put(searchNurseListSuccess(response.data));
    }else{
    yield put(searchNurseListFailure(response.message));
    }
    } catch (error: unknown) {
    yield put(searchNurseListFailure( "간호사 검색 실패 500"));
    }
    }

//조회
function* nurseListSaga(): SagaIterator {
  try {
    const response: ApiResponse<NurseResponse[]> = yield call(nurselistApi);
    if (response.success) {
    yield put(nurselistSuccess(response.data));
    } else {
    yield put(nurselistFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(nurselistFailure("간호사 목록 조회 실패 500"));
  }
  }

//상세
function* detailNurseSaga(action: PayloadAction<NurseIdNumber>): SagaIterator {
  try {
    const response: ApiResponse<NurseResponse> = yield call(DetailNurseApi, action.payload);
    if (response.success) {
      yield put(DetailNurseSuccess(response.data));
    } else {
      yield put(DetailNurseFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(DetailNurseFailure( "간호사 상세 조회 실패 500"));
  }
}

//생성
function* createNurseSaga(action: PayloadAction<NurseCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<NurseResponse> = yield call(createNurseApi, action.payload);
    if (response.success) {
      yield put(createNurseSuccess(response.data));
    } else {
      yield put(createNurseFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(createNurseFailure( "간호사 등록 실패"));
  }
}

//수정
function* updateNurseSaga(action: PayloadAction<NurseUpdateNumber>): SagaIterator {
  try {
    const { staffId, nurseReq } = action.payload;
    const response: ApiResponse<NurseResponse> = yield call(updateNursedApi, staffId, nurseReq);
    if (response.success) {
      yield put(updateNurseSuccess(response.data));
    } else {
      yield put(updateNurseFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(updateNurseFailure( "간호사 수정 실패"));
  }
}

//삭제
function* deleteNurseSaga(action: PayloadAction<NurseIdNumber>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteNurseApi, action.payload.staffId);
    if (response.success) {
      yield put(deleteNurseSuccess());
    } else {
      yield put(deleteNurseFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(deleteNurseFailure( "간호사 삭제 실패"));
  }
}

//업로드
function* uploadNurseFileSaga(action: PayloadAction<NurseFile>): SagaIterator {
  try {
    const { staffId, file } = action.payload;
    const response: ApiResponse<FileUploadResDTO> = yield call(uploadFileApi, staffId, file);
    if (response.success) {
      yield put(uploadNurseFileSuccess(response.data));
    } else {
      yield put(uploadNurseFileFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(uploadNurseFileFailure( "파일 업로드 실패"));
  }
}



export function* watchEmployeeNurseSaga(): SagaIterator {
  yield takeLatest(searchNurseListRequest.type, searchNurseListSaga);
  yield takeLatest(nurselistRequest.type, nurseListSaga);
  yield takeLatest(DetailNurseRequest.type, detailNurseSaga);
  yield takeLatest(createNurseRequest.type, createNurseSaga);
  yield takeLatest(updateNursedRequest.type, updateNurseSaga);
  yield takeLatest(deleteNurseRequest.type, deleteNurseSaga);
  yield takeLatest(uploadNurseFileRequest.type, uploadNurseFileSaga);
}
