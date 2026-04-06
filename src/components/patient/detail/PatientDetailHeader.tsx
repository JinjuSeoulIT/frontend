"use client";

import * as React from "react";
import { Box, Chip, FormControlLabel, Grid, Stack, Switch, Typography } from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";
import type { PatientRestriction } from "@/lib/patient/restrictionApi";
import type { PatientFlag } from "@/lib/patient/flagApi";
import type { Option } from "./PatientDetailUtils";
import { resolveFileUrl, sexLabel, buildFlags } from "./PatientDetailUtils";

type Props = {
  patient: Patient | null;
  loading: boolean;
  restrictions: PatientRestriction[];
  flags: PatientFlag[];
  statusOptions: Option[];
  flagOptions: Option[];
  restrictionOptions: Option[];
  vipUpdating: boolean;
  onToggleVip: (checked: boolean) => void;
};

export default function PatientDetailHeader(props: Props) {
  const {
    patient: p,
    loading,
    restrictions,
    flags,
    statusOptions,
    flagOptions,
    restrictionOptions,
    vipUpdating,
    onToggleVip,
  } = props;

  const addressText = p
    ? `${p.address ?? "-"} ${p.addressDetail ? `(${p.addressDetail})` : ""}`
    : "-";

  const getStatusLabel = (code?: string | null) => {
    if (!code) return "-";
    const found = statusOptions.find((opt) => opt.value === code);
    if (found) return `${found.label}(${found.value})`;
    return code;
  };

  const detailRows = [
    { label: "환자 ID", value: p?.patientId ?? "-" },
    { label: "성별", value: p ? sexLabel(p.gender) : "-" },
    { label: "연락처", value: p?.phone ?? "-" },
    { label: "보호자명", value: p?.guardianName ?? "-" },
    { label: "보호자 연락처", value: p?.guardianPhone ?? "-" },
    { label: "보호자 관계", value: p?.guardianRelation ?? "-" },
    { label: "국적", value: p?.isForeigner ? "외국인" : "내국인" },
    { label: "연락 우선순위", value: p?.contactPriority === "GUARDIAN" ? "보호자" : "본인" },
    { label: "메모", value: p?.note ?? "-" },
    { label: "주소", value: addressText },
    { label: "상태", value: getStatusLabel(p?.statusCode) },
  ];

  const flagChips = p ? buildFlags(p, restrictions, flags, flagOptions, restrictionOptions) : [];

  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid size={{ xs: 12, md: 3 }}>
        <Box
          sx={{
            width: { xs: "100%", sm: 220 },
            aspectRatio: "3 / 4",
            borderRadius: 4,
            border: "1px solid #dbe5f5",
            boxShadow: "0 10px 22px rgba(23, 52, 97, 0.12)",
            overflow: "hidden",
            bgcolor: "#f3f6fb",
            backgroundImage: p?.photoUrl
              ? `url(${resolveFileUrl(p.photoUrl)})`
              : "linear-gradient(135deg, #cfdcf2, #e6eefb)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!p?.photoUrl && (
            <Typography variant="h3" fontWeight={900} color="white">
              {p?.name?.slice(0, 1) ?? "?"}
            </Typography>
          )}
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={1.25} sx={{ pt: { md: 0.5 } }}>
          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ flexWrap: "wrap" }}>
            <Typography variant="h4" fontWeight={900}>
              {p?.name ?? "환자 상세"}
            </Typography>
            <Typography color="text.secondary" fontWeight={800}>
              {p?.patientNo ?? "-"}
            </Typography>
            {p && (
              <Typography color="text.secondary" fontWeight={800}>
                {sexLabel(p.gender)} · {p.birthDate ?? "-"}
              </Typography>
            )}
          </Stack>

          <Typography color="text.secondary" fontWeight={700}>
            환자 기본 정보를 확인하세요.
          </Typography>

          {p && (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(p.isVip)}
                  onChange={(e) => onToggleVip(e.target.checked)}
                  disabled={vipUpdating || loading}
                />
              }
              label="VIP"
            />
          )}

          <Stack spacing={0.75} sx={{ mt: 0.5 }}>
            {detailRows.map((row) => (
              <Stack key={row.label} direction="row" spacing={1.5} alignItems="center">
                <Typography variant="body2" color="text.secondary" fontWeight={800} sx={{ minWidth: 96 }}>
                  {row.label}
                </Typography>
                <Typography fontWeight={900}>{row.value}</Typography>
              </Stack>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 0.5 }}>
            {flagChips.map((c) => (
              <Chip key={c.key} label={c.label} color={c.color ?? "default"} sx={{ fontWeight: 900 }} />
            ))}
            {!p && <Chip label={loading ? "로딩..." : "선택 없음"} />}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}
