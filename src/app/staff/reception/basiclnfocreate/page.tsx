import MainLayout from "@/components/layout/MainLayout";
import ReceptionBasiclnfoCreate from "@/components/staff/receptionDashboard/reception/receptionBasiclnfoCreate";

export default function BasiclnfoCreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <ReceptionBasiclnfoCreate />
    </MainLayout>
  );
}
