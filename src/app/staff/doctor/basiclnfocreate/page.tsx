
import MainLayout from "@/components/layout/MainLayout";
import DoctorBasiclnfoCreate from "@/components/staff/doctorDashboard/doctor/doctorBasiclnfoCreate"
export default  function basiclnfoCreatePage() {


  return (
    <MainLayout showSidebar={false}>
      <DoctorBasiclnfoCreate />
    </MainLayout>
  );
}