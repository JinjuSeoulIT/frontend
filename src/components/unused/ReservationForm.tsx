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
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import type {
  DepartmentOption,
  DoctorOption,
  PatientOption,
  ReservationForm as ReservationFormPayload,
} from "@/features/Reservations/ReservationTypes";
import { fetchPatientsApi } from "@/lib/masterDataApi";
import { fetchReservationsApi } from "@/lib/reception/reservationAdminApi";
import { buildNextReceptionNumber } from "@/lib/reception/receptionNumber";

type ReservationFormState = {
  reservationNo: string;
  patientId: string;
  patientName: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  reservedAt: string;
  status: string;
  note: string;
};

type ReservationFormProps = {
  title: string;
  initial: ReservationFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  mode?: "create" | "edit";
  onSubmit: (form: ReservationFormPayload) => void;
  onCancel: () => void;
};

const statusOptions = [
  { value: "RESERVED", label: "예약" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELED", label: "취소" },
];

const departmentOptions: DepartmentOption[] = [
  { departmentId: 1, departmentName: "내과" },
  { departmentId: 2, departmentName: "외과" },
  { departmentId: 3, departmentName: "정형외과" },
  { departmentId: 4, departmentName: "신경외과" },
];

const doctorOptions: DoctorOption[] = [
  { doctorId: 1, doctorName: "송태민", departmentId: 1 },
  { doctorId: 2, doctorName: "이현석", departmentId: 2 },
  { doctorId: 3, doctorName: "성숙희", departmentId: 3 },
  { doctorId: 4, doctorName: "최효정", departmentId: 4 },
];

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const isPastDateTime = (value: string, now: Date = new Date()) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() < now.getTime();
};

