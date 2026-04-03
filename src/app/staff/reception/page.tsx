"use client";

import MainLayout from "@/components/layout/MainLayout";
import ReceptionDashboard from "@/components/staff/receptionDashboard/ReceptionDashboard";

export default function ReceptionPage() {
  return (
    <MainLayout showSidebar={false}>
      <ReceptionDashboard />
    </MainLayout>
  );
}
