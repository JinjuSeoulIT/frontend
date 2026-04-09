"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function NewPatientRedirectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const name = searchParams.get("name") ?? "";
    const query = name ? `?open=registration&name=${encodeURIComponent(name)}` : "?open=registration";
    router.replace(`/patients${query}`);
  }, [router, searchParams]);

  return null;
}

export default function NewPatientRedirectPage() {
  return (
    <Suspense fallback={null}>
      <NewPatientRedirectPageContent />
    </Suspense>
  );
}
