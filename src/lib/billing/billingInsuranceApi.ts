import axios from "axios";
import type { Insurance, InsuranceHistory } from "@/features/insurance/insuranceTypes";
import { BILLING_API_BASE_URL } from "@/lib/common/env";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T;
}

export interface InsuranceCalculationSummaryResponse {
  insuranceType: string | null;
  coverageRate: number;
  insuranceAppliedAmount: number;
  patientBurdenAmount: number;
  note: string;
}

export interface BillingInsuranceSummaryResponse {
  billId: number;
  patientId: number;
  originalAmount: number;
  calculatedAmount: number;
  validInsurance: Insurance | null;
  insuranceList: Insurance[];
  insuranceHistories: InsuranceHistory[];
  calculation: InsuranceCalculationSummaryResponse;
  insuranceError: string | null;
  insuranceHistoryError: string | null;
}

const baseURL = BILLING_API_BASE_URL.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
});

export const fetchBillingInsuranceSummaryApi = async (
  billId: number
): Promise<BillingInsuranceSummaryResponse> => {
  const res = await api.get<ApiResponse<BillingInsuranceSummaryResponse>>(
    `/api/billing/bills/${billId}/insurance-summary`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "보험 요약 조회 실패");
  }

  return res.data.result;
};
