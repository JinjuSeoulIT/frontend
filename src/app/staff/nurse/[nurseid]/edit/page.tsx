import MainLayout from "@/components/layout/MainLayout";
import NurseEdit from "@/components/staff/nurseDashboard/nurse/nurseEdit";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  const staffId = Number(nurseid);

  if (!Number.isFinite(staffId)) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <NurseEdit staffId={staffId} />
    </MainLayout>
  );
}
