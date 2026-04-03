import MainLayout from "@/components/layout/MainLayout";
import SpecialtyCreate from "@/components/staff/doctorDashboard/MedicalSpecialty/SpecialtyCreate";

export default function SpecialtyCreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <SpecialtyCreate />
    </MainLayout>
  );
}
