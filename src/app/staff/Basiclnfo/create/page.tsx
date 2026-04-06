import MainLayout from "@/components/layout/MainLayout";

import BasiclnfoCreate from "@/components/staff/BasiclnfoDashboard/Basiclnfo/BasiclnfoCreate";

export default function StaffCreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <BasiclnfoCreate />
    </MainLayout>
  );
}
