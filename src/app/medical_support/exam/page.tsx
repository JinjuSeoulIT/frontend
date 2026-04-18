"use client";

import ExamDashboard from "@/components/medical_support/ExamDashboard";
import { Typography } from "@mui/material";

const ExamPage = () => {
  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        검사 대시보드
      </Typography>
      <ExamDashboard />
    </>
  );
};

export default ExamPage;
