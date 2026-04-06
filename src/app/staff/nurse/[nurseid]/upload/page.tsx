import NnurseUpload from "@/components/staff/nurseDashboard/nurse/nurseUpload";
import MainLayout from "@/components/layout/MainLayout";


export default async function UploadPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  return (
    <MainLayout showSidebar={false}>
      <NnurseUpload staffId={nurseid} />
    </MainLayout>
  );
}
