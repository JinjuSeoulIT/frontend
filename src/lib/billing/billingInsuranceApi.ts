import axios from "axios";
import type { Insurance, InsuranceHistory } from "@/features/insurance/insuranceTypes";

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

const baseURL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? `http://${window.location.hostname}:8081`
    : "http://192.168.1.68:8081";

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
