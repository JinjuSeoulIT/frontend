import MainLayout from "@/components/layout/MainLayout";
import { SpecialtyList } from "@/components/staff/doctorDashboard/MedicalSpecialty/medicalSpecialtyList";

export default function SpecialtyListPage() {
  return (
    <MainLayout showSidebar={false}>
      <SpecialtyList />
    </MainLayout>
  );
}
