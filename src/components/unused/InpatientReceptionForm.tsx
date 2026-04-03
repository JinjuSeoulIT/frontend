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
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import type { InpatientReceptionForm as InpatientReceptionFormPayload } from "@/features/InpatientReception/InpatientReceptionTypes";
import type {
  DepartmentOption,
  DoctorOption,
  PatientOption,
} from "@/features/Reservations/ReservationTypes";
import { fetchInpatientReceptionsApi } from "@/lib/reception/inpatientReceptionApi";
import { fetchPatientsApi } from "@/lib/masterDataApi";
import { buildNextReceptionNumber } from "@/lib/reception/receptionNumber";

type InpatientReceptionFormState = {
  receptionNo: string;
  patientId: string;
  departmentId: string;
  doctorId: string;
  scheduledAt: string;
  arrivedAt: string;
  status: string;
  note: string;
  admissionPlanAt: string;
  wardId: string;
  roomId: string;
};

type InpatientReceptionFormProps = {
  title: string;
  initial: InpatientReceptionFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  mode?: "create" | "edit";
  onSubmit: (form: InpatientReceptionFormPayload) => void;
  onCancel: () => void;
};

const statusOptions = [
  { value: "WAITING", label: "대기" },
  { value: "CALLED", label: "호출" },
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료" },
  { value: "PAYMENT_WAIT", label: "수납대기" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
  { value: "INACTIVE", label: "비활성" },
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

export default function InpatientReceptionForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  mode = "create",
  onSubmit,
  onCancel,
}: InpatientReceptionFormProps) {
  const isEditMode = mode === "edit";
  const accent = isEditMode ? "#0f766e" : "#0b7285";
  const borderTone = isEditMode ? "rgba(15,118,110,0.24)" : "rgba(11,114,133,0.24)";
  const fieldSx = {
    "& .MuiInputBase-root": {
      bgcolor: "#f3fbfb",
      borderRadius: 2,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(15,118,110,0.28)" : "rgba(11,114,133,0.24)",
    },
    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(15,118,110,0.46)" : "rgba(11,114,133,0.42)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accent,
      borderWidth: "2px",
    },
  };

  const [form, setForm] = React.useState<InpatientReceptionFormState>(initial);
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
        const patientList = await fetchPatientsApi();
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
    if (initial.receptionNo.trim()) return;
    let mounted = true;

    const generate = async () => {
      try {
        setNumberLoading(true);
        setNumberError(null);
        const list = await fetchInpatientReceptionsApi();
        const next = buildNextReceptionNumber({
          existingNumbers: list.map((item) => item.receptionNo),
          startSequence: 201,
        });
        if (!mounted) return;
        setForm((prev) => ({ ...prev, receptionNo: next }));
      } catch (err) {
        if (!mounted) return;
        const fallback = buildNextReceptionNumber({
          existingNumbers: [],
          startSequence: 201,
        });
        setForm((prev) => ({ ...prev, receptionNo: fallback }));
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
  }, [initial.receptionNo]);

  const getDoctorsByDepartment = (departmentId: string) => {
    const deptId = Number(departmentId);
    if (Number.isNaN(deptId)) return doctorOptions;
    return doctorOptions.filter((d) => (d.departmentId ?? null) === deptId);
  };

  const handleDepartmentChange = (value: string) => {
    const candidates = getDoctorsByDepartment(value);
    const autoDoctor = candidates[0];
    setForm((prev) => ({
      ...prev,
      departmentId: value,
      doctorId: autoDoctor ? String(autoDoctor.doctorId) : "",
    }));
  };

  const handleDoctorChange = (value: string) => {
    const selected = doctorOptions.find((d) => String(d.doctorId) === value);
    setForm((prev) => ({
      ...prev,
      doctorId: value,
      departmentId: selected?.departmentId ? String(selected.departmentId) : prev.departmentId,
    }));
  };

  const handleSubmit = () => {
    if (!form.receptionNo.trim()) return;
    const patientId = toOptionalNumber(form.patientId);
    const departmentId = toOptionalNumber(form.departmentId);

    if (!patientId || !departmentId || !form.admissionPlanAt.trim()) return;

    onSubmit({
      receptionNo: form.receptionNo.trim(),
      patientId,
      departmentId,
      doctorId: toOptionalNumber(form.doctorId) ?? null,
      scheduledAt: toOptionalString(form.scheduledAt),
      arrivedAt: toOptionalString(form.arrivedAt),
      status: (form.status || "WAITING") as InpatientReceptionFormPayload["status"],
      note: toOptionalString(form.note) ?? null,
      admissionPlanAt: form.admissionPlanAt,
      wardId: toOptionalNumber(form.wardId),
      roomId: toOptionalNumber(form.roomId),
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
          : "linear-gradient(145deg, rgba(11,114,133,0.1), rgba(11,114,133,0.015) 45%)",
        boxShadow: "0 16px 32px rgba(16, 66, 75, 0.14)",
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
              icon={isEditMode ? <EditNoteRoundedIcon /> : <BedOutlinedIcon />}
              label={isEditMode ? "INPATIENT EDIT" : "INPATIENT RECEPTION"}
              size="small"
              sx={{
                width: "fit-content",
                bgcolor: isEditMode ? "rgba(15,118,110,0.13)" : "rgba(11,114,133,0.13)",
                color: accent,
                fontWeight: 800,
                "& .MuiChip-icon": { color: accent },
              }}
            />
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.2 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" fontWeight={700}>
              입원 계획과 병실 배정 정보를 정확히 입력하세요.
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
            <Typography sx={{ fontSize: 12, color: "#607580", fontWeight: 700 }}>
              처리 상태
            </Typography>
            <Typography sx={{ fontSize: 14, color: accent, fontWeight: 900 }}>
              {isEditMode ? "입원 접수 수정" : "입원 접수 등록"}
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
            label="접수번호"
            value={form.receptionNo}
            required
            fullWidth
            InputProps={{ readOnly: true }}
            helperText={
              numberError
                ? "자동 채번 조회에 실패해 기본 번호를 넣었습니다."
                : "접수번호는 자동 생성됩니다."
            }
            sx={fieldSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="환자 이름"
              value={form.patientId}
              onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            >
              {patients.map((p) => (
                <MenuItem key={p.patientId} value={String(p.patientId)}>
                  {p.patientName}
                </MenuItem>
              ))}
            </TextField>
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
            <TextField
              type="datetime-local"
              label="예약 시간"
              InputLabelProps={{ shrink: true }}
              value={form.scheduledAt}
              onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              type="datetime-local"
              label="입원 예정일시"
              InputLabelProps={{ shrink: true }}
              value={form.admissionPlanAt}
              onChange={(e) => setForm((prev) => ({ ...prev, admissionPlanAt: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="병동 ID"
              value={form.wardId}
              onChange={(e) => setForm((prev) => ({ ...prev, wardId: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="병실 ID"
              value={form.roomId}
              onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
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
              borderColor: isEditMode ? "rgba(15,118,110,0.5)" : "rgba(11,114,133,0.45)",
              color: accent,
              fontWeight: 800,
              bgcolor: "rgba(255,255,255,0.86)",
              "&:hover": { borderColor: accent, bgcolor: "rgba(11,114,133,0.06)" },
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
              !form.receptionNo.trim() ||
              !form.patientId.trim() ||
              !form.departmentId.trim() ||
              !form.admissionPlanAt.trim()
            }
            sx={{
              bgcolor: accent,
              px: 2.25,
              fontWeight: 900,
              borderRadius: 2,
              boxShadow: isEditMode
                ? "0 10px 20px rgba(15,118,110,0.28)"
                : "0 10px 20px rgba(11,114,133,0.28)",
              "&:hover": { bgcolor: isEditMode ? "#0d5f58" : "#096678" },
            }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
