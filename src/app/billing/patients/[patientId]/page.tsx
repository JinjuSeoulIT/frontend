"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import { fetchBillsByPatientRequest } from "@/features/billing/billingSlice";
import Link from "next/link";

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "READY":
      return "미수납";
    case "CONFIRMED":
      return "부분 수납";
    case "PAID":
      return "완납";
    case "CANCELED":
      return "취소됨";
    default:
      return status ?? "-";
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR");
};

const formatAmount = (amount?: number) => {
  if (typeof amount !== "number") return "-";
  return `${amount.toLocaleString()}원`;
};

export default function PatientBillingListPage() {
  const params = useParams<{ patientId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const patientId = Number(params.patientId);

  const { billingList, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (!patientId || Number.isNaN(patientId)) return;

    dispatch(fetchBillsByPatientRequest({ patientId, status }));
  }, [dispatch, patientId, status]);

  const sortedBillingList = useMemo(() => {
    return [...billingList].sort((a, b) => {
      const timeA = new Date(a.treatmentDate).getTime();
      const timeB = new Date(b.treatmentDate).getTime();

      if (Number.isNaN(timeA) || Number.isNaN(timeB)) {
        return b.billId - a.billId;
      }

      return timeB - timeA;
    });
  }, [billingList]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>환자 청구 목록</h2>

      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="billing-status-filter" style={{ marginRight: "8px" }}>
          상태 필터 :
        </label>
        <select
          id="billing-status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">전체</option>
          <option value="READY">미수납</option>
          <option value="CONFIRMED">부분 수납</option>
          <option value="PAID">완납</option>
        </select>
      </div>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && sortedBillingList.length === 0 && (
        <p>청구 내역이 없습니다.</p>
      )}

      <ul style={{ paddingLeft: "20px" }}>
        {sortedBillingList.map((bill) => (
          <li key={bill.billId} style={{ marginBottom: "10px" }}>
            <Link href={`/billing/${bill.billId}`}>
              청구번호: {bill.billingNo || bill.billId}
            </Link>
            {" | "}
            진료일: {formatDateTime(bill.treatmentDate)}
            {" | "}
            총금액: {formatAmount(bill.totalAmount)}
            {" | "}
            미수금: {formatAmount(bill.remainingAmount)}
            {" | "}
            상태: {getStatusLabel(bill.status)}
          </li>
        ))}
      </ul>
    </div>
  );
}