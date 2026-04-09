import MainLayout from "@/components/layout/MainLayout";
import ReceptionEdit from "@/components/staff/receptionDashboard/reception/receptionEdit";
import { notFound } from "next/navigation";

export default async function ReceptionEditPage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  const staffId = Number(receptionid);

  if (!Number.isFinite(staffId)) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <ReceptionEdit staffId={staffId} />
    </MainLayout>
  );
}
