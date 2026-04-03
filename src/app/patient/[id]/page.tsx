"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import type { PatientRestriction } from "@/lib/patient/restrictionApi";
import { fetchPatientRestrictionsApi } from "@/lib/patient/restrictionApi";
import type { PatientFlag } from "@/lib/patient/flagApi";
import { fetchPatientFlagsApi } from "@/lib/patient/flagApi";
import { changePatientStatusApi } from "@/lib/reception/patientApi";
import { fetchCodesApi } from "@/lib/admin/codeApi";
import { createReservationApi } from "@/lib/reception/reservationAdminApi";
import { createReceptionApi } from "@/lib/reception/receptionApi";

import {
  toApiDateTime,
  toLocalDateTime,
  toTodayDateTime,
  resolveErrorMessage,
  departments,
  defaultDepartment,
  type Option,
  type ReceptionForm,
  type ReservationForm,
} from "@/components/patient/detail/PatientDetailUtils";
import PatientDetailHeader from "@/components/patient/detail/PatientDetailHeader";
import PatientDetailQuickActions from "@/components/patient/detail/PatientDetailQuickActions";
import PatientDetailCards from "@/components/patient/detail/PatientDetailCards";
import PatientStatusDialog from "@/components/patient/detail/PatientStatusDialog";
import PatientReceptionDialog from "@/components/patient/detail/PatientReceptionDialog";
import PatientReservationDialog from "@/components/patient/detail/PatientReservationDialog";
import PatientFormModal from "@/components/patient/PatientFormModal";
import PatientInsuranceContent from "@/components/patient/detail/PatientInsuranceContent";
import PatientConsentContent from "@/components/patient/detail/PatientConsentContent";
import PatientMemoContent from "@/components/patient/detail/PatientMemoContent";
import PatientRestrictContent from "@/components/patient/detail/PatientRestrictContent";
import PatientFlagContent from "@/components/patient/detail/PatientFlagContent";
import PatientInfoHistoryContent from "@/components/patient/detail/PatientInfoHistoryContent";
import PatientStatusHistoryContent from "@/components/patient/detail/PatientStatusHistoryContent";

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const patientId = Number(params.id);

  const { selected: p, loading, error } = useSelector((s: RootState) => s.patients);

  const [restrictions, setRestrictions] = React.useState<PatientRestriction[]>([]);
  const [flags, setFlags] = React.useState<PatientFlag[]>([]);

  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusCode, setStatusCode] = React.useState("");
  const [statusReason, setStatusReason] = React.useState("");
  const [statusChangedBy, setStatusChangedBy] = React.useState("");
  const [statusSaving, setStatusSaving] = React.useState(false);

  const [statusOptions, setStatusOptions] = React.useState<Option[]>([]);
  const [flagOptions, setFlagOptions] = React.useState<Option[]>([]);
  const [restrictionOptions, setRestrictionOptions] = React.useState<Option[]>([]);

  const [vipUpdating, setVipUpdating] = React.useState(false);
  const [receptionDialogOpen, setReceptionDialogOpen] = React.useState(false);
  const [receptionSaving, setReceptionSaving] = React.useState(false);
  const [receptionForm, setReceptionForm] = React.useState<ReceptionForm>({
    deptCode: defaultDepartment.name,
    doctorId: String(defaultDepartment.doctorId),
    visitType: "OUTPATIENT",
    arrivedAt: "",
    note: "",
  });

  const [reservationDialogOpen, setReservationDialogOpen] = React.useState(false);
  const [reservationSaving, setReservationSaving] = React.useState(false);
  const [reservationForm, setReservationForm] = React.useState<ReservationForm>({
    deptCode: defaultDepartment.name,
    doctorId: String(defaultDepartment.doctorId),
    scheduledAt: "",
    note: "",
  });

  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  type CardModalType =
    | "insurance"
    | "consent"
    | "memo"
    | "restriction"
    | "flag"
    | "info-history"
    | "status-history";
  const [cardModalType, setCardModalType] = React.useState<CardModalType | null>(null);

  React.useEffect(() => {
    dispatch(patientActions.fetchPatientRequest({ patientId }));
  }, [dispatch, patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadRestrictions = async () => {
      if (!patientId) return;
      try {
        const res = await fetchPatientRestrictionsApi(patientId);
        if (mounted) setRestrictions(res);
      } catch {
        if (mounted) setRestrictions([]);
      }
    };
    loadRestrictions();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadFlags = async () => {
      if (!patientId) return;
      try {
        const res = await fetchPatientFlagsApi(patientId);
        if (mounted) setFlags(res);
      } catch {
        if (mounted) setFlags([]);
      }
    };
    loadFlags();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadCodes = async () => {
      try {
        const [statusList, flagList, restrictionList] = await Promise.all([
          fetchCodesApi("PATIENT_STATUS"),
          fetchCodesApi("PATIENT_FLAG"),
          fetchCodesApi("PATIENT_RESTRICTION"),
        ]);

        if (!mounted) return;
        setStatusOptions(statusList.map((c) => ({ value: c.code, label: c.name })));
        setFlagOptions(flagList.map((c) => ({ value: c.code, label: c.name })));
        setRestrictionOptions(restrictionList.map((c) => ({ value: c.code, label: c.name })));
      } catch {
        if (!mounted) return;
        setStatusOptions([]);
        setFlagOptions([]);
        setRestrictionOptions([]);
      }
    };

    loadCodes();
    return () => {
      mounted = false;
    };
  }, []);

  const onDelete = () => {
    if (!p) return;
    if (!confirm("환자를 비활성 처리할까요?")) return;
    dispatch(patientActions.deletePatientRequest(p.patientId));
    router.replace("/patient/list");
  };

  const openStatusDialog = () => {
    setStatusCode(p?.statusCode ?? statusOptions[0]?.value ?? "");
    setStatusReason("");
    setStatusChangedBy("");
    setStatusDialogOpen(true);
  };

  const toggleVip = (checked: boolean) => {
    if (!p) return;
    if (!confirm(checked ? "VIP로 지정할까요?" : "VIP를 해제할까요?")) return;
    try {
      setVipUpdating(true);
      dispatch(
        patientActions.updatePatientVipRequest({
          patientId: p.patientId,
          isVip: checked,
        })
      );
    } finally {
      setVipUpdating(false);
    }
  };

  const openEditDialog = () => {
    if (!p) return;
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
  };

  const saveEdit = (form: PatientFormPayload) => {
    if (!p) return;
    dispatch(patientActions.updatePatientRequest({ patientId: p.patientId, form }));
    setEditDialogOpen(false);
    dispatch(patientActions.fetchPatientRequest({ patientId: p.patientId }));
  };

  const saveStatus = async () => {
    if (!patientId || !statusCode) return;
    try {
      setStatusSaving(true);
      await changePatientStatusApi(patientId, {
        statusCode,
        reason: statusReason.trim() || undefined,
        changedBy: statusChangedBy.trim() || undefined,
      });
      setStatusDialogOpen(false);
      dispatch(patientActions.fetchPatientRequest({ patientId }));
    } finally {
      setStatusSaving(false);
    }
  };

  const openReservationDialog = () => {
    setReservationForm({
      deptCode: defaultDepartment.name,
      doctorId: String(defaultDepartment.doctorId),
      scheduledAt: "",
      note: "",
    });
    setReservationDialogOpen(true);
  };

  const openReceptionDialog = () => {
    setReceptionForm({
      deptCode: defaultDepartment.name,
      doctorId: String(defaultDepartment.doctorId),
      visitType: "OUTPATIENT",
      arrivedAt: "",
      note: "",
    });
    setReceptionDialogOpen(true);
  };

  const saveReservation = async () => {
    if (!p) return;
    if (!reservationForm.scheduledAt) {
      alert("예약 일시는 필수입니다.");
      return;
    }

    try {
      setReservationSaving(true);
      const reservedAt = toApiDateTime(reservationForm.scheduledAt);
      if (!reservedAt) {
        alert("예약 일시 형식이 올바르지 않습니다.");
        return;
      }

      const selectedDept = departments.find((dept) => dept.name === reservationForm.deptCode);
      const selectedByDoctor = departments.find((dept) => String(dept.doctorId) === reservationForm.doctorId);
      const resolvedDept = selectedDept ?? selectedByDoctor ?? defaultDepartment;

      await createReservationApi({
        reservationNo: "",
        patientId: p.patientId,
        patientName: p.name,
        departmentId: resolvedDept.id,
        departmentName: resolvedDept.name,
        doctorId: Number(reservationForm.doctorId || resolvedDept.doctorId),
        doctorName: resolvedDept.doctor,
        reservedAt,
        status: "RESERVED",
        note: reservationForm.note?.trim() || null,
      });

      setReservationDialogOpen(false);
      alert("예약이 등록되었습니다.");
    } catch (err: unknown) {
      console.error("saveReservation failed", err);
      alert(`예약 등록에 실패했습니다.\n원인: ${resolveErrorMessage(err, "알 수 없는 오류")}`);
    } finally {
      setReservationSaving(false);
    }
  };

  const saveReception = async () => {
    if (!p) return;

    try {
      setReceptionSaving(true);
      const selectedDept = departments.find((dept) => dept.name === receptionForm.deptCode);
      const selectedByDoctor = departments.find((dept) => String(dept.doctorId) === receptionForm.doctorId);
      const resolvedDept = selectedDept ?? selectedByDoctor ?? defaultDepartment;

      await createReceptionApi({
        receptionNo: "",
        patientId: p.patientId,
        visitType: "OUTPATIENT",
        departmentId: resolvedDept.id,
        doctorId: Number(receptionForm.doctorId || resolvedDept.doctorId),
        arrivedAt: toTodayDateTime(receptionForm.arrivedAt) ?? toLocalDateTime(),
        note: receptionForm.note?.trim() || "환자 상세 화면에서 접수 등록",
      });

      setReceptionDialogOpen(false);
      router.push("/reception/outpatient/list")
    } catch (err: unknown) {
      alert(`접수 등록에 실패했습니다.\n원인: ${resolveErrorMessage(err, "알 수 없는 오류")}`);
    } finally {
      setReceptionSaving(false);
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid #dbe5f5",
            boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={3} alignItems="stretch">
              <Grid size={{ xs: 12, md: 9 }}>
                <PatientDetailHeader
                  patient={p}
                  loading={loading}
                  restrictions={restrictions}
                  flags={flags}
                  statusOptions={statusOptions}
                  flagOptions={flagOptions}
                  restrictionOptions={restrictionOptions}
                  vipUpdating={vipUpdating}
                  onToggleVip={toggleVip}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack spacing={1.5} alignItems={{ xs: "stretch", md: "flex-end" }}>
                  <PatientDetailQuickActions
                    patient={p}
                    statusOptionsCount={statusOptions.length}
                    onBack={() => router.back()}
                    onOpenReceptionDialog={openReceptionDialog}
                    onOpenReservationDialog={openReservationDialog}
                    onOpenStatusDialog={openStatusDialog}
                    onOpenEditDialog={openEditDialog}
                    onDelete={onDelete}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                {error && (
                  <Typography color="error" fontWeight={900} sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <PatientDetailCards patientId={patientId} onOpenModal={setCardModalType} />
      </Stack>

      <PatientStatusDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        statusCode={statusCode}
        statusReason={statusReason}
        statusChangedBy={statusChangedBy}
        onStatusCodeChange={setStatusCode}
        onStatusReasonChange={setStatusReason}
        onStatusChangedByChange={setStatusChangedBy}
        statusOptions={statusOptions}
        saving={statusSaving}
        onSave={saveStatus}
      />

      <PatientReceptionDialog
        open={receptionDialogOpen}
        onClose={() => setReceptionDialogOpen(false)}
        form={receptionForm}
        onFormChange={setReceptionForm}
        departments={departments}
        saving={receptionSaving}
        onSave={saveReception}
      />

      <PatientReservationDialog
        open={reservationDialogOpen}
        onClose={() => setReservationDialogOpen(false)}
        form={reservationForm}
        onFormChange={setReservationForm}
        departments={departments}
        saving={reservationSaving}
        onSave={saveReservation}
      />

      <PatientFormModal
        open={editDialogOpen}
        onClose={closeEditDialog}
        mode="edit"
        patient={p}
        loading={loading}
        error={error}
        onSubmit={saveEdit}
        onDelete={p ? () => onDelete() : undefined}
      />

      <Dialog
        open={!!cardModalType}
        onClose={() => setCardModalType(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>
          {cardModalType === "insurance" && "보험"}
          {cardModalType === "consent" && "동의서"}
          {cardModalType === "memo" && "메모"}
          {cardModalType === "restriction" && "제한"}
          {cardModalType === "flag" && "플래그"}
          {cardModalType === "info-history" && "정보 변경 이력"}
          {cardModalType === "status-history" && "상태 변경 이력"}
        </DialogTitle>
        <DialogContent>
          {cardModalType === "insurance" && patientId && (
            <PatientInsuranceContent
              patientId={patientId}
              onClose={() => setCardModalType(null)}
            />
          )}
          {cardModalType === "consent" && patientId && (
            <PatientConsentContent
              patientId={patientId}
              onClose={() => setCardModalType(null)}
            />
          )}
          {cardModalType === "memo" && patientId && (
            <PatientMemoContent patientId={patientId} onClose={() => setCardModalType(null)} />
          )}
          {cardModalType === "restriction" && patientId && (
            <PatientRestrictContent patientId={patientId} onClose={() => setCardModalType(null)} />
          )}
          {cardModalType === "flag" && patientId && (
            <PatientFlagContent patientId={patientId} onClose={() => setCardModalType(null)} />
          )}
          {cardModalType === "info-history" && patientId && (
            <PatientInfoHistoryContent patientId={patientId} onClose={() => setCardModalType(null)} />
          )}
          {cardModalType === "status-history" && patientId && (
            <PatientStatusHistoryContent patientId={patientId} onClose={() => setCardModalType(null)} />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
