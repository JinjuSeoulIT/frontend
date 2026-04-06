"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { reservationActions } from "@/features/Reservations/ReservationSlice";
import type {
  Reservation,
  ReservationForm,
  ReservationStatus,
} from "@/features/Reservations/ReservationTypes";
import ReceptionExtensionsPanel from "@/components/reception/ReceptionExtensionsPanel";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.reservations);

  const reservationId = params.id;

  React.useEffect(() => {
    dispatch(reservationActions.fetchReservationRequest({ reservationId }));
  }, [dispatch, reservationId]);

  const p: Reservation | null =
    selected && String(selected.reservationId) === reservationId ? selected : null;

  const toUpdateForm = (
    value: Reservation,
    nextStatus?: ReservationStatus
  ): ReservationForm => ({
    reservationNo: value.reservationNo,
    patientId: value.patientId ?? null,
    patientName: value.patientName ?? null,
    departmentId: value.departmentId,
    departmentName: value.departmentName ?? null,
    doctorId: value.doctorId ?? null,
    doctorName: value.doctorName ?? null,
    reservedAt: value.reservedAt,
    status: nextStatus ?? value.status,
    note: value.note ?? null,
  });

  const onChangeStatus = (nextStatus: ReservationStatus) => {
    if (!p) return;
    if (p.status === nextStatus) return;
    if (!confirm(`상태를 ${nextStatus}로 변경하시겠습니까?`)) return;

    dispatch(
      reservationActions.updateReservationRequest({
        reservationId,
        form: toUpdateForm(p, nextStatus),
      })
    );
    router.push("/reception/reservation/list");
  };

  const statusLabel = (value?: ReservationStatus | string | null) => {
    switch ((value ?? "").toUpperCase()) {
      case "RESERVED":
        return "예약";
      case "COMPLETED":
        return "완료";
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
                예약 상세
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? "불러오는 중..." : error ?? "정상"}
              </Typography>
            </Box>

            <Divider />

            {p ? (
              <Stack spacing={1}>
                <Row label="예약 ID" value={String(p.reservationId)} />
                <Row label="예약번호" value={p.reservationNo} />
                <Row label="환자" value={p.patientName ?? String(p.patientId)} />
                <Row label="진료과" value={p.departmentName ?? String(p.departmentId)} />
                <Row
                  label="의사"
                  value={p.doctorName ?? (p.doctorId ? String(p.doctorId) : "-")}
                />
                <Row label="예약 시간" value={p.reservedAt} />
                <Row label="상태" value={statusLabel(p.status)} />
                <Row label="메모" value={p.note ?? "-"} />
              </Stack>
            ) : (
              <Typography color="text.secondary">선택된 예약이 없습니다.</Typography>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" onClick={() => router.push("/reception/reservation/list")}>
                뒤로
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push(`/reception/reservation/edit/${reservationId}`)}
                disabled={!p}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                color="error"
                disabled={!p}
                onClick={() => onChangeStatus("CANCELED")}
              >
                취소
              </Button>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <ReceptionExtensionsPanel scope="reservation" entityId={reservationId} />
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
