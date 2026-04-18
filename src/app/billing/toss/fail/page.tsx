"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TossPaymentContext {
  billId: number;
  patientId: number;
  requestedAmount: number;
  orderId: string;
  returnTo?: string;
  returnLabel?: string;
}

function TossFailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");
  const [paymentContext, setPaymentContext] = useState<TossPaymentContext | null>(
    null
  );

  const hasErrorInfo = useMemo(() => {
    return Boolean(code || message || orderId);
  }, [code, message, orderId]);

  const parsedBillIdFromOrderId = useMemo(() => {
    if (!orderId) return null;

    const parts = orderId.split("-");
    if (parts.length < 2) return null;

    const maybeBillId = Number(parts[1]);
    if (Number.isNaN(maybeBillId) || maybeBillId <= 0) return null;

    return maybeBillId;
  }, [orderId]);

  const resolvedBillId = paymentContext?.billId ?? parsedBillIdFromOrderId;
  const returnTo = paymentContext?.returnTo;
  const returnLabel = paymentContext?.returnLabel ?? "이전 화면";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = sessionStorage.getItem("tossPaymentContext");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as TossPaymentContext;
      setPaymentContext(parsed);
    } catch (error) {
      console.error("[toss] sessionStorage parse error", error);
    } finally {
      sessionStorage.removeItem("tossPaymentContext");
    }
  }, []);

  const moveToPreferredPage = () => {
    if (returnTo) {
      router.push(returnTo);
      return;
    }

    if (resolvedBillId == null) {
      router.push("/billing");
      return;
    }

    router.push(`/billing/${resolvedBillId}`);
  };

  const moveToBillingDetail = () => {
    if (resolvedBillId == null) {
      router.push("/billing");
      return;
    }

    router.push(`/billing/${resolvedBillId}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            margin: "0 0 16px 0",
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          토스 결제 실패 페이지
        </h1>

        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            color: "#374151",
            lineHeight: 1.6,
          }}
        >
          현재 단계는 <strong>토스 결제가 승인되지 않아 실패 페이지로 이동한 상태</strong>
          입니다.
          <br />
          실패한 결제는 billing 수납 DB에 반영되지 않으며, 이전 화면으로 돌아가 다시 시도할 수 있습니다.
        </p>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "#f9fafb",
            marginBottom: "24px",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <strong>code:</strong> <span>{code ?? "값 없음"}</span>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong>message:</strong> <span>{message ?? "값 없음"}</span>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong>orderId:</strong> <span>{orderId ?? "값 없음"}</span>
          </div>

          <div>
            <strong>billId:</strong> <span>{resolvedBillId ?? "값 없음"}</span>
          </div>
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: hasErrorInfo ? "#fef2f2" : "#fff7ed",
            color: hasErrorInfo ? "#991b1b" : "#9a3412",
            border: hasErrorInfo
              ? "1px solid #fecaca"
              : "1px solid #fdba74",
          }}
        >
          {hasErrorInfo
            ? "결제 실패 정보가 확인되었습니다. billing DB에는 반영되지 않았습니다."
            : "실패 URL 정보가 아직 없습니다. 이전 화면으로 돌아가 다시 시도해주세요."}
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={moveToPreferredPage}
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            {returnLabel}로 이동
          </button>

          <button
            type="button"
            onClick={moveToBillingDetail}
            style={{
              padding: "12px 18px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              color: "#111827",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            수납 상세로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TossFailPage() {
  return (
    <Suspense fallback={null}>
      <TossFailPageContent />
    </Suspense>
  );
}
