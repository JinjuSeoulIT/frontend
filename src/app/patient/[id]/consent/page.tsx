"use client";

import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PatientConsentContent from "@/components/patient/detail/PatientConsentContent";

export default function PatientConsentsPage() {
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);

  return (
    <MainLayout>
      <PatientConsentContent patientId={patientId} />
    </MainLayout>
  );
}
