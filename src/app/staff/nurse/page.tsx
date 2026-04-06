"use client";

import MainLayout from "@/components/layout/MainLayout";
import NurseDashboard from "@/components/staff/nurseDashboard/NurseDashboard";



const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <NurseDashboard />
    </MainLayout>
  );
};

export default RecordPage;
