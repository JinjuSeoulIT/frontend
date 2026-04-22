import { Suspense } from "react";
import { ClinicalTestResultDetailChrome } from "@/components/clinical/ClinicalTestResultDetailChrome";

const TestResultDetailPage = () => {
  return (
    <main>
      <Suspense
        fallback={
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 16px", color: "#666" }}>
            로딩 중…
          </div>
        }
      >
        <ClinicalTestResultDetailChrome />
      </Suspense>
    </main>
  );
};

export default TestResultDetailPage;
