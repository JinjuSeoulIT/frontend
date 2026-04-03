"use client";

import * as React from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { Patient } from "@/features/patients/patientTypes";
import {
  formatAddress,
  patientStatusMeta,
  resolvePhotoUrl,
  safe,
  sexLabel,
} from "./PatientListUtils";

type Props = {
  primary: Patient | null;
};

export default function PatientDetailPanel({ primary }: Props) {
  const [detailTab, setDetailTab] = React.useState(0);
  const primaryStatusMeta = primary ? patientStatusMeta(primary.statusCode) : null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={resolvePhotoUrl(primary?.photoUrl) || undefined}
            sx={{ width: 64, height: 64 }}
          >
            {primary?.name?.slice(0, 1) ?? "P"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 18 }} noWrap>
              {primary?.name ?? "환자를 선택하세요"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
              {primary?.patientNo ? `환자번호 ${primary.patientNo}` : "환자번호 -"} ·{" "}
              {primary ? `ID ${primary.patientId}` : "ID -"}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: "wrap" }}>
              {primary?.isVip && <Chip size="small" label="VIP" color="primary" />}
              {primaryStatusMeta && (
                <Chip
                  size="small"
                  label={primaryStatusMeta.label}
                  color={primaryStatusMeta.color}
                  variant={primaryStatusMeta.variant}
                />
              )}
              {primary?.isForeigner && <Chip size="small" label="외국인" variant="outlined" />}
            </Stack>
          </Box>

          {primary && (
            <Button
              variant="outlined"
              size="small"
              component={Link}
              href={`/patient/${primary.patientId}`}
              startIcon={<OpenInNewIcon />}
            >
              상세
            </Button>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {!primary ? (
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            좌측 목록에서 환자를 선택하면 기본 정보가 표시됩니다.
          </Typography>
        ) : (
          <>
            <Tabs
              value={detailTab}
              onChange={(_, v) => setDetailTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 34,
                "& .MuiTab-root": { minHeight: 34, fontSize: 13 },
              }}
            >
              <Tab label="기본" />
              <Tab label="보호자/연락" />
              <Tab label="메모" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {detailTab === 0 && (
                <Stack spacing={1.2}>
                  <Row label="성별" value={sexLabel(primary.gender)} />
                  <Row label="생년월일" value={safe(primary.birthDate)} />
                  <Row label="연락처" value={safe(primary.phone)} />
                  <Row label="이메일" value={safe(primary.email)} />
                  <Row label="주소" value={formatAddress(primary)} />
                </Stack>
              )}

              {detailTab === 1 && (
                <Stack spacing={1.2}>
                  <Row label="보호자명" value={safe(primary.guardianName)} />
                  <Row label="보호자 연락처" value={safe(primary.guardianPhone)} />
                  <Row label="관계" value={safe(primary.guardianRelation)} />
                  <Row label="우선 연락처" value={safe(primary.contactPriority)} />
                </Stack>
              )}

              {detailTab === 2 && (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.5,
                    minHeight: 140,
                    bgcolor: "background.default",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {primary.note?.trim() ? primary.note : "메모가 없습니다."}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}
