import MainLayout from "@/components/layout/MainLayout";
import ReceptionCreate from "@/components/staff/receptionDashboard/reception/receptionCreate";

export default function ReceptionCreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <ReceptionCreate />
    </MainLayout>
  );
}
