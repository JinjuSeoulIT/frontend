import MainLayout from "@/components/layout/MainLayout";
import DoctorMedicalSpecialtyHub from "@/components/staff/doctorDashboard/DoctorMedicalSpecialtyHub";

export default function Page() {
  return (
    <MainLayout showSidebar={false}>
      <DoctorMedicalSpecialtyHub />
    </MainLayout>
  );
}
