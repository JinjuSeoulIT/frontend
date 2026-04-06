import MainLayout from "@/components/layout/MainLayout";
import DepartmentDelete from "@/components/staff/departmentDashboard/department/departmentDelete";




export default async function DeptEditPage({ params }: { params: Promise<{deptid: string }> }) {
  const { deptid } = await params;



  return (
    <MainLayout showSidebar={false}>
      <DepartmentDelete deptId={deptid} />
    </MainLayout>
  );
}


