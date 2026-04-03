"use client";

import type { Insurance } from "@/features/insurance/insuranceTypes";

export type InsuranceFormState = {
  insuranceType: string;
  policyNo: string;
  startDate: string;
  endDate: string;
  note: string;
  activeYn: boolean;
  verifiedYn: boolean;
};

export function insuranceTypeLabel(type?: string) {
  if (!type) return "-";
  switch (type) {
    case "NHI":
      return "건강보험";
    case "MED":
      return "의료급여";
    case "AUTO":
      return "자동차";
    case "IND":
      return "산재";
    case "SELF":
      return "자부담";
    default:
      return type;
  }
}

export function toOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export function isValidInsurance(item: Insurance) {
  if (!item.activeYn) return false;
  const today = new Date().toISOString().slice(0, 10);
  const startOk = !item.startDate || item.startDate <= today;
  const endOk = !item.endDate || item.endDate >= today;
  return startOk && endOk;
}

