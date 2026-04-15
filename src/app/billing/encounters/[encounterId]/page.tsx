"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/rootReducer";
import { fetchBillsByEncounterRequest } from "@/features/billing/billingSlice";
import Link from "next/link";

export default function EncounterBillingListPage() {
  const params = useParams<{ encounterId: string }>();
  const dispatch = useDispatch();

  const encounterId = Number(params.encounterId);

  const { billingList, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  useEffect(() => {
    if (encounterId) {
      dispatch(fetchBillsByEncounterRequest({ encounterId }));
    }
  }, [dispatch, encounterId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>내원 기준 청구 목록</h2>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {billingList.map((bill) => (
          <li key={bill.billId}>
            <Link href={`/billing/${bill.billId}`}>
              청구번호: {bill.billId}
            </Link>
            {" | "}
            진료일: {bill.treatmentDate}
            {" | "}
            총금액: {bill.totalAmount}
            {" | "}
            상태: {bill.status}
          </li>
        ))}
      </ul>
    </div>
  );
}