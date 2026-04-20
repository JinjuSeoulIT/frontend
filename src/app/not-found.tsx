import Link from "next/link";
import NotFoundBackButton from "@/components/layout/NotFoundBackButton";

export default function NotFoundPage() {
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
          maxWidth: "560px",
          background: "#ffffff",
          border: "1px solid #dbe5f5",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(15, 32, 48, 0.08)",
          padding: "28px",
        }}
      >
        <p style={{ margin: 0, color: "#0b5b8f", fontWeight: 700, fontSize: "13px" }}>
          404 Not Found
        </p>
        <h1 style={{ margin: "10px 0 8px", fontSize: "28px", color: "#1f2a36" }}>
          요청하신 페이지를 찾을 수 없습니다.
        </h1>
        <p style={{ margin: 0, color: "#5a6b7b", lineHeight: 1.6 }}>
          주소가 변경되었거나 삭제되었을 수 있습니다. 아래 버튼으로 홈 또는 이전 페이지로 이동해
          주세요.
        </p>

        <div style={{ display: "flex", gap: "10px", marginTop: "22px", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#0b5b8f",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "10px",
              padding: "10px 14px",
              fontWeight: 700,
            }}
          >
            홈으로 이동
          </Link>
          <NotFoundBackButton />
        </div>
      </section>
    </main>
  );
}
