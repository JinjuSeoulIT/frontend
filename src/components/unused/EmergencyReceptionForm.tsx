"use client";

import * as React from "react";
import {
  Autocomplete,
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
import { useRouter } from "next/navigation";
import EmergencyOutlinedIcon from "@mui/icons-material/EmergencyOutlined";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import type { EmergencyReceptionForm as EmergencyReceptionFormPayload } from "@/features/EmergencyReception/EmergencyReceptionTypes";
import type {
  DepartmentOption,
  DoctorOption,
  PatientOption,
} from "@/features/Reservations/ReservationTypes";
import { fetchEmergencyReceptionsApi } from "@/lib/reception/emergencyReceptionApi";
import { fetchPatientsApi } from "@/lib/masterDataApi";
import { buildNextReceptionNumber } from "@/lib/reception/receptionNumber";

type EmergencyReceptionFormState = {
  receptionNo: string;
  patientId: string;
  departmentId: string;
  doctorId: string;
  scheduledAt: string;
  arrivedAt: string;
  status: string;
  note: string;
  triageLevel: string;
  chiefComplaint: string;
  vitalTemp: string;
  vitalBpSystolic: string;
  vitalBpDiastolic: string;
  vitalHr: string;
  vitalRr: string;
  vitalSpo2: string;
  arrivalMode: string;
  triageNote: string;
};

type EmergencyReceptionFormProps = {
  title: string;
  initial: EmergencyReceptionFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  mode?: "create" | "edit";
  onSubmit: (form: EmergencyReceptionFormPayload) => void;
  onCancel: () => void;
};

const statusOptions = [
  { value: "WAITING", label: "대기" },
  { value: "CALLED", label: "호출" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
];

const arrivalModes = [
  { value: "WALK_IN", label: "도보" },
  { value: "AMBULANCE", label: "구급차" },
  { value: "TRANSFER", label: "전원" },
  { value: "OTHER", label: "기타" },
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

const statusLabelToCode: Record<string, string> = {
  대기: "WAITING",
  호출: "CALLED",
  보류: "ON_HOLD",
  취소: "CANCELED",
};

const arrivalLabelToCode: Record<string, string> = {
  도보: "WALK_IN",
  구급차: "AMBULANCE",
  전원: "TRANSFER",
  기타: "OTHER",
};

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

function toOptionalDateTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // <input type="datetime-local"> returns "YYYY-MM-DDTHH:mm".
  // Backend LocalDateTime parsers often require seconds.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }
  return trimmed;
}

export default function EmergencyReceptionForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  mode = "create",
  onSubmit,
  onCancel,
}: EmergencyReceptionFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const accent = isEditMode ? "#b45309" : "#c2410c";
  const borderTone = isEditMode ? "rgba(180,83,9,0.24)" : "rgba(194,65,12,0.24)";
  const fieldSx = {
    "& .MuiInputBase-root": {
      bgcolor: "#fff8f2",
      borderRadius: 2,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(180,83,9,0.28)" : "rgba(194,65,12,0.24)",
    },
    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(180,83,9,0.46)" : "rgba(194,65,12,0.42)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accent,
      borderWidth: "2px",
    },
  };

  const [form, setForm] = React.useState<EmergencyReceptionFormState>(initial);
  const [patients, setPatients] = React.useState<PatientOption[]>([]);
  const [patientKeyword, setPatientKeyword] = React.useState("");
  const [listError, setListError] = React.useState<string | null>(null);
  const [numberLoading, setNumberLoading] = React.useState(false);
  const [numberError, setNumberError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setForm({
      ...initial,
      status: statusLabelToCode[initial.status] ?? initial.status,
      arrivalMode: arrivalLabelToCode[initial.arrivalMode] ?? initial.arrivalMode,
    });
  }, [initial]);

  React.useEffect(() => {
    if (!isEditMode && form.status !== "WAITING") {
      setForm((prev) => ({ ...prev, status: "WAITING" }));
    }
  }, [form.status, isEditMode]);

  React.useEffect(() => {
    if (!form.note.trim() && form.triageNote.trim()) {
      setForm((prev) => ({ ...prev, note: prev.triageNote }));
    }
  }, [form.note, form.triageNote]);

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
        const message = err instanceof Error ? err.message : "목록을 불러오지 못했습니다.";
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
        const list = await fetchEmergencyReceptionsApi();
        const next = buildNextReceptionNumber({
          existingNumbers: list.map((item) => item.receptionNo),
          startSequence: 101,
        });
        if (!mounted) return;
        setForm((prev) => ({ ...prev, receptionNo: next }));
      } catch (err) {
        if (!mounted) return;
        const fallback = buildNextReceptionNumber({
          existingNumbers: [],
          startSequence: 101,
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

  React.useEffect(() => {
    setSubmitError(null);
  }, [form]);

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
    const triageLevel = toOptionalNumber(form.triageLevel);

    if (!patientId || !departmentId || !triageLevel || !form.chiefComplaint.trim()) return;
    if (!form.arrivedAt.trim()) {
      setSubmitError("도착 시간은 필수입니다.");
      return;
    }
    if (triageLevel < 1 || triageLevel > 5) {
      setSubmitError("중증도는 1~5 사이로 입력해주세요.");
      return;
    }

    const vitalTemp = toOptionalNumber(form.vitalTemp);
    const vitalBpSystolic = toOptionalNumber(form.vitalBpSystolic);
    const vitalBpDiastolic = toOptionalNumber(form.vitalBpDiastolic);
    const vitalHr = toOptionalNumber(form.vitalHr);
    const vitalRr = toOptionalNumber(form.vitalRr);
    const vitalSpo2 = toOptionalNumber(form.vitalSpo2);

    const rangeChecks: Array<{ value: number | undefined; min: number; max: number; label: string }> =
      [
        { value: vitalTemp, min: 30, max: 45, label: "체온" },
        { value: vitalBpSystolic, min: 50, max: 250, label: "수축기혈압" },
        { value: vitalBpDiastolic, min: 30, max: 150, label: "이완기혈압" },
        { value: vitalHr, min: 20, max: 250, label: "심박수" },
        { value: vitalRr, min: 5, max: 80, label: "호흡수" },
        { value: vitalSpo2, min: 0, max: 100, label: "SpO2" },
      ];
    const invalidRange = rangeChecks.find(
      (item) => item.value !== undefined && (item.value < item.min || item.value > item.max)
    );
    if (invalidRange) {
      setSubmitError(
        `${invalidRange.label} 값이 비정상 범위입니다. (${invalidRange.min}~${invalidRange.max})`
      );
      return;
    }

    if (form.status === "CALLED") {
      const missingVitals = [
        vitalTemp,
        vitalBpSystolic,
        vitalBpDiastolic,
        vitalHr,
        vitalRr,
        vitalSpo2,
      ].some((value) => value === undefined);
      if (missingVitals) {
        setSubmitError("호출 상태로 저장하려면 바이탈(체온/혈압/심박수/호흡수/SpO2)을 모두 입력해주세요.");
        return;
      }
    }

    onSubmit({
      receptionNo: form.receptionNo.trim(),
      patientId,
      departmentId,
      doctorId: toOptionalNumber(form.doctorId) ?? null,
      scheduledAt: toOptionalDateTime(form.scheduledAt),
      arrivedAt: toOptionalDateTime(form.arrivedAt),
      status: (form.status || "WAITING") as EmergencyReceptionFormPayload["status"],
      note: toOptionalString(form.note) ?? null,
      triageLevel,
      chiefComplaint: form.chiefComplaint.trim(),
      vitalTemp,
      vitalBpSystolic,
      vitalBpDiastolic,
      vitalHr,
      vitalRr,
      vitalSpo2,
      arrivalMode: toOptionalString(form.arrivalMode),
      triageNote: toOptionalString(form.note),
    });
  };

  const selectedPatient = React.useMemo(
    () => patients.find((p) => String(p.patientId) === form.patientId) ?? null,
    [patients, form.patientId]
  );

  React.useEffect(() => {
    if (!selectedPatient) return;
    if (patientKeyword.trim()) return;
    setPatientKeyword(selectedPatient.patientName ?? "");
  }, [selectedPatient, patientKeyword]);

  const exactMatchedPatient = React.useMemo(() => {
    const keyword = patientKeyword.trim().toLowerCase();
    if (!keyword) return null;
    return patients.find((p) => p.patientName.trim().toLowerCase() === keyword) ?? null;
  }, [patients, patientKeyword]);

  const hasMatchingPatient = React.useMemo(() => {
    const keyword = patientKeyword.trim().toLowerCase();
    if (!keyword) return true;
    return patients.some((p) => p.patientName.toLowerCase().includes(keyword));
  }, [patients, patientKeyword]);

  React.useEffect(() => {
    if (!form.patientId && exactMatchedPatient) {
      setForm((prev) => ({ ...prev, patientId: String(exactMatchedPatient.patientId) }));
    }
  }, [exactMatchedPatient, form.patientId]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: `1px solid ${borderTone}`,
        bgcolor: "white",
        background: isEditMode
          ? "linear-gradient(145deg, rgba(180,83,9,0.1), rgba(180,83,9,0.015) 45%)"
          : "linear-gradient(145deg, rgba(194,65,12,0.1), rgba(194,65,12,0.015) 45%)",
        boxShadow: "0 16px 32px rgba(89, 42, 14, 0.14)",
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
              icon={isEditMode ? <EditNoteRoundedIcon /> : <EmergencyOutlinedIcon />}
              label={isEditMode ? "EMERGENCY EDIT" : "EMERGENCY RECEPTION"}
              size="small"
              sx={{
                width: "fit-content",
                bgcolor: isEditMode ? "rgba(180,83,9,0.13)" : "rgba(194,65,12,0.13)",
                color: accent,
                fontWeight: 800,
                "& .MuiChip-icon": { color: accent },
              }}
            />
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.2 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" fontWeight={700}>
              응급도와 바이탈을 빠르게 입력해 진료 준비를 완료하세요.
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
            <Typography sx={{ fontSize: 12, color: "#7f6a57", fontWeight: 700 }}>
              처리 상태
            </Typography>
            <Typography sx={{ fontSize: 14, color: accent, fontWeight: 900 }}>
              {isEditMode ? "응급 접수 수정" : "응급 접수 등록"}
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
                ? "자동 채번 조회에 실패해 기본 번호를 사용합니다."
                : "접수번호는 자동 생성됩니다."
            }
            sx={fieldSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Stack spacing={0.75} sx={{ flex: { xs: 1, sm: 1.6 } }}>
              <Autocomplete
                options={patients}
                value={selectedPatient}
                inputValue={patientKeyword}
                onInputChange={(_, value, reason) => {
                  setPatientKeyword(value);
                  if (reason === "input") {
                    setForm((prev) => ({ ...prev, patientId: "" }));
                  }
                }}
                onChange={(_, value) => {
                  setForm((prev) => ({
                    ...prev,
                    patientId: value ? String(value.patientId) : "",
                  }));
                  setPatientKeyword(value?.patientName ?? "");
                }}
                getOptionLabel={(option) => option.patientName}
                isOptionEqualToValue={(option, value) => option.patientId === value.patientId}
                noOptionsText="검색 결과가 없습니다"
                renderInput={(params) => (
                  <TextField {...params} label="환자 이름" required fullWidth sx={fieldSx} />
                )}
              />
              {patientKeyword.trim() && !form.patientId && hasMatchingPatient && (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  환자명을 선택하거나 정확히 입력해주세요.
                </Typography>
              )}
              {patientKeyword.trim() && !hasMatchingPatient && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    router.push(`/patients/new?name=${encodeURIComponent(patientKeyword.trim())}`)
                  }
                  sx={{
                    width: "fit-content",
                    borderColor: accent,
                    color: accent,
                    fontWeight: 700,
                    "&:hover": {
                      borderColor: accent,
                      bgcolor: "rgba(194,65,12,0.06)",
                    },
                  }}
                >
                  신규 환자 등록
                </Button>
              )}
            </Stack>
            <Box sx={{ flex: { xs: 1, sm: 1 } }}>
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
            </Box>
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
            {isEditMode ? (
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
            ) : (
              <TextField
                label="상태"
                value="대기"
                fullWidth
                InputProps={{ readOnly: true }}
                sx={fieldSx}
              />
            )}
          </Stack>

          <TextField
            type="datetime-local"
            label="도착 시간"
            InputLabelProps={{ shrink: true }}
            value={form.arrivedAt}
            onChange={(e) => setForm((prev) => ({ ...prev, arrivedAt: e.target.value }))}
            fullWidth
            sx={fieldSx}
          />

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="중증도 (1~5)"
              value={form.triageLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, triageLevel: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="주호소"
              value={form.chiefComplaint}
              onChange={(e) => setForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="체온"
              value={form.vitalTemp}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalTemp: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="수축기혈압"
              value={form.vitalBpSystolic}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalBpSystolic: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="이완기혈압"
              value={form.vitalBpDiastolic}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalBpDiastolic: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="심박수"
              value={form.vitalHr}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalHr: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="호흡수"
              value={form.vitalRr}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalRr: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="SpO2(동맥혈산소포화도)"
              value={form.vitalSpo2}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalSpo2: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="도착 방법"
              value={form.arrivalMode}
              onChange={(e) => setForm((prev) => ({ ...prev, arrivalMode: e.target.value }))}
              fullWidth
              sx={fieldSx}
            >
              {arrivalModes.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
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
        {submitError && (
          <Typography color="error" fontWeight={800}>
            {submitError}
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              borderColor: isEditMode ? "rgba(180,83,9,0.5)" : "rgba(194,65,12,0.45)",
              color: accent,
              fontWeight: 800,
              bgcolor: "rgba(255,255,255,0.86)",
              "&:hover": { borderColor: accent, bgcolor: "rgba(194,65,12,0.06)" },
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
              !form.arrivedAt.trim() ||
              !form.triageLevel.trim() ||
              !form.chiefComplaint.trim()
            }
            sx={{
              bgcolor: accent,
              px: 2.25,
              fontWeight: 900,
              borderRadius: 2,
              boxShadow: isEditMode
                ? "0 10px 20px rgba(180,83,9,0.28)"
                : "0 10px 20px rgba(194,65,12,0.28)",
              "&:hover": { bgcolor: isEditMode ? "#92400e" : "#9a3412" },
            }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
