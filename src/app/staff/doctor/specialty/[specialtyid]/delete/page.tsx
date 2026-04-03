import MainLayout from "@/components/layout/MainLayout";
import { SpecialtyDelete } from "@/components/staff/doctorDashboard/MedicalSpecialty/medicalSpecialtyDelete";

export default function SpecialtyDeletePage() {
  return (
    <MainLayout showSidebar={false}>
      <SpecialtyDelete />
    </MainLayout>
  );
}
