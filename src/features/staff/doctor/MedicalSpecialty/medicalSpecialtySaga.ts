import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";
import {
  createMedicalApi,
  deleteMedicalApi,
  fetchMedicalDetailApi,
  fetchMedicalListApi,
  updateMedicalApi,
  createSpecialtyApi,
  deleteSpecialtyApi,
  fetchSpecialtyDetailApi,
  fetchSpecialtyListApi,
  updateSpecialtyApi,
} from "@/lib/staff/doctorMedicalSpecialtyAPI";
import type {
  ApiResponse,
  MedicalCreateRequest,
  MedicalResponse,
  MedicalUpdatePayload,
  SpecialtyCreateRequest,
  SpecialtyResponse,
  SpecialtyUpdatePayload,
} from "./medicalSpecialtytypes";
import {
  medicalCreateFailure,
  medicalCreateRequest,
  medicalCreateSuccess,
  medicalDeleteFailure,
  medicalDeleteRequest,
  medicalDeleteSuccess,
  medicalDetailFailure,
  medicalDetailRequest,
  medicalDetailSuccess,
  medicalListFailure,
  medicalListRequest,
  medicalListSuccess,
  medicalUpdateFailure,
  medicalUpdateRequest,
  medicalUpdateSuccess,
  specialtyCreateFailure,
  specialtyCreateRequest,
  specialtyCreateSuccess,
  specialtyDeleteFailure,
  specialtyDeleteRequest,
  specialtyDeleteSuccess,
  specialtyDetailFailure,
  specialtyDetailRequest,
  specialtyDetailSuccess,
  specialtyListFailure,
  specialtyListRequest,
  specialtyListSuccess,
  specialtyUpdateFailure,
  specialtyUpdateRequest,
  specialtyUpdateSuccess,
} from "./medicalSpecialtySlice";

function* listMedicalSaga(): SagaIterator {
  try {
    const response: ApiResponse<MedicalResponse[]> = yield call(fetchMedicalListApi);
    if (response.success) yield put(medicalListSuccess(response.data));
    else yield put(medicalListFailure(response.message));
  } catch {
    yield put(medicalListFailure("메지컬 목록 조회 실패"));
  }
}

function* detailMedicalSaga(action: PayloadAction<number>): SagaIterator {
  try {
    const response: ApiResponse<MedicalResponse> = yield call(fetchMedicalDetailApi, action.payload);
    if (response.success) yield put(medicalDetailSuccess(response.data));
    else yield put(medicalDetailFailure(response.message));
  } catch {
    yield put(medicalDetailFailure("메지컬 상세 조회 실패"));
  }
}

function* createMedicalSaga(action: PayloadAction<MedicalCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<MedicalResponse> = yield call(createMedicalApi, action.payload);
    if (response.success) yield put(medicalCreateSuccess(response.data));
    else yield put(medicalCreateFailure(response.message));
  } catch {
    yield put(medicalCreateFailure("메지컬 등록 실패"));
  }
}

function* updateMedicalSaga(action: PayloadAction<MedicalUpdatePayload>): SagaIterator {
  try {
    const { specialtyId, medicalReq } = action.payload;
    const response: ApiResponse<MedicalResponse> = yield call(updateMedicalApi, specialtyId, medicalReq);
    if (response.success) yield put(medicalUpdateSuccess(response.data));
    else yield put(medicalUpdateFailure(response.message));
  } catch {
    yield put(medicalUpdateFailure("메지컬 수정 실패"));
  }
}

function* deleteMedicalSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteMedicalApi, action.payload);
    if (response.success) yield put(medicalDeleteSuccess());
    else yield put(medicalDeleteFailure(response.message));
  } catch {
    yield put(medicalDeleteFailure("메지컬 삭제 실패"));
  }
}

export function* watchDoctorMedicalSaga(): SagaIterator {
  yield takeLatest(medicalListRequest.type, listMedicalSaga);
  yield takeLatest(medicalDetailRequest.type, detailMedicalSaga);
  yield takeLatest(medicalCreateRequest.type, createMedicalSaga);
  yield takeLatest(medicalUpdateRequest.type, updateMedicalSaga);
  yield takeLatest(medicalDeleteRequest.type, deleteMedicalSaga);
}

function* listSpecialtySaga(): SagaIterator {
  try {
    const response: ApiResponse<SpecialtyResponse[]> = yield call(fetchSpecialtyListApi);
    if (response.success) yield put(specialtyListSuccess(response.data));
    else yield put(specialtyListFailure(response.message));
  } catch {
    yield put(specialtyListFailure("스페셜티 목록 조회 실패"));
  }
}

function* detailSpecialtySaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<SpecialtyResponse> = yield call(fetchSpecialtyDetailApi, action.payload);
    if (response.success) yield put(specialtyDetailSuccess(response.data));
    else yield put(specialtyDetailFailure(response.message));
  } catch {
    yield put(specialtyDetailFailure("스페셜티 상세 조회 실패"));
  }
}

function* createSpecialtySaga(action: PayloadAction<SpecialtyCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<SpecialtyResponse> = yield call(createSpecialtyApi, action.payload);
    if (response.success) yield put(specialtyCreateSuccess(response.data));
    else yield put(specialtyCreateFailure(response.message));
  } catch {
    yield put(specialtyCreateFailure("스페셜티 등록 실패"));
  }
}

function* updateSpecialtySaga(action: PayloadAction<SpecialtyUpdatePayload>): SagaIterator {
  try {
    const { specialtyId, specialtyReq } = action.payload;
    const response: ApiResponse<SpecialtyResponse> = yield call(updateSpecialtyApi, specialtyId, specialtyReq);
    if (response.success) yield put(specialtyUpdateSuccess(response.data));
    else yield put(specialtyUpdateFailure(response.message));
  } catch {
    yield put(specialtyUpdateFailure("스페셜티 수정 실패"));
  }
}

function* deleteSpecialtySaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteSpecialtyApi, action.payload);
    if (response.success) yield put(specialtyDeleteSuccess());
    else yield put(specialtyDeleteFailure(response.message));
  } catch {
    yield put(specialtyDeleteFailure("스페셜티 삭제 실패"));
  }
}

export function* watchDoctorSpecialtySaga(): SagaIterator {
  yield takeLatest(specialtyListRequest.type, listSpecialtySaga);
  yield takeLatest(specialtyDetailRequest.type, detailSpecialtySaga);
  yield takeLatest(specialtyCreateRequest.type, createSpecialtySaga);
  yield takeLatest(specialtyUpdateRequest.type, updateSpecialtySaga);
  yield takeLatest(specialtyDeleteRequest.type, deleteSpecialtySaga);
}
