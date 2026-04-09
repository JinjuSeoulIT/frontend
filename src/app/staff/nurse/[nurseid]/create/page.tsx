import NurseCreate from "@/components/staff/nurseDashboard/nurse/nurseCreate";
import MainLayout from "@/components/layout/MainLayout";

export default function CreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <NurseCreate />
    </MainLayout>
  );
}
