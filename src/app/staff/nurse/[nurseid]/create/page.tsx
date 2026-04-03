import NurseCreate from "@/components/staff/nurseDashboard/nurse/nurseCreate";
import MainLayout from "@/components/layout/MainLayout";


export default async function CreatePage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <NurseCreate staffId={nurseid} />
    </MainLayout>
  );
}
