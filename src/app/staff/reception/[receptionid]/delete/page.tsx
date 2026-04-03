import MainLayout from "@/components/layout/MainLayout";
import ReceptionDelete from "@/components/staff/receptionDashboard/reception/receptionDelete";

export default async function ReceptionDeletePage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  return (
    <MainLayout showSidebar={false}>
      <ReceptionDelete staffId={receptionid} open={true} onClose={() => {}} />
    </MainLayout>
  );
}
