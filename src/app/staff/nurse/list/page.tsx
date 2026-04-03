"use client";

;
import NurseList from "@/components/staff/nurseDashboard/nurse/nurseList";
import MainLayout from "@/components/layout/MainLayout";



export default function ListPage() {
  return (
    <MainLayout showSidebar={true}>
      <NurseList />
    </MainLayout>
  );
}
