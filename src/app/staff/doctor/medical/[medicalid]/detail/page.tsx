import MainLayout from "@/components/layout/MainLayout";
import MedicalDetail from "@/components/staff/doctorDashboard/MedicalSpecialty/medicalDetail";

export default function MedicalDetailPage() {
  return (
    <MainLayout showSidebar={false}>
      <MedicalDetail />
    </MainLayout>
  );
}
