import MainLayout from "@/components/layout/MainLayout";
import NurseDelete from "@/components/staff/nurseDashboard/nurse/nurseDelete";


export default async function DeletePage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  return (
    <MainLayout showSidebar={false}>
      <NurseDelete staffId={nurseid} open={true} onClose={() => {}} />
    </MainLayout>
  );
}
  