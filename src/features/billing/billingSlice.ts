import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BillSummary,
  BillDetail,
  Payment,
  BillingStats,
  PaymentMethod,
  BillingClaimRequest,
  BillingClaimResult,
  BillHistory,
  CalculatedBill,
} from "@/lib/billing/billingApi";

interface FetchBillsByPatientPayload {
  patientId: number;
  status?: string;
}

interface FetchBillsByEncounterPayload {
  encounterId: number;
}

interface BillingState {
  billingList: BillSummary[];
  billingDetail: BillDetail | null;
  payments: Payment[];
  billHistory: BillHistory[];
  billingStats: BillingStats | null;
  calculatedBill: CalculatedBill | null;
  billingClaimResult: BillingClaimResult | null;
  loading: boolean;
  error: string | null;
  statsLoading: boolean;
  statsError: string | null;
}

const initialState: BillingState = {
  billingList: [],
  billingDetail: null,
  payments: [],
  billHistory: [],
  billingStats: null,
  calculatedBill: null,
  billingClaimResult: null,
  loading: false,
  error: null,
  statsLoading: false,
  statsError: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    fetchBillsByPatientRequest(
      state,
      action: PayloadAction<FetchBillsByPatientPayload>
    ) {
      state.loading = true;
      state.error = null;
    },

    fetchBillsByEncounterRequest(
      state,
      action: PayloadAction<FetchBillsByEncounterPayload>
    ) {
      state.loading = true;
      state.error = null;
    },

    fetchBillingDetailRequest(state, action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },

    fetchCalculatedBillRequest(state, action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },

    fetchBillHistoryRequest(state, action: PayloadAction<number>) {
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

    confirmBillRequest(state, action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },

    unconfirmBillRequest(state, action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },

    cancelBillRequest(state, action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },

    restoreBillRequest(state, action: PayloadAction<number>) {
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
      state.statsLoading = true;
      state.statsError = null;
    },

    fetchPaymentsByBillRequest(state, action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },

    // [수정] billingDate 추가
    fetchBillsRequest(
      state,
      action: PayloadAction<{
        status?: string | null;
        confirmedOnly?: boolean;
        partialOnly?: boolean;
        billingDate?: string | null;
      }>
    ) {
      state.loading = true;
      state.error = null;
    },

    createBillingClaimRequest(
      state,
      action: PayloadAction<BillingClaimRequest>
    ) {
      state.loading = true;
      state.error = null;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    setStatsLoading(state, action: PayloadAction<boolean>) {
      state.statsLoading = action.payload;
    },

    setStatsError(state, action: PayloadAction<string | null>) {
      state.statsError = action.payload;
    },

    setBillingList(state, action: PayloadAction<BillSummary[]>) {
      state.billingList = action.payload;
    },

    setBillingDetail(state, action: PayloadAction<BillDetail | null>) {
      state.billingDetail = action.payload;
    },

    setCalculatedBill(state, action: PayloadAction<CalculatedBill | null>) {
      state.calculatedBill = action.payload;
    },

    setBillHistory(state, action: PayloadAction<BillHistory[]>) {
      state.billHistory = action.payload;
    },

    setBillingStats(state, action: PayloadAction<BillingStats | null>) {
      state.billingStats = action.payload;
    },

    setPayments(state, action: PayloadAction<Payment[]>) {
      state.payments = action.payload;
    },

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
  fetchBillsByEncounterRequest,
  fetchBillingDetailRequest,
  fetchCalculatedBillRequest,
  fetchBillHistoryRequest,
  fetchOutstandingBillsRequest,
  createPaymentRequest,
  confirmBillRequest,
  unconfirmBillRequest,
  cancelBillRequest,
  restoreBillRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
  fetchBillingStatsRequest,
  fetchPaymentsByBillRequest,
  fetchBillsRequest,
  createBillingClaimRequest,
  setBillingStats,
  setLoading,
  setError,
  setStatsLoading,
  setStatsError,
  setBillingList,
  setBillingDetail,
  setCalculatedBill,
  setBillHistory,
  setPayments,
  setBillingClaimResult,
} = billingSlice.actions;

export default billingSlice.reducer;