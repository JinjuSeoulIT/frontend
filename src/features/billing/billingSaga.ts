import { call, put, takeLatest } from "redux-saga/effects";
import toast from "react-hot-toast";

import {
  fetchBillsByPatientApi,
  fetchBillDetailApi,
  fetchOutstandingBillsApi,
  createPaymentApi,
  cancelPaymentApi,
  fetchPaymentsByBillApi,
  fetchBillingStatsApi,
  refundPaymentApi,
  fetchBillsApi,
  confirmBillApi,
  createBillingClaimApi,
  BillingClaimRequest,
} from "@/lib/billing/billingApi";

import {
  fetchBillsByPatientRequest,
  fetchBillingDetailRequest,
  fetchOutstandingBillsRequest,
  createPaymentRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
  fetchBillingStatsRequest,
  fetchPaymentsByBillRequest,
  fetchBillsRequest,
  confirmBillRequest,
  createBillingClaimRequest,
  setLoading,
  setError,
  setBillingList,
  setBillingDetail,
  setPayments,
  setBillingStats,
  setBillingClaimResult,
} from "./billingSlice";

import type { PayloadAction } from "@reduxjs/toolkit";

/**
 * 환자 기준 청구 목록 조회
 */
function* fetchBillsByPatientSaga(
  action: PayloadAction<{ patientId: number; status?: string }>
): Generator<any, void, any> {
  try {
    const { patientId, status } = action.payload;
    const data = yield call(fetchBillsByPatientApi, patientId, status);
    yield put(setBillingList(data));
  } catch (error: any) {
    yield put(setError(error.message || "환자 기준 청구 목록 조회 실패"));
    toast.error(error.message || "환자 기준 청구 목록 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 전체 청구 목록 조회
 */
function* fetchBillsSaga(
  action: PayloadAction<string | null>
): Generator<any, void, any> {
  try {
    const status = action.payload;
    const data = yield call(fetchBillsApi, status);
    yield put(setBillingList(data));
  } catch (error: any) {
    yield put(setError(error.message || "전체 청구 목록 조회 실패"));
    toast.error(error.message || "전체 청구 목록 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 청구 상세 조회
 */
function* fetchBillingDetailSaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;
    const data = yield call(fetchBillDetailApi, billId);
    yield put(setBillingDetail(data));
  } catch (error: any) {
    yield put(setError(error.message || "청구 상세 조회 실패"));
    toast.error(error.message || "청구 상세 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 청구 기준 결제 이력 조회
 */
function* fetchPaymentsByBillSaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;
    const data = yield call(fetchPaymentsByBillApi, billId);
    yield put(setPayments(data));
  } catch (error: any) {
    yield put(setError(error.message || "결제 내역 조회 실패"));
    toast.error(error.message || "결제 내역 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 미수금 조회
 */
function* fetchOutstandingBillsSaga(): Generator<any, void, any> {
  try {
    const data = yield call(fetchOutstandingBillsApi);
    yield put(setBillingList(data));
  } catch (error: any) {
    yield put(setError(error.message || "미수금 조회 실패"));
    toast.error(error.message || "미수금 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 수납 생성
 */
function* createPaymentSaga(
  action: PayloadAction<{
    billId: number;
    amount: number;
    patientId: number;
    method: "CASH" | "CARD" | "TRANSFER";
  }>
): Generator<any, void, any> {
  try {
    const { billId, amount, patientId, method } = action.payload;

    yield call(createPaymentApi, billId, amount, method);

    toast.success("수납이 완료되었습니다.");

    // 상세 재조회
    yield put(fetchBillingDetailRequest(billId));

    // 결제 이력 재조회
    yield put(fetchPaymentsByBillRequest(billId));

    // 환자 기준 목록 재조회
    yield put(fetchBillsByPatientRequest({ patientId }));

    // 전체 통계 재조회
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "수납 실패"));
    toast.error(error.message || "수납 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 수납 취소
 */
function* cancelPaymentSaga(
  action: PayloadAction<{
    paymentId: number;
    billId: number;
    patientId: number;
  }>
): Generator<any, void, any> {
  try {
    const { paymentId, billId, patientId } = action.payload;

    yield call(cancelPaymentApi, paymentId);

    toast.success("수납 취소가 완료되었습니다.");

    // 상세 재조회
    yield put(fetchBillingDetailRequest(billId));

    // 결제 이력 재조회
    yield put(fetchPaymentsByBillRequest(billId));

    // 환자 기준 목록 재조회
    yield put(fetchBillsByPatientRequest({ patientId }));

    // 전체 통계 재조회
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "수납 취소 실패"));
    toast.error(error.message || "수납 취소 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 부분 환불
 */
function* refundPaymentSaga(
  action: PayloadAction<{
    paymentId: number;
    amount: number;
    billId: number;
    patientId: number;
  }>
): Generator<any, void, any> {
  try {
    const { paymentId, amount, billId, patientId } = action.payload;

    yield call(refundPaymentApi, paymentId, amount);

    toast.success("환불이 완료되었습니다.");

    // 상세 재조회
    yield put(fetchBillingDetailRequest(billId));

    // 결제 이력 재조회
    yield put(fetchPaymentsByBillRequest(billId));

    // 환자 기준 목록 재조회
    yield put(fetchBillsByPatientRequest({ patientId }));

    // 전체 통계 재조회
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "환불 실패"));
    toast.error(error.message || "환불 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 수납 통계 조회
 */
function* fetchBillingStatsSaga(): Generator<any, void, any> {
  try {
    const data = yield call(fetchBillingStatsApi);
    yield put(setBillingStats(data));
  } catch (error: any) {
    yield put(setError(error.message || "수납 통계 조회 실패"));
    toast.error(error.message || "수납 통계 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

/**
 * 청구 확정
 */
function* confirmBillSaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;

    yield call(confirmBillApi, billId);

    toast.success("청구가 확정되었습니다.");

    // 상세 재조회
    yield put(fetchBillingDetailRequest(billId));

    // 전체 통계 재조회
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "청구 확정 실패"));
    toast.error(error.message || "청구 확정 실패");
  } finally {
    yield put(setLoading(false));
  }
}

//claims 생성 saga

function* createBillingClaimSaga(
  action: PayloadAction<BillingClaimRequest>
): Generator<any, void, any> {
  try {
    const payload = action.payload;

    const result = yield call(createBillingClaimApi, payload);

    yield put(setBillingClaimResult(result));

    if (result.alreadyProcessed) {
      toast.success("이미 처리된 청구 요청입니다.");
    } else {
      toast.success("청구 생성 요청이 정상적으로 접수되었습니다.");
    }

    // 통계 재조회
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "청구 생성 요청 실패"));
    toast.error(error.message || "청구 생성 요청 실패");
  } finally {
    yield put(setLoading(false));
  }
}

export default function* billingSaga(): Generator<any, void, any> {
  yield takeLatest(fetchBillsByPatientRequest.type, fetchBillsByPatientSaga);
  yield takeLatest(fetchBillsRequest.type, fetchBillsSaga);
  yield takeLatest(fetchBillingDetailRequest.type, fetchBillingDetailSaga);
  yield takeLatest(fetchPaymentsByBillRequest.type, fetchPaymentsByBillSaga);
  yield takeLatest(fetchOutstandingBillsRequest.type, fetchOutstandingBillsSaga);
  yield takeLatest(createPaymentRequest.type, createPaymentSaga);
  yield takeLatest(cancelPaymentRequest.type, cancelPaymentSaga);
  yield takeLatest(refundPaymentRequest.type, refundPaymentSaga);
  yield takeLatest(fetchBillingStatsRequest.type, fetchBillingStatsSaga);
  yield takeLatest(confirmBillRequest.type, confirmBillSaga);
  yield takeLatest(createBillingClaimRequest.type, createBillingClaimSaga);
}