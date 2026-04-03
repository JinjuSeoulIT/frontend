"use client";

import DoctorList from "@/components/staff/doctorDashboard/doctor/DoctorList";
import MainLayout from "@/components/layout/MainLayout";



export default function ListPage() {
  return (
    <MainLayout showSidebar={true}>
      <DoctorList />
    </MainLayout>
  );
}
