"use client";

import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PatientInsuranceContent from "@/components/patient/detail/PatientInsuranceContent";

export default function PatientInsurancesPage() {
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);

  return (
    <MainLayout>
      <PatientInsuranceContent patientId={patientId} />
    </MainLayout>
  );
}
