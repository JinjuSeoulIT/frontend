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
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

import type { PatientInfoHistory } from "@/lib/patient/infoHistoryApi";
import { fetchPatientInfoHistoryApi } from "@/lib/patient/infoHistoryApi";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 16).replace("T", " ");
}

const FIELD_LABELS: Record<string, string> = {
  patientId: "환자 ID",
  patientNo: "환자번호",
  name: "이름",
  gender: "성별",
  birthDate: "생년월일",
  phone: "연락처",
  email: "이메일",
  address: "주소",
  addressDetail: "상세주소",
  guardianName: "보호자명",
  guardianPhone: "보호자 연락처",
  guardianRelation: "보호자 관계",
  isForeigner: "외국인 여부",
  contactPriority: "연락 우선순위",
  note: "메모",
  isVip: "VIP",
  photoUrl: "사진",
  statusCode: "상태",
};

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "-";
  if (typeof val === "boolean") return val ? "예" : "아니오";
  return String(val);
}

function renderDataAsRows(value?: string | null): React.ReactNode {
  if (!value || value.trim() === "") return "-";
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null) return value;
    const entries = Object.entries(parsed).filter(([, v]) => v != null && v !== "");
    if (entries.length === 0) return "-";
    return (
      <Stack spacing={0.5} component="ul" sx={{ m: 0, pl: 2.5 }}>
        {entries.map(([key, val]) => (
          <Typography key={key} component="li" color="text.secondary" sx={{ fontSize: 13 }}>
            <Box component="span" fontWeight={800} sx={{ mr: 1 }}>
              {FIELD_LABELS[key] ?? key}
            </Box>
            {formatValue(val)}
          </Typography>
        ))}
      </Stack>
    );
  } catch {
    return value;
  }
}

type Props = { patientId: number; onClose?: () => void };

export default function PatientInfoHistoryContent({ patientId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<PatientInfoHistory[]>([]);

  const loadHistory = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPatientInfoHistoryApi(patientId);
      setHistory(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "기본정보 변경 이력을 불러오지 못했습니다.");
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
                기본정보 변경 이력
              </Typography>
              <Typography color="text.secondary" fontWeight={700}>
                환자 기본정보 변경 이력을 확인합니다.
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
            <Typography color="text.secondary">변경 이력이 없습니다.</Typography>
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
                  <Stack spacing={0.5} sx={{ minWidth: 160 }}>
                    <Typography fontWeight={800}>변경 유형</Typography>
                    <Typography color="text.secondary">{item.changeType}</Typography>
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
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={1.5} direction={{ xs: "column", md: "row" }} sx={{ gap: 2 }}>
                  <Box sx={{ flex: 1, p: 1.5, borderRadius: 1, bgcolor: "rgba(0,0,0,0.03)" }}>
                    <Typography fontWeight={800} sx={{ mb: 1, fontSize: 13 }}>
                      변경 전
                    </Typography>
                    {renderDataAsRows(item.beforeData)}
                  </Box>
                  <Box sx={{ flex: 1, p: 1.5, borderRadius: 1, bgcolor: "rgba(0,0,0,0.03)" }}>
                    <Typography fontWeight={800} sx={{ mb: 1, fontSize: 13 }}>
                      변경 후
                    </Typography>
                    {renderDataAsRows(item.afterData)}
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
