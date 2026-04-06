import MainLayout from "@/components/layout/MainLayout";
import SpecialtyDetail from "@/components/staff/doctorDashboard/MedicalSpecialty/SpecialtyDetail";

export default function SpecialtyDetailPage() {
  return (
    <MainLayout showSidebar={false}>
      <SpecialtyDetail />
    </MainLayout>
  );
}
