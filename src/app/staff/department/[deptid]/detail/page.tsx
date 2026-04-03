import MainLayout from "@/components/layout/MainLayout";
import DepartmentDetail from "@/components/staff/departmentDashboard/department/departmentDetail";



export default async function DeptEditPage({ params }: { params: Promise<{deptid: string }> }) {
  const { deptid } = await params;



  return (
    <MainLayout showSidebar={false}>
      <DepartmentDetail deptId={deptid} />
    </MainLayout>
  );
}


