import MainLayout from "@/components/layout/MainLayout";
import PositionDetail from "@/components/staff/BasiclnfoDashboard/position/PositionDetail";

export default async function PositionDetailPage({ params }: { params: Promise<{ positionid: string }> }) {
  const { positionid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <PositionDetail positionId={positionid} />
    </MainLayout>
  );
}
