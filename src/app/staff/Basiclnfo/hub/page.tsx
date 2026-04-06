import MainLayout from "@/components/layout/MainLayout";
import BasiclnfoHub from "@/components/staff/BasiclnfoDashboard/BasiclnfoHub";

export default async function StaffBoardPage() {
 

  return (
    <MainLayout showSidebar={false}>
      <BasiclnfoHub  />
    </MainLayout>
  );
}
