"use client";

import MainLayout from "@/components/layout/MainLayout";
import { MedicationRecordListSection } from "@/components/medical_support/medicationRecord/MedicationRecordList";
import { TreatmentResultListSection } from "@/components/medical_support/treatmentResult/TreatmentResultList";
import { Box, Typography } from "@mui/material";

const MedicationTreatmentPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        처치 결과 및 투약 기록
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        처치 결과와 투약 기록을 한 화면에서 함께 조회할 수 있습니다.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(2, minmax(0, 1fr))",
          },
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <TreatmentResultListSection />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <MedicationRecordListSection />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default MedicationTreatmentPage;
