import MainLayout from "@/components/layout/MainLayout";
import PositionUpdate from "@/components/staff/BasiclnfoDashboard/position/PositionUpdate";

export default async function PositionEditPage({ params }: { params: Promise<{ positionid: string }> }) {
  const { positionid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <PositionUpdate positionId={positionid} />
    </MainLayout>
  );
}
