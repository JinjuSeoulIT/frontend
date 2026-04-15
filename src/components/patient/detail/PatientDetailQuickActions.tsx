"use client";

import * as React from "react";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SpeakerNotesOutlinedIcon from "@mui/icons-material/SpeakerNotesOutlined";
import type { Patient } from "@/features/patients/patientTypes";

type Props = {
  patient: Patient | null;
  statusOptionsCount: number;
  onOpenReceptionDialog: () => void;
  onOpenReservationDialog: () => void;
  onOpenMemoDialog: () => void;
  onOpenFlagDialog: () => void;
  onOpenRestrictionDialog: () => void;
  onOpenStatusDialog: () => void;
  onOpenEditDialog: () => void;
  onDelete: () => void;
};

export default function PatientDetailQuickActions({
  patient: p,
  statusOptionsCount,
  onOpenReceptionDialog,
  onOpenReservationDialog,
  onOpenMemoDialog,
  onOpenFlagDialog,
  onOpenRestrictionDialog,
  onOpenStatusDialog,
  onOpenEditDialog,
  onDelete,
}: Props) {
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
        </Box>

        <Divider sx={{ borderColor: "#d7e4fb" }} />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
          <Button
            variant="outlined"
            startIcon={<SpeakerNotesOutlinedIcon />}
            onClick={onOpenMemoDialog}
            disabled={!p}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
          >
            메모
          </Button>
          <Button
            variant="outlined"
            startIcon={<FlagOutlinedIcon />}
            onClick={onOpenFlagDialog}
            disabled={!p}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
          >
            플래그 관리
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReportProblemOutlinedIcon />}
            onClick={onOpenRestrictionDialog}
            disabled={!p}
            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
          >
            제한 관리
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
