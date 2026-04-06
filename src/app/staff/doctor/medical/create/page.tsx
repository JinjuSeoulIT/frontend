import MainLayout from "@/components/layout/MainLayout";
import MedicalCreate from "@/components/staff/doctorDashboard/MedicalSpecialty/medicalCreate";

export default function CreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <MedicalCreate />
    </MainLayout>
  );
}
