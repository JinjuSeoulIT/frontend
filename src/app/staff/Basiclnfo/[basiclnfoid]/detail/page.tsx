import MainLayout from "@/components/layout/MainLayout";
import BasicInfoDetail from "@/components/staff/BasiclnfoDashboard/Basiclnfo/BasiclnfoDetail";



export default async function StaffDetailPage({params,}: {params: Promise<{ basicInfoid: string }>;}) {
  const { basicInfoid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <BasicInfoDetail staffId={Number(basicInfoid)} />
    </MainLayout>
  );
}





