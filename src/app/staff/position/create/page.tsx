import MainLayout from "@/components/layout/MainLayout";
import PositionCreate from "@/components/staff/BasiclnfoDashboard/position/PositionCreate";

export default function PositionCreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <PositionCreate />
    </MainLayout>
  );
}
