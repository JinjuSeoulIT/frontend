"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T | null;
}

interface TossApproveResponse {
  paymentKey: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
}

interface TossPaymentContext {
  billId: number;
  patientId: number;
  requestedAmount: number;
  orderId: string;
}

export default function TossSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRequestedRef = useRef(false);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [loading, setLoading] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [message, setMessage] = useState(
    "성공 URL 파라미터를 확인하고 있습니다."
  );
  const [approveResult, setApproveResult] =
    useState<TossApproveResponse | null>(null);
  const [paymentContext, setPaymentContext] =
    useState<TossPaymentContext | null>(null);

  const isValid = useMemo(() => {
    return Boolean(paymentKey && orderId && amount);
  }, [paymentKey, orderId, amount]);

  /* orderId에서 billId 추출 */
  const parsedBillIdFromOrderId = useMemo(() => {
    if (!orderId) return null;

    const parts = orderId.split("-");
    if (parts.length < 2) return null;

    const maybeBillId = Number(parts[1]);
    if (Number.isNaN(maybeBillId) || maybeBillId <= 0) return null;

    return maybeBillId;
  }, [orderId]);

  /* sessionStorage 우선, 없으면 orderId 파싱값 사용 */
  const resolvedBillId = useMemo(() => {
    if (paymentContext?.billId != null) {
      return paymentContext.billId;
    }

    return parsedBillIdFromOrderId;
  }, [paymentContext?.billId, parsedBillIdFromOrderId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = sessionStorage.getItem("tossPaymentContext");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as TossPaymentContext;
      setPaymentContext(parsed);
    } catch (error) {
      console.error("[toss] sessionStorage parse error", error);
    }
  }, []);

  useEffect(() => {
    if (!isValid) {
      setMessage("성공 URL 파라미터 중 일부가 비어 있습니다.");
      return;
    }

    if (resolvedBillId == null) {
      setMessage("billId를 확인할 수 없습니다. 수납 상세로 돌아가 다시 시도해주세요.");
      return;
    }

    if (hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;

    const approvePayment = async () => {
      setLoading(true);

      try {
        const amountNumber = Number(amount);

        if (Number.isNaN(amountNumber) || amountNumber <= 0) {
          setApproveSuccess(false);
          setMessage("amount 값이 올바르지 않습니다.");
          return;
        }

        const baseUrl =
          typeof window !== "undefined" &&
          window.location.hostname !== "localhost"
            ? `http://${window.location.hostname}:8081`
            : "http://192.168.1.68:8081";

        const response = await fetch(`${baseUrl}/api/billing/toss/approve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: amountNumber,
            billId: resolvedBillId,
          }),
        });

        const data: ApiResponse<TossApproveResponse> = await response.json();

        if (!response.ok || !data.success) {
          setApproveSuccess(false);
          setMessage(data.message ?? "토스 결제 승인에 실패했습니다.");
          return;
        }

        setApproveResult(data.result);
        setApproveSuccess(true);
        setMessage(
          data.message ??
            "토스 결제 승인 및 billing 수납 반영이 완료되었습니다."
        );

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("tossPaymentContext");
        }
      } catch (error) {
        console.error("[toss] approve api error", error);
        setApproveSuccess(false);
        setMessage("백엔드 승인 API 호출 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    approvePayment();
  }, [isValid, paymentKey, orderId, amount, resolvedBillId]);

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
          토스 결제 성공 페이지
        </h1>

        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            color: "#374151",
            lineHeight: 1.6,
          }}
        >
          현재 단계는 <strong>토스 결제 승인 완료 후 billing 수납 DB까지 반영</strong>
          하는 단계입니다.
          <br />
          승인 결과가 정상 처리되면 수납 상세 화면에서 결제 내역, 환불 내역,
          남은 금액, 상태 변경 결과까지 확인할 수 있습니다.
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
            <strong>paymentKey:</strong>{" "}
            <span>{paymentKey ?? "값 없음"}</span>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong>orderId:</strong>{" "}
            <span>{orderId ?? "값 없음"}</span>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong>amount:</strong>{" "}
            <span>{amount ?? "값 없음"}</span>
          </div>

          <div>
            <strong>billId(sessionStorage / orderId 기준):</strong>{" "}
            <span>{resolvedBillId ?? "값 없음"}</span>
          </div>
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: loading
              ? "#eff6ff"
              : approveSuccess
              ? "#ecfdf5"
              : "#fef2f2",
            color: loading
              ? "#1d4ed8"
              : approveSuccess
              ? "#065f46"
              : "#991b1b",
            border: loading
              ? "1px solid #bfdbfe"
              : approveSuccess
              ? "1px solid #a7f3d0"
              : "1px solid #fecaca",
          }}
        >
          {loading ? "백엔드 승인 API를 호출 중입니다..." : message}
        </div>

        {approveResult && (
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
              <strong>승인 결과 paymentKey:</strong>{" "}
              <span>{approveResult.paymentKey}</span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>승인 결과 orderId:</strong>{" "}
              <span>{approveResult.orderId}</span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>승인 결과 amount:</strong>{" "}
              <span>{approveResult.amount}</span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>승인 결과 status:</strong>{" "}
              <span>{approveResult.status}</span>
            </div>

            <div>
              <strong>승인 결과 method:</strong>{" "}
              <span>{approveResult.method}</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={moveToBillingDetail}
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
            수납 상세로 이동
          </button>

          <button
            type="button"
            onClick={() => router.push("/billing")}
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
            billing 목록으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}