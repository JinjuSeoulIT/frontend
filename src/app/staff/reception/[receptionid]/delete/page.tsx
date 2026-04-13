import MainLayout from "@/components/layout/MainLayout";
import ReceptionDelete from "@/components/staff/receptionDashboard/reception/receptionDelete";
import { notFound } from "next/navigation";

export default async function ReceptionDeletePage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  const staffId = Number(receptionid);

  if (!Number.isFinite(staffId)) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <ReceptionDelete staffId={staffId} open={true} onClose={() => {}} />
    </MainLayout>
  );
}
