import MainLayout from "@/components/layout/MainLayout";
import SpecialtyUpdate from "@/components/staff/doctorDashboard/MedicalSpecialty/SpecialtyUpdate";

export default function SpecialtyEditPage() {
  return (
    <MainLayout showSidebar={false}>
      <SpecialtyUpdate />
    </MainLayout>
  );
}
