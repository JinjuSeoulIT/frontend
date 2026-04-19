"use client";

import Link from "next/link";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #f3f6fb 0%, #e8eef7 100%)",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "640px",
          background: "#ffffff",
          border: "1px solid #dbe5f5",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(15, 32, 48, 0.08)",
          padding: "28px",
        }}
      >
        <p style={{ margin: 0, color: "#b42318", fontWeight: 700, fontSize: "13px" }}>
          Runtime Error
        </p>
        <h1 style={{ margin: "10px 0 8px", fontSize: "28px", color: "#1f2a36" }}>
          처리 중 문제가 발생했습니다.
        </h1>
        <p style={{ margin: 0, color: "#5a6b7b", lineHeight: 1.6 }}>
          잠시 후 다시 시도하거나, 같은 문제가 반복되면 관리자에게 문의해 주세요.
        </p>

        <details style={{ marginTop: "14px" }}>
          <summary style={{ cursor: "pointer", color: "#5a6b7b", fontWeight: 700 }}>
            오류 상세 보기
          </summary>
          <pre
            style={{
              marginTop: "10px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "12px",
              color: "#334155",
              fontSize: "12px",
            }}
          >
            {error?.message || "알 수 없는 오류"}
          </pre>
        </details>

        <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#0b5b8f",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#eef4fb",
              color: "#1f2a36",
              textDecoration: "none",
              borderRadius: "10px",
              padding: "10px 14px",
              fontWeight: 700,
              border: "1px solid #dbe5f5",
            }}
          >
            홈으로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
