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
import { receptionActions } from "@/features/Reception/ReceptionSlice";
import type { Reception } from "@/features/Reception/ReceptionTypes";

type Props = {
  title: string;
  description?: string;
  basePath: string;
};

export default function ReceptionSelectList({
  title,
  description,
  basePath,
}: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading } = useSelector((s: RootState) => s.receptions);

  React.useEffect(() => {
    if (!list.length) {
      dispatch(receptionActions.fetchReceptionsRequest());
    }
  }, [dispatch, list.length]);

  const onSelect = (p: Reception) => {
    dispatch(receptionActions.fetchReceptionSuccess(p));
    router.push(`${basePath}/${p.receptionId}`);
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
              label={loading ? "불러오는 중..." : `총 ${list.length}`}
              size="small"
              color="primary"
            />
          </Stack>

          <Stack spacing={1}>
            {list.map((p) => (
              <Box
                key={p.receptionId}
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
                  sx={{ width: 36, height: 36, bgcolor: "#d7e6ff", color: "#2b5aa9" }}
                >
                  {String(p.patientId ?? "?").slice(-2)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>
                    환자 {p.patientId}
                  </Typography>
                  <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                    {p.receptionNo ?? "-"}
                  </Typography>
                </Box>
              </Box>
            ))}

            {!loading && list.length === 0 && (
              <Typography color="#7b8aa9">조회된 접수가 없습니다.</Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
