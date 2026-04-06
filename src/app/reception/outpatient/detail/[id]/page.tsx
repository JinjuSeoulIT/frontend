"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Reception/ReceptionSlice";
import type { Reception, ReceptionForm, ReceptionStatus } from "@/features/Reception/ReceptionTypes";
import { fetchReceptionStatusHistoryApi } from "@/lib/reception/receptionHistoryApi";
import { fetchAuditLogsByReceptionApi } from "@/lib/reception/auditLogApi";
import ReceptionExtensionsPanel from "@/components/reception/ReceptionExtensionsPanel";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function ReceptionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.receptions);

  const receptionId = params.id;
  const [history, setHistory] = React.useState<Awaited<
    ReturnType<typeof fetchReceptionStatusHistoryApi>
  >>([]);
  const [auditLogs, setAuditLogs] = React.useState<Awaited<
    ReturnType<typeof fetchAuditLogsByReceptionApi>
  >>([]);

  React.useEffect(() => {
    dispatch(receptionActions.fetchReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [hist, logs] = await Promise.all([
          fetchReceptionStatusHistoryApi(receptionId),
          fetchAuditLogsByReceptionApi(receptionId),
        ]);
        if (!mounted) return;
        setHistory(hist);
        setAuditLogs(logs);
      } catch {
        if (!mounted) return;
        setHistory([]);
        setAuditLogs([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [receptionId]);

  const p: Reception | null = selected && String(selected.receptionId) === receptionId ? selected : null;

  const toUpdateForm = (value: Reception, nextStatus?: ReceptionStatus): ReceptionForm => ({
    receptionNo: value.receptionNo,
    patientId: value.patientId ?? null,
    patientName: value.patientName ?? null,
    visitType: value.visitType,
    departmentId: value.departmentId ?? null,
    departmentName: null,
    doctorId: value.doctorId ?? null,
    doctorName: null,
    reservationId: value.reservationId ?? null,
    scheduledAt: value.scheduledAt ?? null,
    arrivedAt: value.arrivedAt ?? null,
    status: nextStatus ?? value.status,
    note: value.note ?? null,
  });

  const onChangeStatus = (nextStatus: ReceptionStatus) => {
    if (!p) return;
    if (p.status === nextStatus) return;
    if (!confirm(`상태를 ${nextStatus}로 변경하시겠습니까?`)) return;

    if (nextStatus === "CANCELED") {
      dispatch(receptionActions.cancelReceptionRequest({ receptionId }));
    } else {
      dispatch(
        receptionActions.updateReceptionRequest({
          receptionId,
          form: toUpdateForm(p, nextStatus),
        })
      );
    }
    router.push("/reception/outpatient/list");
  };

  const visitTypeLabel = (value?: string | null) => {
    switch ((value ?? "").toUpperCase()) {
      case "OUTPATIENT":
        return "외래";
      case "EMERGENCY":
        return "응급";
      case "INPATIENT":
        return "입원";
      default:
        return value ?? "-";
    }
  };

  const statusLabel = (value?: ReceptionStatus | string | null) => {
    switch ((value ?? "").toUpperCase()) {
      case "WAITING":
        return "대기";
      case "CALLED":
        return "호출";
      case "IN_PROGRESS":
        return "진료중";
      case "COMPLETED":
        return "완료";
      case "PAYMENT_WAIT":
        return "수납대기";
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

  return (
    <MainLayout>
      <Card sx={{ borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                접수 상세
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? "불러오는 중..." : error ?? "정상"}
              </Typography>
            </Box>

            <Divider />

            {p ? (
              <Stack spacing={1}>
                <Row label="접수 ID" value={String(p.receptionId)} />
                <Row label="접수번호" value={p.receptionNo} />
                <Row label="환자 이름" value={p.patientName ?? "-"} />
                <Row label="진료과" value={p.departmentName ?? "-"} />
                <Row label="의사 이름" value={p.doctorName ?? "-"} />
                <Row label="내원유형" value={visitTypeLabel(p.visitType)} />
                <Row label="상태" value={statusLabel(p.status)} />
                <Row label="메모" value={p.note ?? "-"} />
              </Stack>
            ) : (
              <Typography color="text.secondary">선택된 접수가 없습니다.</Typography>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" onClick={() => router.push("/reception/outpatient/list")}>
                뒤로
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push(`/reception/outpatient/edit/${receptionId}`)}
                disabled={!p}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={() => onChangeStatus("COMPLETED")}
                disabled={!p}
              >
                완료
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => onChangeStatus("CANCELED")}
                disabled={!p}
              >
                취소
              </Button>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1.5}>
              <Typography fontWeight={800}>상태 변경 이력</Typography>
              {history.length ? (
                <Stack spacing={1}>
                  {history.map((h) => (
                    <Box
                      key={h.statusHistoryId}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid #e5ecf8",
                        bgcolor: "#f9fbff",
                      }}
                    >
                      <Typography fontWeight={700} sx={{ fontSize: 13 }}>
                        {statusLabel(h.fromStatus ?? "-")} → {statusLabel(h.toStatus)}
                      </Typography>
                      <Typography sx={{ color: "#7b8aa9", fontSize: 12 }}>
                        변경자: {h.changedBy ?? "-"} · 변경시각: {h.changedAt}
                      </Typography>
                      {(h.reasonCode || h.reasonText) && (
                        <Typography sx={{ color: "#7b8aa9", fontSize: 12 }}>
                          사유: {h.reasonCode ?? "-"} {h.reasonText ?? ""}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">이력이 없습니다.</Typography>
              )}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1.5}>
              <Typography fontWeight={800}>감사 로그</Typography>
              {auditLogs.length ? (
                <Stack spacing={1}>
                  {auditLogs.map((log) => (
                    <Box
                      key={log.auditLogId}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid #e5ecf8",
                        bgcolor: "#f9fbff",
                      }}
                    >
                      <Typography fontWeight={700} sx={{ fontSize: 13 }}>
                        {log.action}
                      </Typography>
                      <Typography sx={{ color: "#7b8aa9", fontSize: 12 }}>
                        처리자: {log.actorId ?? "-"} · 시간: {log.occurredAt}
                      </Typography>
                      {(log.reasonCode || log.reasonText) && (
                        <Typography sx={{ color: "#7b8aa9", fontSize: 12 }}>
                          사유: {log.reasonCode ?? "-"} {log.reasonText ?? ""}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">감사 로그가 없습니다.</Typography>
              )}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <ReceptionExtensionsPanel scope="reception" entityId={receptionId} />
          </Stack>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary" fontWeight={800}>
        {label}
      </Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Stack>
  );
}
