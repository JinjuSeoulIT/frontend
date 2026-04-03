import MainLayout from "@/components/layout/MainLayout";
import MedicalSpecialtyList from "@/components/staff/doctorDashboard/MedicalSpecialty/medicalSpecialtyList";

export default function MedicalPage() {
  return (
    <MainLayout showSidebar={false}>
      <MedicalSpecialtyList />
    </MainLayout>
  );
}
