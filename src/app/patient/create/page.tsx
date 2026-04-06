"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function NewPatientRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const name = searchParams.get("name") ?? "";
    const query = name ? `?open=registration&name=${encodeURIComponent(name)}` : "?open=registration";
    router.replace(`/patients${query}`);
  }, [router, searchParams]);

  return null;
}
