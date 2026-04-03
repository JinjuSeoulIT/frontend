"use client";

import MainLayout from "@/components/layout/MainLayout";
import ReceptionList from "@/components/staff/receptionDashboard/reception/receptionList";

export default function ReceptionListPage() {
  return (
    <MainLayout showSidebar={true}>
      <ReceptionList />
    </MainLayout>
  );
}
