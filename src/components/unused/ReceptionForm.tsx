"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
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
import { fetchReceptionsApi } from "@/lib/reception/receptionApi";
import { buildNextReceptionNumber } from "@/lib/reception/receptionNumber";
import { searchPatientsApi } from "@/lib/reception/patientApi";
import type { Patient } from "@/features/patients/patientTypes";

type ReceptionFormState = {
  receptionNo: string;
  patientId?: number | null;
  patientName: string;
  departmentName: string;
  doctorName: string;
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
  { value: "WAITING", label: "?��? },
  { value: "CALLED", label: "?�출" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
];

const departments = [
  { id: 1, name: "?�과", doctor: "?�태�?, doctorId: 1 },
  { id: 2, name: "?�과", doctor: "?�현??, doctorId: 2 },
  { id: 3, name: "?�형?�과", doctor: "?�숙??, doctorId: 3 },
  { id: 4, name: "?�경?�과", doctor: "최효??, doctorId: 4 },
];

const doctors = departments.map((d) => ({
  id: d.doctorId,
  name: d.doctor,
  departmentId: d.id,
  departmentName: d.name,
}));

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
  const [numberLoading, setNumberLoading] = React.useState(false);
  const [numberError, setNumberError] = React.useState<string | null>(null);
  const [patientSearchLoading, setPatientSearchLoading] = React.useState(false);
  const [patientSearchResults, setPatientSearchResults] = React.useState<Patient[]>([]);
  const [showPatientSearchResults, setShowPatientSearchResults] = React.useState(false);
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
    const keyword = form.patientName.trim();
    if (!keyword || isEditMode) {
      setPatientSearchResults([]);
      setShowPatientSearchResults(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setPatientSearchLoading(true);
        const list = await searchPatientsApi("name", keyword);
        if (!active) return;
        setPatientSearchResults(list.slice(0, 8));
        setShowPatientSearchResults(list.length > 0);
      } catch {
        if (!active) return;
        setPatientSearchResults([]);
        setShowPatientSearchResults(false);
      } finally {
        if (active) {
          setPatientSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.patientName, isEditMode]);

  React.useEffect(() => {
    if (initial.receptionNo.trim()) return;
    let mounted = true;

    const generate = async () => {
      try {
        setNumberLoading(true);
        setNumberError(null);
        const list = await fetchReceptionsApi();
        const next = buildNextReceptionNumber({
          existingNumbers: list.map((item) => item.receptionNo),
          startSequence: 1,
        });
        if (!mounted) return;
        setForm((prev) => ({ ...prev, receptionNo: next }));
      } catch (err) {
        if (!mounted) return;
        const fallback = buildNextReceptionNumber({
          existingNumbers: [],
          startSequence: 1,
        });
        setForm((prev) => ({ ...prev, receptionNo: fallback }));
        setNumberError(err instanceof Error ? err.message : "?�동 채번???�패?�습?�다.");
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

  const handleSubmit = () => {
    if (!form.receptionNo.trim()) return;
    if (!form.patientName.trim()) return;
    if (!form.departmentName.trim()) return;
    if (!isEditMode && !form.patientId) {
      alert("?�록???�자 목록?�서 ?�자�??�택??주세??");
      return;
    }

    const selectedDept = departments.find((d) => d.name === form.departmentName);
    const selectedDoctor = doctors.find((d) => d.name === form.doctorName);
    if (!selectedDept) return;

    onSubmit({
      receptionNo: form.receptionNo.trim(),
      patientName: form.patientName.trim(),
      patientId: form.patientId ?? null,
      visitType: "OUTPATIENT",
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      doctorId: selectedDoctor?.id ?? null,
      doctorName: selectedDoctor?.name ?? null,
      scheduledAt: toOptionalString(form.scheduledAt),
      arrivedAt: toOptionalString(form.arrivedAt),
      status: (form.status || "WAITING") as any,
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
              ?�자 기본 ?�보?� ?�태�??�인?�고 ?�수�??�료?�세??
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
              처리 ?�태
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#2b5aa9", fontWeight: 900 }}>
              {isEditMode ? "?�수 ?�정 진행" : "?�규 ?�수 준�?}
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
            label="?�수번호"
            value={form.receptionNo}
            required
            fullWidth
            InputProps={{ readOnly: true }}
            helperText={
              numberError
                ? "?�동 채번 조회???�패??기본 번호�??�었?�니??"
                : "?�수번호???�동 ?�성?�니??"
            }
            sx={fieldSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Box sx={{ position: "relative", width: "100%" }}>
              <TextField
                label="?�자 ?�름"
                value={form.patientName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    patientName: e.target.value,
                    patientId: null,
                  }))
                }
                required
                fullWidth
                helperText={
                  isEditMode ? undefined : "?�자관리에 ?�록???�자�??�수?????�습?�다."
                }
                sx={fieldSx}
              />
              {patientSearchLoading && !isEditMode && (
                <CircularProgress size={18} sx={{ position: "absolute", top: 14, right: 12 }} />
              )}
              {!isEditMode && showPatientSearchResults && patientSearchResults.length > 0 && (
                <Paper
                  elevation={4}
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 30,
                    maxHeight: 280,
                    overflowY: "auto",
                    borderRadius: 2,
                  }}
                >
                  <List dense>
                    {patientSearchResults.map((p) => (
                      <ListItemButton
                        key={p.patientId}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            patientId: p.patientId,
                            patientName: p.name,
                          }));
                          setShowPatientSearchResults(false);
                        }}
                      >
                        <ListItemText
                          primary={`${p.name} · ID ${p.patientId}`}
                          secondary={`${p.birthDate ?? "-"} · ${p.phone ?? "-"}`}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
            <TextField
              select
              label="진료�?
              value={form.departmentName}
              onChange={(e) => {
                const name = e.target.value;
                const dept = departments.find((d) => d.name === name);
                setForm((prev) => ({
                  ...prev,
                  departmentName: name,
                  doctorName: dept?.doctor ?? "",
                }));
              }}
              required
              fullWidth
              sx={fieldSx}
            >
              {departments.map((opt) => (
                <MenuItem key={opt.id} value={opt.name}>
                  {opt.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="?�사 ?�름"
              value={form.doctorName}
              onChange={(e) => {
                const name = e.target.value;
                const doctor = doctors.find((d) => d.name === name);
                setForm((prev) => ({
                  ...prev,
                  doctorName: name,
                  departmentName: doctor?.departmentName ?? prev.departmentName,
                }));
              }}
              fullWidth
              sx={fieldSx}
            >
              {doctors.map((opt) => (
                <MenuItem key={opt.id} value={opt.name}>
                  {opt.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="?�원 ?�형"
              value="?�래"
              fullWidth
              InputProps={{ readOnly: true }}
              sx={fieldSx}
            />
            <TextField
              select
              label="?�태"
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
                label="?�약 ?�간"
                InputLabelProps={{ shrink: true }}
                value={form.scheduledAt}
                onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                fullWidth
                sx={fieldSx}
              />
            ) : null}
            <TextField
              type="datetime-local"
              label="?�착 ?�간"
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
              numberLoading ||
              !form.receptionNo.trim() ||
              !form.patientName.trim() ||
              (!isEditMode && !form.patientId) ||
              !form.departmentName.trim()
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

