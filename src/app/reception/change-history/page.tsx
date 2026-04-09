"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import type { Reception, ReceptionStatus } from "@/features/Reception/ReceptionTypes";
import { fetchReceptionsApi } from "@/lib/reception/receptionApi";
import {
  fetchReceptionStatusHistoryApi,
  type ReceptionStatusHistory,
} from "@/lib/reception/receptionHistoryApi";
import { fetchAuditLogsByReceptionApi, type AuditLog } from "@/lib/reception/auditLogApi";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

type StatusFilter = "ALL" | ReceptionStatus;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "WAITING", label: "대기" },
  { value: "CALLED", label: "호출" },
  { value: "IN_PROGRESS", label: "진료중" },
  { value: "PAYMENT_WAIT", label: "수납대기" },
  { value: "COMPLETED", label: "완료" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
  { value: "INACTIVE", label: "비활성" },
];

const toDateInput = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const normalizeStatus = (value?: string | null): ReceptionStatus | "UNKNOWN" => {
  const normalized = (value ?? "").trim().toUpperCase();
  if (normalized === "ON_HOLD") return "ON_HOLD";
  if (normalized === "HOLD") return "ON_HOLD";
  if (normalized === "CANCELED") return "CANCELED";
  if (normalized === "CANCELLED") return "CANCELED";
  if (normalized === "WAITING") return "WAITING";
  if (normalized === "CALLED") return "CALLED";
  if (normalized === "IN_PROGRESS") return "IN_PROGRESS";
  if (normalized === "PAYMENT_WAIT") return "PAYMENT_WAIT";
  if (normalized === "COMPLETED") return "COMPLETED";
  if (normalized === "INACTIVE") return "INACTIVE";
  return "UNKNOWN";
};

const statusLabel = (value?: string | null) => {
  switch (normalizeStatus(value)) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "IN_PROGRESS":
      return "진료중";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "COMPLETED":
      return "완료";
    case "ON_HOLD":
      return "보류";
    case "CANCELED":
      return "취소";
    case "INACTIVE":
      return "비활성";
    default:
      return value ?? "-";
  }
};

