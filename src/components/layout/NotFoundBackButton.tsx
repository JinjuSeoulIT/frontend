"use client";

import { useRouter } from "next/navigation";

export default function NotFoundBackButton() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={handleGoBack}
      style={{
        background: "#eef4fb",
        color: "#1f2a36",
        borderRadius: "10px",
        padding: "10px 14px",
        fontWeight: 700,
        border: "1px solid #dbe5f5",
        cursor: "pointer",
      }}
    >
      이전페이지로 이동
    </button>
  );
}
