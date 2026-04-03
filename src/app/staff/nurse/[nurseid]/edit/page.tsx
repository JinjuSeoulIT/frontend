import MainLayout from "@/components/layout/MainLayout";
import NurseEdit from "@/components/staff/nurseDashboard/nurse/nurseEdit";

export default async function EditPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  return (
    <MainLayout showSidebar={false}>
      <NurseEdit staffId={nurseid} />
    </MainLayout>
  );
}
