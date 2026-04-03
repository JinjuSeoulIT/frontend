import MainLayout from "@/components/layout/MainLayout";
import NurseBasiclnfoCreate from "@/components/staff/nurseDashboard/nurse/nurseBasiclnfoCreate";

export default function BasiclnfoCreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <NurseBasiclnfoCreate />
    </MainLayout>
  );
}
