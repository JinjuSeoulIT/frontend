"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { emergencyReceptionActions } from "@/features/EmergencyReception/EmergencyReceptionSlice";
import type {
  EmergencyReception,
  EmergencyReceptionForm,
  ReceptionStatus,
} from "@/features/EmergencyReception/EmergencyReceptionTypes";
import { fetchPatientApi } from "@/lib/reception/patientApi";
import ReceptionExtensionsPanel from "@/components/reception/ReceptionExtensionsPanel";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

const statusLabel = (value?: ReceptionStatus | string | null) => {
  switch ((value ?? "").toUpperCase()) {
    case "REGISTERED":
      return "응급 접수 완료";
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "TRIAGE":
      return "트리아지 진행";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "접수 완료";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "OBSERVATION":
      return "관찰중";
    case "ON_HOLD":
      return "보류";
    case "CANCELED":
      return "취소";
    case "INACTIVE":
      return "비활성";
    case "TRANSFERRED":
      return "전원";
    default:
      return value ?? "-";
  }
};

export default function EmergencyReceptionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.emergencyReceptions);

  const receptionId = params.id;
  const [patientName, setPatientName] = React.useState("-");

  React.useEffect(() => {
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  const p: EmergencyReception | null =
    selected && String(selected.receptionId) === receptionId ? selected : null;

  React.useEffect(() => {
    let mounted = true;
    const loadPatientName = async () => {
      if (!p?.patientId) {
        if (mounted) setPatientName("-");
        return;
      }
      try {
        const patient = await fetchPatientApi(p.patientId);
        if (!mounted) return;
        setPatientName(patient.name?.trim() || `환자 ${p.patientId}`);
      } catch {
        if (!mounted) return;
        setPatientName(`환자 ${p.patientId}`);
      }
    };
    void loadPatientName();
    return () => {
      mounted = false;
    };
  }, [p?.patientId]);

  const toUpdateForm = (
    value: EmergencyReception,
    nextStatus?: ReceptionStatus
  ): EmergencyReceptionForm => ({
    receptionNo: value.receptionNo,
    patientId: value.patientId,
    departmentId: value.departmentId,
    doctorId: value.doctorId ?? null,
    scheduledAt: value.scheduledAt ?? null,
    arrivedAt: value.arrivedAt ?? null,
    status: nextStatus ?? value.status,
    note: value.note ?? null,
    triageLevel: value.triageLevel,
    chiefComplaint: value.chiefComplaint,
    vitalTemp: value.vitalTemp ?? null,
    vitalBpSystolic: value.vitalBpSystolic ?? null,
    vitalBpDiastolic: value.vitalBpDiastolic ?? null,
    vitalHr: value.vitalHr ?? null,
    vitalRr: value.vitalRr ?? null,
    vitalSpo2: value.vitalSpo2 ?? null,
    arrivalMode: value.arrivalMode ?? null,
    triageNote: value.triageNote ?? null,
  });

  const onChangeStatus = (nextStatus: ReceptionStatus) => {
    if (!p) return;
    if (p.status === nextStatus) return;
    if (!confirm(`상태를 ${statusLabel(nextStatus)}로 변경하시겠습니까?`)) return;

    dispatch(
      emergencyReceptionActions.updateEmergencyReceptionRequest({
        receptionId,
        form: toUpdateForm(p, nextStatus),
      })
    );
    router.push("/reception/emergency/list");
  };

  return (
    <MainLayout>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          boxShadow: "0 12px 24px rgba(23, 52, 97, 0.12)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={900}>
                응급 접수 상세
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {loading ? "불러오는 중..." : error ?? "정상"}
              </Typography>
            </Box>

            <Divider />

            {p ? (
              <Stack spacing={1.2}>
                <Row label="접수 ID" value={String(p.receptionId)} />
                <Row label="접수번호" value={p.receptionNo} />
                <Row label="환자 이름" value={patientName} />
                <Row label="상태" value={statusLabel(p.status)} />
                <Row
                  label="중증도"
                  value={p.triageLevel == null ? "-" : String(p.triageLevel)}
                />
                <Row label="주호소" value={p.chiefComplaint ?? "-"} />
                <Row label="메모" value={p.note ?? "-"} />
              </Stack>
            ) : (
              <Typography color="text.secondary">선택된 응급 접수가 없습니다.</Typography>
            )}

            <Stack direction="row" spacing={1.25} flexWrap="wrap">
              <Button variant="outlined" onClick={() => router.push("/reception/emergency/list")}>
                뒤로
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push(`/reception/emergency/edit/${receptionId}`)}
                disabled={!p}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                color="error"
                disabled={!p || p.status === "CANCELED"}
                onClick={() => onChangeStatus("CANCELED")}
              >
                취소
              </Button>
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
      <Typography fontWeight={900}>{value}</Typography>
    </Stack>
  );
}
