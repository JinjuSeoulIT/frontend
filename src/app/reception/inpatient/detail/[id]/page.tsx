"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { inpatientReceptionActions } from "@/features/InpatientReception/InpatientReceptionSlice";
import type {
  InpatientReception,
  InpatientReceptionForm,
  ReceptionStatus,
} from "@/features/InpatientReception/InpatientReceptionTypes";
import ReceptionExtensionsPanel from "@/components/reception/ReceptionExtensionsPanel";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

export default function InpatientReceptionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.inpatientReceptions);

  const receptionId = params.id;

  React.useEffect(() => {
    dispatch(inpatientReceptionActions.fetchInpatientReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  const p: InpatientReception | null =
    selected && String(selected.receptionId) === receptionId ? selected : null;

  const toUpdateForm = (
    value: InpatientReception,
    nextStatus?: ReceptionStatus
  ): InpatientReceptionForm => ({
    receptionNo: value.receptionNo,
    patientId: value.patientId,
    departmentId: value.departmentId,
    doctorId: value.doctorId ?? null,
    scheduledAt: value.scheduledAt ?? null,
    arrivedAt: value.arrivedAt ?? null,
    status: nextStatus ?? value.status,
    note: value.note ?? null,
    admissionPlanAt: value.admissionPlanAt,
    wardId: value.wardId ?? null,
    roomId: value.roomId ?? null,
  });

  const onChangeStatus = (nextStatus: ReceptionStatus) => {
    if (!p) return;
    if (p.status === nextStatus) return;
    if (!confirm(`상태를 ${nextStatus}로 변경하시겠습니까?`)) return;

    dispatch(
      inpatientReceptionActions.updateInpatientReceptionRequest({
        receptionId,
        form: toUpdateForm(p, nextStatus),
      })
    );
    router.push("/reception/inpatient/list");
  };

  const statusLabel = (value?: ReceptionStatus | string | null) => {
    switch ((value ?? "").toUpperCase()) {
      case "WAITING":
        return "대기";
      case "CALLED":
        return "호출";
      case "IN_PROGRESS":
        return "진행중";
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
                입원 접수 상세
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
                <Row label="환자 ID" value={String(p.patientId)} />
                <Row label="진료과 ID" value={String(p.departmentId)} />
                <Row label="의사 ID" value={p.doctorId ? String(p.doctorId) : "-"} />
                <Row label="입원 예정" value={p.admissionPlanAt ?? "-"} />
                <Row label="병동 ID" value={p.wardId ? String(p.wardId) : "-"} />
                <Row label="병실 ID" value={p.roomId ? String(p.roomId) : "-"} />
                <Row label="상태" value={statusLabel(p.status)} />
                <Row label="메모" value={p.note ?? "-"} />
              </Stack>
            ) : (
              <Typography color="text.secondary">선택된 입원 접수가 없습니다.</Typography>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" onClick={() => router.push("/reception/inpatient/list")}>
                뒤로
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push(`/reception/inpatient/edit/${receptionId}`)}
                disabled={!p}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                color="success"
                disabled={!p}
                onClick={() => onChangeStatus("COMPLETED")}
              >
                완료
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

            <ReceptionExtensionsPanel scope="inpatient" entityId={receptionId} />
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
