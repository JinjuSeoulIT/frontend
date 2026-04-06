"use client";

import * as React from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import {
  fetchReceptionStatusHistoryApi,
  type ReceptionStatusHistory,
} from "@/lib/reception/receptionHistoryApi";

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: "접수 완료",
  WAITING: "대기",
  CALLED: "호출",
  TRIAGE: "트리아지 진행",
  IN_PROGRESS: "진료중",
  OBSERVATION: "관찰중",
  COMPLETED: "진료 완료",
  PAYMENT_WAIT: "수납대기",
  TRANSFERRED: "전원",
  ON_HOLD: "보류",
  CANCELED: "취소",
  INACTIVE: "비활성",
};

function statusLabel(code?: string | null) {
  const safe = (code ?? "").trim().toUpperCase();
  if (!safe) return "-";
  return STATUS_LABEL[safe] ?? code ?? "-";
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 19);
}

type EmergencyReceptionStatusTimelineProps = {
  receptionId: string;
};

export default function EmergencyReceptionStatusTimeline({
  receptionId,
}: EmergencyReceptionStatusTimelineProps) {
  const [history, setHistory] = React.useState<ReceptionStatusHistory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchReceptionStatusHistoryApi(receptionId);
        if (!mounted) return;
        setHistory(
          [...(list ?? [])].sort((a, b) => {
            const aTime = a.changedAt ? new Date(a.changedAt).getTime() : 0;
            const bTime = b.changedAt ? new Date(b.changedAt).getTime() : 0;
            return bTime - aTime;
          })
        );
      } catch (err) {
        if (!mounted) return;
        setHistory([]);
        setError(err instanceof Error ? err.message : "상태 변경 이력을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [receptionId]);

  return (
    <Stack spacing={1.25}>
      <Typography fontWeight={800}>상태 변경 이력</Typography>

      {loading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            이력 조회 중...
          </Typography>
        </Stack>
      )}

      {!loading && history.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary">
          상태 변경 이력이 없습니다.
        </Typography>
      )}

      {!loading &&
        history.map((item) => (
          <Box
            key={item.statusHistoryId}
            sx={{
              p: 1.25,
              borderRadius: 2,
              border: "1px solid #e5ecf8",
              bgcolor: "#f9fbff",
            }}
          >
            <Typography fontWeight={700} sx={{ fontSize: 13 }}>
              {statusLabel(item.fromStatus)} → {statusLabel(item.toStatus)}
            </Typography>
            <Typography sx={{ color: "#7b8aa9", fontSize: 12 }}>
              변경자: {item.changedBy ?? "-"} · 변경시각: {formatDateTime(item.changedAt)}
            </Typography>
            {(item.reasonCode || item.reasonText) && (
              <Typography sx={{ color: "#7b8aa9", fontSize: 12 }}>
                사유: {item.reasonCode ?? "-"} {item.reasonText ?? ""}
              </Typography>
            )}
          </Box>
        ))}

      {error && (
        <Typography color="error" variant="body2" fontWeight={700}>
          {error}
        </Typography>
      )}
    </Stack>
  );
}
