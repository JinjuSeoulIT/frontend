"use client";

import MainLayout from "@/components/layout/MainLayout";
import ExamDashboard from "@/components/medical_support/ExamDashboard";
import { Typography } from "@mui/material";

const ExamPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        검사 대시보드
      </Typography>
      <ExamDashboard />
    </MainLayout>
  );
};

export default ExamPage;
