"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

import type { PatientStatusHistory } from "@/lib/patient/statusHistoryApi";
import { fetchPatientStatusHistoryApi } from "@/lib/patient/statusHistoryApi";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 16).replace("T", " ");
}

function statusTone(code?: string | null) {
  switch (code) {
    case "INACTIVE":
      return "default" as const;
    case "DECEASED":
      return "error" as const;
    case "INPATIENT":
      return "warning" as const;
    case "OUTPATIENT":
      return "info" as const;
    case "DISCHARGED":
      return "success" as const;
    default:
      return "default" as const;
  }
}

type Props = { patientId: number; onClose?: () => void };

export default function PatientStatusHistoryContent({ patientId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<PatientStatusHistory[]>([]);

  const loadHistory = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPatientStatusHistoryApi(patientId);
      setHistory(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경 이력 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const latest = history[0];

  return (
    <Stack spacing={2}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-2)",
          background: "linear-gradient(120deg, rgba(11, 91, 143, 0.08) 0%, rgba(11, 91, 143, 0) 60%)",
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
              <Typography fontWeight={900} sx={{ fontSize: 22 }}>
                상태 변경 이력
              </Typography>
              <Typography color="text.secondary" fontWeight={700}>
                환자 상태 변경 흐름을 시간순으로 확인합니다.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={<EventOutlinedIcon />}
                label={latest ? formatDate(latest.changedAt) : "최근 기록 없음"}
                sx={{ bgcolor: "rgba(11, 91, 143, 0.12)" }}
              />
              <Button size="small" variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={loadHistory}>
                새로고침
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Typography color="error" fontWeight={900} sx={{ ml: 1 }}>
          {error}
        </Typography>
      )}

      <Card
        elevation={0}
        sx={{ borderRadius: 4, border: "1px solid var(--line)", boxShadow: "var(--shadow-1)" }}
      >
        <CardContent>
          {loading && <Typography color="text.secondary">로딩 중...</Typography>}
          {!loading && history.length === 0 && (
            <Typography color="text.secondary">상태 변경 이력이 없습니다.</Typography>
          )}
          <Stack spacing={1.5}>
            {history.map((item) => (
              <Box
                key={item.historyId}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  border: "1px solid var(--line)",
                  bgcolor: "rgba(255,255,255,0.8)",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ md: "center" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 220 }}>
                    <Chip
                      label={item.fromStatus}
                      color={statusTone(item.fromStatus)}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                    <ArrowForwardOutlinedIcon sx={{ color: "var(--muted)" }} />
                    <Chip
                      label={item.toStatus}
                      color={statusTone(item.toStatus)}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                  <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />
                  <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={800}>사유</Typography>
                    <Typography color="text.secondary">{item.reason ?? "-"}</Typography>
                  </Stack>
                  <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />
                  <Stack spacing={0.5} sx={{ minWidth: 140 }}>
                    <Typography fontWeight={800}>변경자</Typography>
                    <Typography color="text.secondary">{item.changedBy ?? "-"}</Typography>
                  </Stack>
                  <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />
                  <Stack spacing={0.5} sx={{ minWidth: 160 }}>
                    <Typography fontWeight={800}>변경일시</Typography>
                    <Typography color="text.secondary">{formatDate(item.changedAt)}</Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
