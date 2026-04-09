import MainLayout from "@/components/layout/MainLayout";
import NurseDetail from "@/components/staff/nurseDashboard/nurse/nurseDetail";
import { notFound } from "next/navigation";


export default async function DetailPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  const staffId = Number(nurseid);

  if (!Number.isFinite(staffId)) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <NurseDetail staffId={staffId} />
    </MainLayout>
  );
}
