import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";

import type {
  ApiResponse,
  ReceptionCreateRequest,
  ReceptionIdNumber,
  ReceptionResponse,
  ReceptionUpdateNumber,
  SearchReceptionPayload,
} from "./receptionTypes";

import {
  createReceptionApi,
  deleteReceptionApi,
  DetailReceptionApi,
  ReceptionlistApi,
  searchReceptionListApi,
  updateReceptiondApi,

} from "@/lib/staff/employeeReceptionAPI";
import {
  createReceptionFailure,
  createReceptionRequest,
  createReceptionSuccess,

  deleteReceptionFailure,
  deleteReceptionRequest,
  deleteReceptionSuccess,

  DetailReceptionFailure,
  DetailReceptionRequest,
  DetailReceptionSuccess,

  ReceptionListFailure,
  ReceptionListRequest,
  ReceptionListSuccess,

  searchReceptionListFailure,
  searchReceptionListRequest,
  searchReceptionListSuccess,
  
  updateReceptionFailure,
  updateReceptionRequest,
  updateReceptionSuccess,
} from "./receptionSlice";

function* searchReceptionListSaga(action: PayloadAction<SearchReceptionPayload>): SagaIterator {
  try {
    const { search, searchType } = action.payload;
    const response: ApiResponse<ReceptionResponse[]> = yield call(searchReceptionListApi, search, searchType);
    if (response.success) {
      yield put(searchReceptionListSuccess(response.data));
    } else {
      yield put(searchReceptionListFailure(response.message));
    }
  } catch {
    yield put(searchReceptionListFailure("원무 직원 검색 실패 500"));
  }
}

function* receptionListSaga(): SagaIterator {
  try {
    const response: ApiResponse<ReceptionResponse[]> = yield call(ReceptionlistApi);
    if (response.success) {
      yield put(ReceptionListSuccess(response.data));
    } else {
      yield put(ReceptionListFailure(response.message));
    }
  } catch {
    yield put(ReceptionListFailure("원무 직원 목록 조회 실패 500"));
  }
}

function* detailReceptionSaga(action: PayloadAction<ReceptionIdNumber>): SagaIterator {
  try {
    const response: ApiResponse<ReceptionResponse> = yield call(DetailReceptionApi, action.payload);
    if (response.success) {
      yield put(DetailReceptionSuccess(response.data));
         console.log(response.message)
    } else {
      yield put(DetailReceptionFailure(response.message));
    }
  } catch {
    yield put(DetailReceptionFailure("원무 직원 상세 조회 실패 500"));
  }
}

function* createReceptionSaga(action: PayloadAction<ReceptionCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<ReceptionResponse> = yield call(createReceptionApi, action.payload);
    if (response.success) {
      yield put(createReceptionSuccess(response.data));
      console.log(response.message)
    } else {
      yield put(createReceptionFailure(response.message));
    }
  } catch {
    yield put(createReceptionFailure("원무 직원 생성 실패 500"));
  }
}

function* updateReceptionSaga(action: PayloadAction<ReceptionUpdateNumber>): SagaIterator {
  try {
    const { staffId, receptionReq } = action.payload;
    const response: ApiResponse<ReceptionResponse> = yield call(updateReceptiondApi, staffId, receptionReq);
    if (response.success) {
      yield put(updateReceptionSuccess(response.data));
    } else {
      yield put(updateReceptionFailure(response.message));
    }
  } catch {
    yield put(updateReceptionFailure("원무 직원 수정 실패 500"));
  }
}

function* deleteReceptionSaga(action: PayloadAction<ReceptionIdNumber>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteReceptionApi, action.payload.staffId);
    if (response.success) {
      yield put(deleteReceptionSuccess());
    } else {
      yield put(deleteReceptionFailure(response.message));
    }
  } catch {
    yield put(deleteReceptionFailure("원무 직원 삭제 실패 500"));
  }
}




export function* watchEmployeeReceptionSaga(): SagaIterator {
  yield takeLatest(searchReceptionListRequest.type, searchReceptionListSaga);
  yield takeLatest(ReceptionListRequest.type, receptionListSaga);
  yield takeLatest(DetailReceptionRequest.type, detailReceptionSaga);
  yield takeLatest(createReceptionRequest.type, createReceptionSaga);
  yield takeLatest(updateReceptionRequest.type, updateReceptionSaga);
  yield takeLatest(deleteReceptionRequest.type, deleteReceptionSaga);
}
