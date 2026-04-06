import DoctorCreate from "@/components/staff/doctorDashboard/doctor/doctorCreate";
import MainLayout from "@/components/layout/MainLayout";

export default async function CreatePage() {
  return (
    <MainLayout showSidebar={false}>
      {/* ✅ create는 현재 doctorid를 직접 안 쓰므로 불필요한 props 전달 제거 */}
      <DoctorCreate />
    </MainLayout>
  );
}
