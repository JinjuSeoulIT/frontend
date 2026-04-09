import NnurseUpload from "@/components/staff/nurseDashboard/nurse/nurseUpload";
import MainLayout from "@/components/layout/MainLayout";
import { notFound } from "next/navigation";


export default async function UploadPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  const staffId = Number(nurseid);

  if (!Number.isFinite(staffId)) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <NnurseUpload staffId={staffId} />
    </MainLayout>
  );
}
