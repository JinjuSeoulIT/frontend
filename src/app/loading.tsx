export default function AppLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #f3f6fb 0%, #e8eef7 100%)",
      }}
    >
      <section
        style={{
          textAlign: "center",
          background: "#ffffff",
          border: "1px solid #dbe5f5",
          borderRadius: "16px",
          padding: "24px 28px",
          boxShadow: "0 10px 30px rgba(15, 32, 48, 0.08)",
          minWidth: "240px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            margin: "0 auto 10px",
            borderRadius: "50%",
            border: "3px solid #dbe5f5",
            borderTopColor: "#0b5b8f",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p style={{ margin: 0, fontWeight: 700, color: "#1f2a36" }}>페이지를 불러오는 중입니다...</p>
      </section>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
