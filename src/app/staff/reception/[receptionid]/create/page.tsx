import MainLayout from "@/components/layout/MainLayout";
import ReceptionCreate from "@/components/staff/receptionDashboard/reception/receptionCreate";

export default async function ReceptionCreatePage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  return (
    <MainLayout showSidebar={false}>
      <ReceptionCreate staffId={receptionid} />
    </MainLayout>
  );
}