export default function ReservationForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  mode = "create",
  onSubmit,
  onCancel,
}: ReservationFormProps) {
  const isEditMode = mode === "edit";
  const accent = isEditMode ? "#6d28d9" : "#7c3aed";
  const borderTone = isEditMode ? "rgba(109,40,217,0.26)" : "rgba(124,58,237,0.24)";
  const fieldSx = {
    "& .MuiInputBase-root": {
      bgcolor: "#f8f5ff",
      borderRadius: 2,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(109,40,217,0.28)" : "rgba(124,58,237,0.24)",
    },
    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(109,40,217,0.48)" : "rgba(124,58,237,0.42)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accent,
      borderWidth: "2px",
    },
  };

  const [form, setForm] = React.useState<ReservationFormState>(initial);
  const [patients, setPatients] = React.useState<PatientOption[]>([]);
  const [listError, setListError] = React.useState<string | null>(null);
  const [numberLoading, setNumberLoading] = React.useState(false);
  const [numberError, setNumberError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setListError(null);
        const [patientList] = await Promise.all([fetchPatientsApi()]);
        if (!mounted) return;
        setPatients(patientList);
      } catch (err) {
        if (!mounted) return;
        const message =
          err instanceof Error ? err.message : "목록을 불러오지 못했습니다.";
        setListError(message);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (initial.reservationNo.trim()) return;
    let mounted = true;

    const generate = async () => {
      try {
        setNumberLoading(true);
        setNumberError(null);
        const list = await fetchReservationsApi();
        const next = buildNextReceptionNumber({
          existingNumbers: list.map((item) => item.reservationNo),
          startSequence: 301,
        });
        if (!mounted) return;
        setForm((prev) => ({ ...prev, reservationNo: next }));
      } catch (err) {
        if (!mounted) return;
        const fallback = buildNextReceptionNumber({
          existingNumbers: [],
          startSequence: 301,
        });
        setForm((prev) => ({ ...prev, reservationNo: fallback }));
        setNumberError(err instanceof Error ? err.message : "자동 채번에 실패했습니다.");
      } finally {
        if (mounted) {
          setNumberLoading(false);
        }
      }
    };

    generate();
    return () => {
      mounted = false;
    };
  }, [initial.reservationNo]);

  const matchPatientId = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "";
    const found = patients.find((p) => p.patientName === trimmed);
    return found ? String(found.patientId) : "";
  };

  const getDoctorsByDepartment = (departmentId: string) => {
    const deptId = Number(departmentId);
    if (Number.isNaN(deptId)) return doctorOptions;
    return doctorOptions.filter((d) => (d.departmentId ?? null) === deptId);
  };

  const handleDepartmentChange = (value: string) => {
    const selected = departmentOptions.find((d) => String(d.departmentId) === value);
    const candidates = getDoctorsByDepartment(value);
    const autoDoctor = candidates[0];
    setForm((prev) => {
      const next = {
        ...prev,
        departmentId: value,
        departmentName: selected?.departmentName ?? "",
      };
      if (autoDoctor) {
        next.doctorId = String(autoDoctor.doctorId);
        next.doctorName = autoDoctor.doctorName ?? "";
      } else {
        next.doctorId = "";
        next.doctorName = "";
      }
      return next;
    });
  };

  const handleDoctorChange = (value: string) => {
    const selected = doctorOptions.find((d) => String(d.doctorId) === value);
    const dept = departmentOptions.find(
      (d) => String(d.departmentId) === String(selected?.departmentId ?? "")
    );
    setForm((prev) => ({
      ...prev,
      doctorId: value,
      doctorName: selected?.doctorName ?? "",
      departmentId: selected?.departmentId ? String(selected.departmentId) : prev.departmentId,
      departmentName: dept?.departmentName ?? prev.departmentName,
    }));
  };

  const handleSubmit = () => {
    if (!form.reservationNo.trim()) return;
    if (!isEditMode && isPastDateTime(form.reservedAt)) {
      alert("날짜가 이미 지났습니다.");
      return;
    }
    const patientId = toOptionalNumber(form.patientId);
    const departmentId = toOptionalNumber(form.departmentId);

    if (!form.patientName.trim() || !departmentId) return;

    const doctorId = toOptionalNumber(form.doctorId);

    onSubmit({
      reservationNo: form.reservationNo.trim(),
      patientId,
      patientName: toOptionalString(form.patientName) ?? null,
      departmentId,
      departmentName: toOptionalString(form.departmentName) ?? null,
      doctorId: doctorId ?? null,
      doctorName: toOptionalString(form.doctorName) ?? null,
      reservedAt: form.reservedAt,
      status: (form.status || "RESERVED") as ReservationFormPayload["status"],
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
          ? "linear-gradient(145deg, rgba(109,40,217,0.1), rgba(109,40,217,0.015) 45%)"
          : "linear-gradient(145deg, rgba(124,58,237,0.1), rgba(124,58,237,0.015) 45%)",
        boxShadow: "0 16px 32px rgba(38, 22, 77, 0.14)",
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
              icon={isEditMode ? <EditNoteRoundedIcon /> : <EventAvailableOutlinedIcon />}
              label={isEditMode ? "RESERVATION EDIT" : "RESERVATION CREATE"}
              size="small"
              sx={{
                width: "fit-content",
                bgcolor: isEditMode ? "rgba(109,40,217,0.13)" : "rgba(124,58,237,0.13)",
                color: accent,
                fontWeight: 800,
                "& .MuiChip-icon": { color: accent },
              }}
            />
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.2 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" fontWeight={700}>
              예약 정보를 확인하고 접수 일정을 저장하세요.
            </Typography>
          </Stack>
          <Box
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              border: `1px solid ${borderTone}`,
              bgcolor: "rgba(255,255,255,0.82)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#6f6a87", fontWeight: 700 }}>
              처리 상태
            </Typography>
            <Typography sx={{ fontSize: 14, color: accent, fontWeight: 900 }}>
              {isEditMode ? "예약 정보 수정" : "신규 예약 등록"}
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
          }}
        >
          <TextField
            label="예약번호"
            value={form.reservationNo}
            required
            fullWidth
            InputProps={{ readOnly: true }}
            helperText={
              numberError
                ? "자동 채번 조회에 실패해 기본 번호를 넣었습니다."
                : "예약번호는 자동 생성됩니다."
            }
            sx={fieldSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="환자 이름"
              value={form.patientName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  patientName: e.target.value,
                  patientId: matchPatientId(e.target.value),
                }))
              }
              required
              fullWidth
              sx={fieldSx}
            />
            <TextField
              select
              label="진료과"
              value={form.departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              required
              fullWidth
              sx={fieldSx}
            >
              {departmentOptions.map((d) => (
                <MenuItem key={d.departmentId} value={String(d.departmentId)}>
                  {d.departmentName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="의사 이름"
              value={form.doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              fullWidth
              sx={fieldSx}
            >
              {getDoctorsByDepartment(form.departmentId).map((d) => (
                <MenuItem key={d.doctorId} value={String(d.doctorId)}>
                  {d.doctorName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="datetime-local"
              label="예약 시간"
              InputLabelProps={{ shrink: true }}
              inputProps={!isEditMode ? { min: formatDateTimeLocal(new Date()) } : undefined}
              value={form.reservedAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reservedAt: e.target.value }))
              }
              fullWidth
              sx={fieldSx}
            />
          </Stack>
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

        {listError && (
          <Typography color="error" fontWeight={800}>
            {listError}
          </Typography>
        )}

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
              borderColor: isEditMode ? "rgba(109,40,217,0.5)" : "rgba(124,58,237,0.45)",
              color: accent,
              fontWeight: 800,
              bgcolor: "rgba(255,255,255,0.86)",
              "&:hover": { borderColor: accent, bgcolor: "rgba(124,58,237,0.06)" },
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              numberLoading ||
              !form.reservationNo.trim() ||
              !form.patientName.trim() ||
              !form.departmentId.trim() ||
              !form.reservedAt.trim()
            }
            sx={{
              bgcolor: accent,
              px: 2.25,
              fontWeight: 900,
              borderRadius: 2,
              boxShadow: isEditMode
                ? "0 10px 20px rgba(109,40,217,0.28)"
                : "0 10px 20px rgba(124,58,237,0.28)",
              "&:hover": { bgcolor: isEditMode ? "#5b21b6" : "#6d28d9" },
            }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

