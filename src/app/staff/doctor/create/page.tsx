
import MainLayout from "@/components/layout/MainLayout";
import DoctorCreate from "@/components/staff/doctorDashboard/doctor/doctorCreate";
export default  function CreatePage() {


  return (
    <MainLayout showSidebar={false}>
      <DoctorCreate />
    </MainLayout>
  );
}