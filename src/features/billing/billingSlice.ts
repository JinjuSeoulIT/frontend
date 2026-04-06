import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BillSummary,
  BillDetail,
  Payment,
  BillingStats,
  PaymentMethod,
  BillingClaimRequest,
  BillingClaimResult,
} from "@/lib/billing/billingApi";

// 상태 필터 payload 타입
interface FetchBillsByPatientPayload {
  patientId: number;
  status?: string;
}

interface BillingState {
  billingList: BillSummary[];
  billingDetail: BillDetail | null;
  payments: Payment[];
  billingStats: BillingStats | null;

  //claims 생성 결과 상태

  billingClaimResult: BillingClaimResult | null;

  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  billingList: [],
  billingDetail: null,
  payments: [],
  billingStats: null,

  billingClaimResult: null,  //claims 생성 결과 초기값

  loading: false,
  error: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {

    // Saga 요청 트리거 액션
    fetchBillsByPatientRequest(
      state,
      action: PayloadAction<FetchBillsByPatientPayload>
    ) {
      state.loading = true;
      state.error = null;
    },

    fetchBillingDetailRequest(
      state,
      action: PayloadAction<number>
    ) {
      state.loading = true;
      state.error = null;
    },

    fetchOutstandingBillsRequest(state) {
      state.loading = true;
      state.error = null;
    },

    createPaymentRequest(
      state,
      action: PayloadAction<{
        billId: number;
        amount: number;
        patientId: number;
        method: PaymentMethod;
      }>
    ) {
      state.loading = true;
      state.error = null;
    },

    confirmBillRequest(
      state,
      action: PayloadAction<number>
    ) {
      state.loading = true;
      state.error = null;
    },

    cancelPaymentRequest(
      state,
      action: PayloadAction<{
        paymentId: number;
        billId: number;
        patientId: number;
      }>
    ) {
      state.loading = true;
      state.error = null;
    },

    // 환불 요청
    refundPaymentRequest(
      state,
      action: PayloadAction<{
        paymentId: number;
        amount: number;
        billId: number;
        patientId: number;
      }>
    ) {
      state.loading = true;
      state.error = null;
    },

    fetchBillingStatsRequest(state) {
      state.loading = true;
      state.error = null;
    },

    fetchPaymentsByBillRequest(
      state,
      action: PayloadAction<number>
    ) {
      state.loading = true;
      state.error = null;
    },

    fetchBillsRequest(
      state,
      action: PayloadAction<string | null>
    ) {
      state.loading = true;
      state.error = null;
    },

    //claims 생성 요청 액션
    createBillingClaimRequest(
      state,
      action: PayloadAction<BillingClaimRequest>
    ) {
      state.loading = true;
      state.error = null;
    },

    // 공통 상태 변경
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    // 데이터 저장
    setBillingList(
      state,
      action: PayloadAction<BillSummary[]>
    ) {
      state.billingList = action.payload;
    },

    setBillingDetail(
      state,
      action: PayloadAction<BillDetail | null>
    ) {
      state.billingDetail = action.payload;
    },

    setBillingStats(
      state,
      action: PayloadAction<BillingStats | null>
    ) {
      state.billingStats = action.payload;
    },

    setPayments(
      state,
      action: PayloadAction<Payment[]>
    ) {
      state.payments = action.payload;
    },

    // claims 생성 결과 저장
    setBillingClaimResult(
      state,
      action: PayloadAction<BillingClaimResult | null>
    ) {
      state.billingClaimResult = action.payload;
    },
  },
});

export const {
  fetchBillsByPatientRequest,
  fetchBillingDetailRequest,
  fetchOutstandingBillsRequest,
  createPaymentRequest,
  confirmBillRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
  fetchBillingStatsRequest,
  fetchPaymentsByBillRequest,
  fetchBillsRequest,

  createBillingClaimRequest,

  setBillingStats,
  setLoading,
  setError,
  setBillingList,
  setBillingDetail,
  setPayments,

  setBillingClaimResult,
} = billingSlice.actions;

export default billingSlice.reducer;