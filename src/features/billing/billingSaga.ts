import { call, put, takeLatest } from "redux-saga/effects";
import toast from "react-hot-toast";

import {
  fetchBillsByPatientApi,
  fetchBillsByEncounterApi,
  fetchBillDetailApi,
  fetchCalculatedBillApi,
  fetchBillHistoryApi,
  fetchOutstandingBillsApi,
  createPaymentApi,
  cancelPaymentApi,
  fetchPaymentsByBillApi,
  fetchBillingStatsApi,
  refundPaymentApi,
  fetchBillsApi,
  confirmBillApi,
  unconfirmBillApi,
  cancelBillApi,
  restoreBillApi,
  createBillingClaimApi,
  BillingClaimRequest,
} from "@/lib/billing/billingApi";

import {
  fetchBillsByPatientRequest,
  fetchBillsByEncounterRequest,
  fetchBillingDetailRequest,
  fetchCalculatedBillRequest,
  fetchBillHistoryRequest,
  fetchOutstandingBillsRequest,
  createPaymentRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
  fetchBillingStatsRequest,
  fetchPaymentsByBillRequest,
  fetchBillsRequest,
  confirmBillRequest,
  unconfirmBillRequest,
  cancelBillRequest,
  restoreBillRequest,
  createBillingClaimRequest,
  setLoading,
  setError,
  setStatsLoading,
  setStatsError,
  setBillingList,
  setBillingDetail,
  setCalculatedBill,
  setBillHistory,
  setPayments,
  setBillingStats,
  setBillingClaimResult,
} from "./billingSlice";

import type { PayloadAction } from "@reduxjs/toolkit";

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

function* fetchBillsByEncounterSaga(
  action: PayloadAction<{ encounterId: number }>
): Generator<any, void, any> {
  try {
    const { encounterId } = action.payload;
    const data = yield call(fetchBillsByEncounterApi, encounterId);
    yield put(setBillingList(data));
  } catch (error: any) {
    yield put(setError(error.message || "내원 기준 청구 목록 조회 실패"));
    toast.error(error.message || "내원 기준 청구 목록 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

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

function* fetchCalculatedBillSaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;
    const data = yield call(fetchCalculatedBillApi, billId);
    yield put(setCalculatedBill(data));
  } catch (error: any) {
    yield put(setError(error.message || "자동 계산 조회 실패"));
    toast.error(error.message || "자동 계산 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchBillHistorySaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;
    const data = yield call(fetchBillHistoryApi, billId);
    yield put(setBillHistory(data));
  } catch (error: any) {
    yield put(setError(error.message || "청구 이력 조회 실패"));
    toast.error(error.message || "청구 이력 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

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
 * [수정] billingDate까지 전달
 */
function* fetchBillsSaga(
  action: PayloadAction<{
    status?: string | null;
    confirmedOnly?: boolean;
    partialOnly?: boolean;
    billingDate?: string | null;
  }>
): Generator<any, void, any> {
  try {
    const params = action.payload;
    const data = yield call(fetchBillsApi, params);
    yield put(setBillingList(data));
  } catch (error: any) {
    yield put(setError(error.message || "전체 청구 목록 조회 실패"));
    toast.error(error.message || "전체 청구 목록 조회 실패");
  } finally {
    yield put(setLoading(false));
  }
}

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

    yield put(fetchBillingDetailRequest(billId));
    yield put(fetchCalculatedBillRequest(billId));
    yield put(fetchBillHistoryRequest(billId));
    yield put(fetchPaymentsByBillRequest(billId));
    yield put(fetchBillsByPatientRequest({ patientId }));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "수납 실패"));
    toast.error(error.message || "수납 실패");
  } finally {
    yield put(setLoading(false));
  }
}

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

    yield put(fetchBillingDetailRequest(billId));
    yield put(fetchCalculatedBillRequest(billId));
    yield put(fetchBillHistoryRequest(billId));
    yield put(fetchPaymentsByBillRequest(billId));
    yield put(fetchBillsByPatientRequest({ patientId }));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "수납 취소 실패"));
    toast.error(error.message || "수납 취소 실패");
  } finally {
    yield put(setLoading(false));
  }
}

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

    yield put(fetchBillingDetailRequest(billId));
    yield put(fetchCalculatedBillRequest(billId));
    yield put(fetchBillHistoryRequest(billId));
    yield put(fetchPaymentsByBillRequest(billId));
    yield put(fetchBillsByPatientRequest({ patientId }));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "환불 실패"));
    toast.error(error.message || "환불 실패");
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchBillingStatsSaga(): Generator<any, void, any> {
  try {
    const data = yield call(fetchBillingStatsApi);
    yield put(setBillingStats(data));
  } catch (error: any) {
    yield put(setStatsError(error.message || "수납 통계 조회 실패"));
    toast.error(error.message || "수납 통계 조회 실패");
  } finally {
    yield put(setStatsLoading(false));
  }
}

function* confirmBillSaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;

    yield call(confirmBillApi, billId);

    toast.success("청구가 확정되었습니다.");

    yield put(fetchBillingDetailRequest(billId));
    yield put(fetchCalculatedBillRequest(billId));
    yield put(fetchBillHistoryRequest(billId));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "청구 확정 실패"));
    toast.error(error.message || "청구 확정 실패");
  } finally {
    yield put(setLoading(false));
  }
}

function* unconfirmBillSaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;

    yield call(unconfirmBillApi, billId);

    toast.success("청구 확정이 해제되었습니다.");

    yield put(fetchBillingDetailRequest(billId));
    yield put(fetchCalculatedBillRequest(billId));
    yield put(fetchBillHistoryRequest(billId));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "청구 확정 해제 실패"));
    toast.error(error.message || "청구 확정 해제 실패");
  } finally {
    yield put(setLoading(false));
  }
}

function* cancelBillSaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;

    yield call(cancelBillApi, billId);

    toast.success("청구가 취소되었습니다.");

    yield put(fetchBillingDetailRequest(billId));
    yield put(fetchCalculatedBillRequest(billId));
    yield put(fetchBillHistoryRequest(billId));
    yield put(fetchBillsRequest({ status: "CONFIRMED", confirmedOnly: true }));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "청구 취소 실패"));
    toast.error(error.message || "청구 취소 실패");
  } finally {
    yield put(setLoading(false));
  }
}

function* restoreBillSaga(
  action: PayloadAction<number>
): Generator<any, void, any> {
  try {
    const billId = action.payload;

    yield call(restoreBillApi, billId);

    toast.success("청구가 복원되었습니다.");

    yield put(fetchBillingDetailRequest(billId));
    yield put(fetchCalculatedBillRequest(billId));
    yield put(fetchBillHistoryRequest(billId));
    yield put(fetchBillsRequest({ status: "CONFIRMED", confirmedOnly: true }));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    yield put(setError(error.message || "청구 복원 실패"));
    toast.error(error.message || "청구 복원 실패");
  } finally {
    yield put(setLoading(false));
  }
}

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
  yield takeLatest(fetchBillsByEncounterRequest.type, fetchBillsByEncounterSaga);
  yield takeLatest(fetchBillingDetailRequest.type, fetchBillingDetailSaga);
  yield takeLatest(fetchCalculatedBillRequest.type, fetchCalculatedBillSaga);
  yield takeLatest(fetchBillHistoryRequest.type, fetchBillHistorySaga);
  yield takeLatest(fetchPaymentsByBillRequest.type, fetchPaymentsByBillSaga);
  yield takeLatest(fetchBillsRequest.type, fetchBillsSaga);
  yield takeLatest(fetchOutstandingBillsRequest.type, fetchOutstandingBillsSaga);
  yield takeLatest(createPaymentRequest.type, createPaymentSaga);
  yield takeLatest(cancelPaymentRequest.type, cancelPaymentSaga);
  yield takeLatest(refundPaymentRequest.type, refundPaymentSaga);
  yield takeLatest(fetchBillingStatsRequest.type, fetchBillingStatsSaga);
  yield takeLatest(confirmBillRequest.type, confirmBillSaga);
  yield takeLatest(unconfirmBillRequest.type, unconfirmBillSaga);
  yield takeLatest(cancelBillRequest.type, cancelBillSaga);
  yield takeLatest(restoreBillRequest.type, restoreBillSaga);
  yield takeLatest(createBillingClaimRequest.type, createBillingClaimSaga);
}