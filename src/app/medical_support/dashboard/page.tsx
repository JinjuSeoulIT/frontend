"use client";

import Dashboard from "@/components/medical_support/Dashboard";
import { Typography } from "@mui/material";

const NursePage = () => {
  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        진료 지원 대시보드
      </Typography>
      <Dashboard />
    </>
  );
};


export default NursePage;
