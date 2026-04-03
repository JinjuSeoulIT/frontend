"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import type { Patient } from "@/features/patients/patientTypes";

type Props = {
  patient: Patient | null;
  statusOptionsCount: number;
  onBack: () => void;
  onOpenReceptionDialog: () => void;
  onOpenReservationDialog: () => void;
  onOpenStatusDialog: () => void;
  onOpenEditDialog: () => void;
  onDelete: () => void;
};

export default function PatientDetailQuickActions({
  patient: p,
  statusOptionsCount,
  onBack,
  onOpenReceptionDialog,
  onOpenReservationDialog,
  onOpenStatusDialog,
  onOpenEditDialog,
  onDelete,
}: Props) {
  const emergencyCreateHref = React.useMemo(() => {
    if (!p) return "/reception/emergency/create";
    const params = new URLSearchParams({
      patientId: String(p.patientId),
      patientName: (p.name ?? "").trim(),
    });
    return `/reception/emergency/create?${params.toString()}`;
  }, [p]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: "1px solid #d7e4fb",
        background: "linear-gradient(180deg, #f7fbff 0%, #eef5ff 100%)",
        boxShadow: "0 8px 18px rgba(43, 90, 169, 0.12)",
        width: "100%",
        maxWidth: 380,
      }}
    >
      <Stack spacing={1.2}>
        <Typography variant="caption" sx={{ color: "#5b6f96", fontWeight: 900, letterSpacing: 0.4 }}>
          QUICK ACTIONS
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="contained"
            color="info"
            startIcon={<AssignmentIndOutlinedIcon />}
            onClick={onOpenReceptionDialog}
            disabled={!p}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 140px", minWidth: 140 }}
          >
            접수 등록
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EventAvailableOutlinedIcon />}
            onClick={onOpenReservationDialog}
            disabled={!p}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 140px", minWidth: 140 }}
          >
            예약 등록
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<LocalHospitalOutlinedIcon />}
            component={Link}
            href={emergencyCreateHref}
            disabled={!p}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 140px", minWidth: 140 }}
          >
            응급 등록
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<HotelOutlinedIcon />}
            component={Link}
            href="/reception/inpatient/create"
            disabled={!p}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 140px", minWidth: 140 }}
          >
            입원 등록
          </Button>
        </Box>

        <Divider sx={{ borderColor: "#d7e4fb" }} />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={onBack}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
          >
            뒤로
          </Button>
          {p && (
            <Button
              variant="outlined"
              onClick={onOpenEditDialog}
              startIcon={<EditOutlinedIcon />}
              sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
            >
              수정
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<SwapHorizOutlinedIcon />}
            onClick={onOpenStatusDialog}
            disabled={!p || statusOptionsCount === 0}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
          >
            상태 변경
          </Button>
          {p && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<BlockOutlinedIcon />}
              onClick={onDelete}
              sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
            >
              비활성
            </Button>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
