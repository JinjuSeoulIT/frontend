"use client";

import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/components/medical_support/Dashboard";
import { Typography } from "@mui/material";

const NursePage = () => {
  return (
    <MainLayout showSidebar={false}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        진료 지원 대시보드
      </Typography>
      <Dashboard />
    </MainLayout>
  );
};


export default NursePage;