"use client";

import * as React from "react";
import { Box, Button, Typography } from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";

type Props = {
  creatingClinical: boolean;
  selectedPatient: Patient | null;
  onStartNewClinical: () => void;
};

export function ClinicalToolbar({
  creatingClinical,
  selectedPatient,
  onStartNewClinical,
}: Props) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        borderBottom: "1px solid var(--line)",
        bgcolor: "rgba(255,255,255,0.9)",
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>차트 - 진료실</Typography>
      <Button
        variant="contained"
        sx={{ bgcolor: "var(--brand)" }}
        disabled={creatingClinical || !selectedPatient}
        onClick={() => void onStartNewClinical()}
      >
        {creatingClinical ? "등록 중…" : "신규 진료 시작"}
      </Button>
    </Box>
  );
}
