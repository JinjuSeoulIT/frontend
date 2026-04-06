import MainLayout from "@/components/layout/MainLayout";
import MedicalDelete from "@/components/staff/doctorDashboard/MedicalSpecialty/medicalSpecialtyDelete";

export default function MedicalDeletePage() {
  return (
    <MainLayout showSidebar={false}>
      <MedicalDelete />
    </MainLayout>
  );
}
