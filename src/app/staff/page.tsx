import { Typography } from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";

import MedicalMainDashboard from "@/components/staff/staffMainDashboard";

const EmployeeDashboardPage = () => {
  return (
    <MainLayout showSidebar={true}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        직원 대시보드
      </Typography>
      <MedicalMainDashboard />
    </MainLayout>
  );
};

export default EmployeeDashboardPage;
