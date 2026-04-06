import MainLayout from "@/components/layout/MainLayout";
import DepartmentList from "@/components/staff/departmentDashboard/department/dapartmentList";


export default function DepartmentListPage() {
  return (
     <MainLayout showSidebar={false}>
  <DepartmentList />
  </MainLayout>
  );
}

