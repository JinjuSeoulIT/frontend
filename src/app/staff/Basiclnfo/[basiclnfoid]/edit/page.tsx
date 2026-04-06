import MainLayout from "@/components/layout/MainLayout";
import BasicInfoUpdate from "@/components/staff/BasiclnfoDashboard/Basiclnfo/BasiclnfoUpdate";

export default async function StaffEditPage({ params }: { params: Promise<{ basiclnfoid: string }> }) {
  const { basiclnfoid } = await params;
  const staffId = basiclnfoid;
  
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoUpdate staffId={Number(staffId)} />
    </MainLayout>
  );
}
