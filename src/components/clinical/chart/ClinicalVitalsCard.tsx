"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { VitalSignsRes, AssessmentRes } from "@/lib/clinical/clinicalVitalsApi";
import type { Patient } from "@/features/patients/patientTypes";
import { formatDateTime } from "../clinicalDocumentation";

type Props = {
  selectedPatient: Patient | null;
  vitals: VitalSignsRes | null;
  assessment: AssessmentRes | null;
  vitalsLoading: boolean;
  assessmentLoading: boolean;
  visitId: number | null;
  onOpenVitalDialog: (mode: "new" | "edit") => void;
  embedded?: boolean;
};

export function ClinicalVitalsCard({
  selectedPatient,
  vitals,
  vitalsLoading,
  assessmentLoading,
  visitId,
  onOpenVitalDialog,
  embedded = false,
}: Props) {
  return (
    <Card
      variant={embedded ? "outlined" : undefined}
      elevation={embedded ? 0 : undefined}
      sx={{
        borderRadius: 2,
        border: embedded ? "none" : "1px solid var(--line)",
        boxShadow: embedded ? "none" : undefined,
      }}
    >
      <CardContent sx={{ py: embedded ? 0 : 1.5, "&:last-child": { pb: embedded ? 0 : 1.5 } }}>
        {!embedded ? (
          <>
            <Typography fontWeight={800} sx={{ mb: 0.25, fontSize: 15 }}>
              신체계측/바이탈 (SOAP O)
            </Typography>
            <Typography sx={{ fontSize: 10, color: "var(--muted)", mb: 1 }}>계측·문진 (SOAP)</Typography>
          </>
        ) : null}
        {selectedPatient ? (
          vitals ? (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>날짜</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>혈압(수축)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>혈압(이완)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>체온</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>맥박</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>호흡</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{formatDateTime(vitals.measuredAt ?? null)}</TableCell>
                      <TableCell>{vitals.bpSystolic ?? "-"}</TableCell>
                      <TableCell>{vitals.bpDiastolic ?? "-"}</TableCell>
                      <TableCell>{vitals.temperature ?? "-"}℃</TableCell>
                      <TableCell>{vitals.pulse ?? "-"}/분</TableCell>
                      <TableCell>{vitals.respiratoryRate ?? "-"}/분</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
                <Button
                  size="small"
                  variant="contained"
                  sx={{ bgcolor: "var(--brand)" }}
                  disabled={visitId == null || vitalsLoading || assessmentLoading}
                  onClick={() => onOpenVitalDialog("edit")}
                >
                  활력·문진 입력·수정
                </Button>
              </Stack>
            </>
          ) : (
            <Box sx={{ py: 2, textAlign: "center" }}>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                계측·문진 기록 없음
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: "var(--brand)" }}
                disabled={visitId == null || vitalsLoading || assessmentLoading}
                onClick={() => onOpenVitalDialog("new")}
              >
                활력·문진 입력
              </Button>
            </Box>
          )
        ) : (
          <Typography color="text.secondary">환자를 선택하면 계측·문진을 표시합니다.</Typography>
        )}
      </CardContent>
    </Card>
  );
}
