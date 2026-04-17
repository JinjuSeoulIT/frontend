"use client";

import * as React from "react";
import { Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
type ModalType = "insurance" | "consent" | "info-history" | "status-history";

type CardItem = { title: string; desc: string; modalType: ModalType };

const CARD_ITEMS:CardItem[] = [
  { title: "보험", desc: "환자 보험 등록/수정", modalType: "insurance"},
  { title: "동의서", desc: "동의서 등록/파일 관리", modalType: "consent"},
  { title: "정보 변경 이력", desc: "기본정보 변경 이력", modalType: "info-history"},
  { title: "상태 변경 이력", desc: "환자 상태 변경 이력", modalType: "status-history"},
];

type Props = {
  patientId: number;
  onOpenModal: (modalType: ModalType) => void;
};

export default function PatientDetailCards({ patientId, onOpenModal }: Props) {
  const items= CARD_ITEMS;

  return (
    <Grid container spacing={2}>
      {items.map((card) => (
        <Grid key={card.title} size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              border: "1px solid var(--line)",
              bgcolor: "white",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <Stack spacing={1}>
              <Typography fontWeight={900}>{card.title}</Typography>
              <Typography color="text.secondary" fontWeight={700}>
                {card.desc}
              </Typography>
              <Divider />
              <Button variant="outlined" onClick={() => onOpenModal(card.modalType)}>
                열기
              </Button>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
