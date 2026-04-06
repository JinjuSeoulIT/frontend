"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { Patient } from "@/features/patients/patientTypes";

type Props = {
  title: string;
  description?: string;
  basePath: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181";

function resolvePhotoUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function PatientSelectList({
  title,
  description,
  basePath,
}: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading } = useSelector((s: RootState) => s.patients);

  React.useEffect(() => {
    if (!list.length) {
      dispatch(patientActions.fetchPatientsRequest());
    }
  }, [dispatch, list.length]);

  const onSelect = (p: Patient) => {
    dispatch(patientActions.fetchPatientSuccess(p));
    router.push(`${basePath}/${p.patientId}`);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #dbe5f5",
        boxShadow: "0 12px 24px rgba(23, 52, 97, 0.12)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography fontWeight={800}>{title}</Typography>
              {description && (
                <Typography sx={{ color: "#7b8aa9", fontSize: 13, mt: 0.5 }}>
                  {description}
                </Typography>
              )}
            </Box>
            <Chip
              label={loading ? "불러오는 중" : `총 ${list.length}`}
              size="small"
              color="primary"
            />
          </Stack>

          <Stack spacing={1}>
            {list.map((p) => (
              <Box
                key={p.patientId}
                onClick={() => onSelect(p)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "44px minmax(0, 1fr)",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.2,
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f1f6ff" },
                }}
              >
                <Avatar
                  src={resolvePhotoUrl(p.photoUrl) || undefined}
                  sx={{ width: 36, height: 36, bgcolor: "#d7e6ff", color: "#2b5aa9" }}
                >
                  {p.name?.slice(0, 1) ?? "?"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>
                    {p.name}
                  </Typography>
                  <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                    {p.patientNo ?? "-"}
                  </Typography>
                </Box>
              </Box>
            ))}

            {!loading && list.length === 0 && (
              <Typography color="#7b8aa9">조회된 환자가 없습니다.</Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
