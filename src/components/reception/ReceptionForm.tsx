"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import type { ReceptionForm as ReceptionFormPayload } from "@/features/Reception/ReceptionTypes";
import type { DepartmentOption, DoctorOption } from "@/features/Reservations/ReservationTypes";
import { fetchDepartmentsApi, fetchDoctorsApi } from "@/lib/masterDataApi";

type ReceptionFormState = {
  receptionNo: string;
  patientId?: number | null;
  patientName: string;
  departmentId: string;
  doctorId: string;
  visitType: string;
  scheduledAt: string;
  arrivedAt: string;
  status: string;
  note: string;
};

type ReceptionFormProps = {
  title: string;
  initial: ReceptionFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  showScheduledAt?: boolean;
  mode?: "create" | "edit";
  onSubmit: (form: ReceptionFormPayload) => void;
  onCancel: () => void;
};

const statusOptions = [
  { value: "WAITING", label: "대기" },
  { value: "CALLED", label: "호출" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
];

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export default function ReceptionForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  showScheduledAt = true,
  mode = "create",
  onSubmit,
  onCancel,
}: ReceptionFormProps) {
  const isEditMode = mode === "edit";
  const accent = isEditMode ? "#0f766e" : "#2b5aa9";
  const accentSoft = isEditMode ? "rgba(15,118,110,0.14)" : "rgba(43,90,169,0.12)";
  const borderTone = isEditMode ? "rgba(15,118,110,0.2)" : "rgba(43,90,169,0.2)";

  const [form, setForm] = React.useState<ReceptionFormState>(initial);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [doctors, setDoctors] = React.useState<DoctorOption[]>([]);
  const [masterDataLoading, setMasterDataLoading] = React.useState(false);
  const [masterDataError, setMasterDataError] = React.useState<string | null>(null);
  const fieldSx = {
    "& .MuiInputBase-root": {
      bgcolor: "#f7faff",
      borderRadius: 2,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(15,118,110,0.24)" : "rgba(43,90,169,0.18)",
    },
    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(15,118,110,0.45)" : "rgba(43,90,169,0.38)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accent,
      borderWidth: "2px",
    },
  };

  React.useEffect(() => {
    setForm({ ...initial, visitType: "OUTPATIENT" });
  }, [initial]);

  React.useEffect(() => {
    let active = true;
    const loadMasterData = async () => {
      try {
        setMasterDataLoading(true);
        setMasterDataError(null);
        const [departmentList, doctorList] = await Promise.all([
          fetchDepartmentsApi(),
          fetchDoctorsApi(),
        ]);
        if (!active) return;
        setDepartments(departmentList);
        setDoctors(doctorList);
      } catch (err: unknown) {
        if (!active) return;
        const message =
          err instanceof Error && err.message ? err.message : "진료과/의사 목록 조회 실패";
        setMasterDataError(message);
      } finally {
        if (!active) return;
        setMasterDataLoading(false);
      }
    };
    void loadMasterData();
    return () => {
      active = false;
    };
  }, []);

  const doctorsByDepartment = React.useMemo(() => {
    const selectedDepartmentId = form.departmentId.trim();
    if (!selectedDepartmentId) return doctors;
    return doctors.filter(
      (doctor) => (doctor.departmentId ?? "") === selectedDepartmentId
    );
  }, [doctors, form.departmentId]);
 // 진료과를 선택하면 자동으로 진료과에 맞는 의사가 선택됨
  const handleSubmit = () => {
    if (!form.patientName.trim()) return;
    const departmentId = toOptionalString(form.departmentId);
    if (!departmentId) return;

    const doctorId = Number(form.doctorId.trim() || "");

    onSubmit({
      receptionNo: isEditMode ? form.receptionNo.trim() : "",
      patientName: form.patientName.trim(),
      patientId: form.patientId ?? null,
      visitType: "OUTPATIENT",
      departmentId,
      departmentName: null,
      doctorId: Number.isFinite(doctorId) ? doctorId : null,
      doctorName: null,
      scheduledAt: toOptionalString(form.scheduledAt),
      arrivedAt: toOptionalString(form.arrivedAt),
      status: (form.status || "WAITING") as ReceptionFormPayload["status"],
      note: toOptionalString(form.note) ?? null,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: `1px solid ${borderTone}`,
        bgcolor: "white",
        background: isEditMode
          ? "linear-gradient(145deg, rgba(15,118,110,0.1), rgba(15,118,110,0.015) 45%)"
          : "linear-gradient(145deg, rgba(43,90,169,0.08), rgba(43,90,169,0.01) 45%)",
        boxShadow: "0 16px 32px rgba(23, 52, 97, 0.14)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.25}
        >
          <Stack spacing={0.75}>
            <Chip
              icon={isEditMode ? <EditNoteRoundedIcon /> : <LocalHospitalOutlinedIcon />}
              label={isEditMode ? "OUTPATIENT EDIT" : "OUTPATIENT RECEPTION"}
              size="small"
              sx={{
                width: "fit-content",
                bgcolor: accentSoft,
                color: accent,
                fontWeight: 800,
                "& .MuiChip-icon": { color: accent },
              }}
            />
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.2 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" fontWeight={700}>
              환자 기본 정보와 상태를 확인하고 접수를 완료하세요.
            </Typography>
          </Stack>
          <Box
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              border: `1px solid ${borderTone}`,
              bgcolor: "rgba(255,255,255,0.75)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#61708f", fontWeight: 700 }}>
              처리 상태
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#2b5aa9", fontWeight: 900 }}>
              {isEditMode ? "접수 수정 진행" : "신규 접수 준비"}
            </Typography>
          </Box>
        </Stack>
        <Divider />

        <Stack
          spacing={2}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 2.5,
            border: "1px solid rgba(148, 163, 184, 0.2)",
            bgcolor: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(2px)",
          }}
        >
          <TextField
            label="접수번호"
            value={form.receptionNo}
            required
            fullWidth
            InputProps={{ readOnly: true }}
            helperText="접수번호는 서버에서 자동 생성됩니다."
            sx={fieldSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Box sx={{ position: "relative", width: "100%" }}>
              <TextField
                label="환자 이름"
                value={form.patientName}
                onChange={(e) => {
                  if (isEditMode) return;
                  setForm((prev) => ({
                    ...prev,
                    patientName: e.target.value,
                    patientId: null,
                  }));
                }}
                InputProps={{ readOnly: isEditMode }}
                required
                fullWidth
                helperText={
                  isEditMode ? undefined : "환자관리에 등록된 환자만 접수할 수 있습니다."
                }
                sx={fieldSx}
              />
            </Box>
            <TextField
              select
              label="진료과"
              value={form.departmentId}
              onChange={(e) => {
                const departmentId = e.target.value;
                const nextDoctorId =
                  doctors.find(
                    (doctor) => String(doctor.departmentId ?? "") === departmentId
                  )?.doctorId ?? "";
                setForm((prev) => ({
                  ...prev,
                  departmentId,
                  doctorId: nextDoctorId ? String(nextDoctorId) : "",
                }));
              }}
              required
              fullWidth
              sx={fieldSx}
            >
              {departments.map((opt) => (
                <MenuItem key={opt.departmentId} value={String(opt.departmentId)}>
                  {opt.departmentName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="의사 이름"
              value={form.doctorId}
              onChange={(e) => {
                const doctorId = e.target.value;
                const doctor = doctors.find(
                  (item) => String(item.doctorId) === doctorId
                );
                setForm((prev) => ({
                  ...prev,
                  doctorId,
                  departmentId: doctor?.departmentId ? String(doctor.departmentId) : prev.departmentId,
                }));
              }}
              fullWidth
              sx={fieldSx}
            >
              {doctorsByDepartment.map((opt) => (
                <MenuItem key={opt.doctorId} value={String(opt.doctorId)}>
                  {opt.doctorName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {masterDataError && (
            <Typography color="error" fontWeight={800}>
              {masterDataError}
            </Typography>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="내원 유형"
              value="외래"
              fullWidth
              InputProps={{ readOnly: true }}
              sx={fieldSx}
            />
            <TextField
              select
              label="상태"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              fullWidth
              sx={fieldSx}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {showScheduledAt ? (
              <TextField
                type="datetime-local"
                label="예약 시간"
                InputLabelProps={{ shrink: true }}
                value={form.scheduledAt}
                onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                fullWidth
                sx={fieldSx}
              />
            ) : null}
            <TextField
              type="datetime-local"
              label="도착 시간"
              InputLabelProps={{ shrink: true }}
              value={form.arrivedAt}
              onChange={(e) => setForm((prev) => ({ ...prev, arrivedAt: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <TextField
            label="메모"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
            sx={fieldSx}
          />
        </Stack>

        {error && (
          <Typography color="error" fontWeight={800}>
            {error}
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              borderColor: isEditMode ? "rgba(15,118,110,0.45)" : "rgba(43,90,169,0.35)",
              color: accent,
              fontWeight: 800,
              bgcolor: "rgba(255,255,255,0.84)",
              "&:hover": {
                borderColor: accent,
                bgcolor: isEditMode ? "rgba(15,118,110,0.08)" : "rgba(43,90,169,0.06)",
              },
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              masterDataLoading ||
              !form.patientName.trim() ||
              !form.departmentId.trim()
            }
            sx={{
              bgcolor: accent,
              px: 2.25,
              fontWeight: 900,
              borderRadius: 2,
              boxShadow: isEditMode
                ? "0 10px 20px rgba(15,118,110,0.28)"
                : "0 10px 20px rgba(43,90,169,0.28)",
              "&:hover": { bgcolor: isEditMode ? "#0d5f58" : "#244e95" },
            }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

