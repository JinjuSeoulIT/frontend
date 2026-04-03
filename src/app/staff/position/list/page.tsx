import MainLayout from "@/components/layout/MainLayout";
import PositionList from "@/components/staff/BasiclnfoDashboard/position/PositionList";

export default function PositionListPage() {
  return (
    <MainLayout showSidebar={true}>
      <PositionList />
    </MainLayout>
  );
}