const statusChipSx = (value?: string | null) => {
  switch (normalizeStatus(value)) {
    case "WAITING":
      return { bgcolor: "#eef4ff", color: "#2b5aa9", borderColor: "#c9ddff" };
    case "CALLED":
      return { bgcolor: "#edf7ff", color: "#0b5b8f", borderColor: "#b8e2ff" };
    case "IN_PROGRESS":
      return { bgcolor: "#eafaf4", color: "#117a4d", borderColor: "#bfe9d3" };
    case "PAYMENT_WAIT":
      return { bgcolor: "#fff7e8", color: "#9a5b00", borderColor: "#ffdca8" };
    case "COMPLETED":
      return { bgcolor: "#ecfdf3", color: "#13613d", borderColor: "#b9e6cb" };
    case "ON_HOLD":
      return { bgcolor: "#f3f4f6", color: "#374151", borderColor: "#d1d5db" };
    case "CANCELED":
      return { bgcolor: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
    case "INACTIVE":
      return { bgcolor: "#f5f3ff", color: "#5b21b6", borderColor: "#ddd6fe" };
    default:
      return { bgcolor: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" };
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ko-KR");
};

const toTimestamp = (value?: string | null) => {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function ReceptionChangeHistoryPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [list, setList] = React.useState<Reception[]>([]);

  const [keyword, setKeyword] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("ALL");
  const [dateFrom, setDateFrom] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInput(d);
  });
  const [dateTo, setDateTo] = React.useState(() => toDateInput(new Date()));

  const [selectedReceptionId, setSelectedReceptionId] = React.useState<number | null>(null);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [historyError, setHistoryError] = React.useState<string | null>(null);
  const [statusHistory, setStatusHistory] = React.useState<ReceptionStatusHistory[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

  const loadReceptions = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReceptionsApi();
      setList(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "접수 목록 조회 실패";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetails = React.useCallback(async (receptionId: number) => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const [history, logs] = await Promise.all([
        fetchReceptionStatusHistoryApi(String(receptionId)),
        fetchAuditLogsByReceptionApi(String(receptionId)),
      ]);
      setStatusHistory(
        [...history].sort((a, b) => toTimestamp(b.changedAt) - toTimestamp(a.changedAt))
      );
      setAuditLogs(
        [...logs].sort((a, b) => toTimestamp(b.occurredAt) - toTimestamp(a.occurredAt))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "이력 조회 실패";
      setHistoryError(message);
      setStatusHistory([]);
      setAuditLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadReceptions();
  }, [loadReceptions]);

  const filteredList = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTs = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return list
      .filter((item) => {
        if (status !== "ALL" && normalizeStatus(item.status) !== status) return false;

        if (kw) {
          const matchesKw =
            (item.receptionNo ?? "").toLowerCase().includes(kw) ||
            (item.patientName ?? "").toLowerCase().includes(kw) ||
            String(item.patientId ?? "").includes(kw);
          if (!matchesKw) return false;
        }

        const createdTs = toTimestamp(item.createdAt);
        if (fromTs != null && createdTs > 0 && createdTs < fromTs) return false;
        if (toTs != null && createdTs > 0 && createdTs > toTs) return false;
        return true;
      })
      .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
  }, [dateFrom, dateTo, keyword, list, status]);

  React.useEffect(() => {
    if (!filteredList.length) {
      setSelectedReceptionId(null);
      setStatusHistory([]);
      setAuditLogs([]);
      return;
    }
    const exists = filteredList.some((item) => item.receptionId === selectedReceptionId);
    if (!exists) {
      const nextId = filteredList[0].receptionId;
      setSelectedReceptionId(nextId);
      void loadDetails(nextId);
    }
  }, [filteredList, loadDetails, selectedReceptionId]);

  const selectedReception =
    filteredList.find((item) => item.receptionId === selectedReceptionId) ?? null;

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Card sx={{ borderRadius: 3, border: "1px solid #dbe5f5" }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h5" fontWeight={900}>
                접수 변경 이력
              </Typography>
              <Typography color="text.secondary" fontWeight={700}>
                접수 상태 변경 이력과 감사 로그를 한 화면에서 확인합니다.
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  size="small"
                  label="키워드"
                  placeholder="접수번호 / 환자명 / 환자ID"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  sx={{ minWidth: 220 }}
                />
                <TextField
                  select
                  size="small"
                  label="상태"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  sx={{ minWidth: 150 }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  label="시작일"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  label="종료일"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button variant="outlined" onClick={() => void loadReceptions()} disabled={loading}>
                  {loading ? "조회 중..." : "새로고침"}
                </Button>
              </Stack>

              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>

        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
          <Card sx={{ flex: 1, minWidth: 0, borderRadius: 3, border: "1px solid #dbe5f5" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography fontWeight={900}>접수 목록 ({filteredList.length}건)</Typography>
                <TableContainer sx={{ maxHeight: 520 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>접수번호</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>환자</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>상태</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>생성일</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredList.map((item) => {
                        const selected = item.receptionId === selectedReceptionId;
                        return (
                          <TableRow
                            key={item.receptionId}
                            hover
                            selected={selected}
                            onClick={() => {
                              setSelectedReceptionId(item.receptionId);
                              void loadDetails(item.receptionId);
                            }}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell>{item.receptionNo}</TableCell>
                            <TableCell>{item.patientName ?? `환자 ${item.patientId}`}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={statusLabel(item.status)}
                                variant="outlined"
                                sx={{ fontWeight: 700, ...statusChipSx(item.status) }}
                              />
                            </TableCell>
                            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 0, borderRadius: 3, border: "1px solid #dbe5f5" }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography fontWeight={900}>선택 접수 상세</Typography>
                {!selectedReception ? (
                  <Typography color="text.secondary">조회할 접수를 선택하세요.</Typography>
                ) : (
                  <Stack spacing={1}>
                    <Typography sx={{ color: "#65789a", fontSize: 13 }}>
                      {selectedReception.receptionNo} · {selectedReception.patientName ?? selectedReception.patientId}
                    </Typography>
                    <Divider />
                    {historyError ? <Alert severity="error">{historyError}</Alert> : null}
                    <Typography fontWeight={800}>상태 변경 이력 ({statusHistory.length}건)</Typography>
                    <TableContainer sx={{ maxHeight: 230, border: "1px solid #e8eef8", borderRadius: 1.5 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>이전</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>변경</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>변경자</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>시간</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statusHistory.map((row) => (
                            <TableRow key={row.statusHistoryId}>
                              <TableCell>{statusLabel(row.fromStatus)}</TableCell>
                              <TableCell>{statusLabel(row.toStatus)}</TableCell>
                              <TableCell>{row.changedBy ?? "-"}</TableCell>
                              <TableCell>{formatDateTime(row.changedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Typography fontWeight={800}>감사 로그 ({auditLogs.length}건)</Typography>
                    <TableContainer sx={{ maxHeight: 230, border: "1px solid #e8eef8", borderRadius: 1.5 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>액션</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>처리자</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>시간</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>사유</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {auditLogs.map((row) => (
                            <TableRow key={row.auditLogId}>
                              <TableCell>{row.action}</TableCell>
                              <TableCell>{row.actorId ?? "-"}</TableCell>
                              <TableCell>{formatDateTime(row.occurredAt)}</TableCell>
                              <TableCell>{row.reasonText ?? row.reasonCode ?? "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box>
                      {historyLoading ? (
                        <Typography sx={{ color: "#6b7b9a", fontSize: 12 }}>
                          상세 이력 불러오는 중...
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
