import MainLayout from "@/components/layout/MainLayout";
import BasicInfoDelete from "@/components/staff/BasiclnfoDashboard/Basiclnfo/BasiclnfoDelete";

export default async function StaffDeletePage({ params }: { params: Promise<{ basiclnfoid: string }> }) {
  const { basiclnfoid } = await params;
  

  //숫자변환
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoDelete staffId={Number(basiclnfoid)} open={true} onClose={() => {}} />
    </MainLayout>
  );
}
