import MainLayout from "@/components/layout/MainLayout";
import DepartmentUpdate from "@/components/staff/departmentDashboard/department/departmentUpdate";


export default async function DeptEditPage({ params }: { params: Promise<{deptid: string }> }) {
  const { deptid } = await params;



  return (
    <MainLayout showSidebar={false}>
      <DepartmentUpdate deptId={deptid} />
    </MainLayout>
  );
}





