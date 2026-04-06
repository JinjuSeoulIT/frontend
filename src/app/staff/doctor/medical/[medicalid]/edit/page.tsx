import MainLayout from "@/components/layout/MainLayout";
import MedicalUpdate from "@/components/staff/doctorDashboard/MedicalSpecialty/medicalUpdate";

export default function MedicalEditPage() {
  return (
    <MainLayout showSidebar={false}>
      <MedicalUpdate />
    </MainLayout>
  );
}
