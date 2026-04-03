"use client";

import dynamic from "next/dynamic";

const Clinical = dynamic(() => import("@/components/clinical/Clinical"), {
  ssr: false,
});

export default function ClinicalPage() {
  return <Clinical />;
}
