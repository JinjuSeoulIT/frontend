export type BillStatus = "READY" | "CONFIRMED" | "PAID" | "CANCELED";

export const getBillingStatusLabel = (status: string, remainingAmount?: number) => {
  switch (status) {
    case "READY":
      return "미수납";
    case "CONFIRMED":
      return remainingAmount === 0 ? "청구 확정" : "부분 수납";
    case "PAID":
      return "완납";
    case "CANCELED":
      return "취소됨";
    default:
      return status;
  }
};

export const getBillingStatusDescription = (status: string, remainingAmount?: number) => {
  switch (status) {
    case "READY":
      return "미수납 상태";
    case "CONFIRMED":
      return remainingAmount === 0 ? "완납 후 청구 확정 상태" : "부분 수납 상태";
    case "PAID":
      return "완납 상태";
    case "CANCELED":
      return "취소됨 상태";
    default:
      return `${status} 상태`;
  }
};

export const getBillingStatusColor = (status: string, remainingAmount?: number) => {
  switch (status) {
    case "READY":
      return "default";
    case "CONFIRMED":
      return remainingAmount === 0 ? "info" : "warning";
    case "PAID":
      return "success";
    case "CANCELED":
      return "error";
    default:
      return "default";
  }
};

/* ================================
   상세 화면용 수납 상태 라벨
   금액 기준으로 표시용 상태 계산
================================ */
export const getDisplayBillingStatusLabel = (
  paidAmount: number,
  remainingAmount: number,
  status: string
) => {
  if (status === "CANCELED") return "취소됨";
  if (status === "CONFIRMED" && remainingAmount === 0) return "청구 확정";
  if (remainingAmount === 0) return "완납";
  if (paidAmount > 0 && remainingAmount > 0) return "부분 수납";
  return "미수납";
};

/* ================================
   상세 화면용 수납 상태 색상
================================ */
export const getDisplayBillingStatusColor = (
  paidAmount: number,
  remainingAmount: number,
  status: string
) => {
  if (status === "CANCELED") return "error";
  if (status === "CONFIRMED" && remainingAmount === 0) return "info";
  if (remainingAmount === 0) return "success";
  if (paidAmount > 0 && remainingAmount > 0) return "warning";
  return "default";
};