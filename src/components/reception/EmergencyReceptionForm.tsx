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
  PatientOption,
} from "@/features/Reservations/ReservationTypes";
import type { Patient } from "@/features/patients/patientTypes";
import { fetchPatientApi, searchPatientsApi } from "@/lib/patient/patientApi";
import EmergencyReceptionStatusTimeline from "@/components/reception/EmergencyReceptionStatusTimeline";

type EmergencyReceptionFormState = {
  receptionNo: string;
  patientId: string;
  departmentId: string;
  patientName: string;
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
  receptionId?: string;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  mode?: "create" | "edit";
  onSubmit: (form: EmergencyReceptionFormPayload) => void;
  onCancel: () => void;
};

function isSameFormState(a: EmergencyReceptionFormState, b: EmergencyReceptionFormState) {
  return (
    a.receptionNo === b.receptionNo &&
    a.patientId === b.patientId &&
    a.departmentId === b.departmentId &&
    a.patientName === b.patientName &&
    a.doctorId === b.doctorId &&
    a.scheduledAt === b.scheduledAt &&
    a.arrivedAt === b.arrivedAt &&
    a.status === b.status &&
    a.note === b.note &&
    a.triageLevel === b.triageLevel &&
    a.chiefComplaint === b.chiefComplaint &&
    a.vitalTemp === b.vitalTemp &&
    a.vitalBpSystolic === b.vitalBpSystolic &&
    a.vitalBpDiastolic === b.vitalBpDiastolic &&
    a.vitalHr === b.vitalHr &&
    a.vitalRr === b.vitalRr &&
    a.vitalSpo2 === b.vitalSpo2 &&
    a.arrivalMode === b.arrivalMode &&
    a.triageNote === b.triageNote
  );
}

const statusOptions = [
  { value: "REGISTERED", label: "접수 완료" },
  { value: "WAITING", label: "대기" },
  { value: "CALLED", label: "호출" },
  { value: "TRIAGE", label: "트리아지 진행" },
  { value: "IN_PROGRESS", label: "진료중" },
  { value: "OBSERVATION", label: "관찰중" },
  { value: "COMPLETED", label: "진료 완료" },
  { value: "TRANSFERRED", label: "전원" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
];

const arrivalModes = [
  { value: "WALK_IN", label: "도보" },
  { value: "AMBULANCE", label: "구급차" },
  { value: "TRANSFER", label: "전원" },
  { value: "OTHER", label: "기타" },
];

const triageLevelOptions = [
  { value: "1", label: "1 - 소생" },
  { value: "2", label: "2 - 긴급" },
  { value: "3", label: "3 - 응급" },
  { value: "4", label: "4 - 준응급" },
  { value: "5", label: "5 - 비응급" },
];

const EMERGENCY_DEPARTMENT_ID = "5";
const EMERGENCY_DEPARTMENT_NAME = "응급의학과";

const statusLabelToCode: Record<string, string> = {
  "접수 완료": "REGISTERED",
  "응급 접수 완료": "REGISTERED",
  대기: "WAITING",
  호출: "CALLED",
  "트리아지 진행": "TRIAGE",
  진료중: "IN_PROGRESS",
  관찰중: "OBSERVATION",
  "진료 완료": "COMPLETED",
  완료: "COMPLETED",
  전원: "TRANSFERRED",
  보류: "ON_HOLD",
  취소: "CANCELED",
};

const arrivalLabelToCode: Record<string, string> = {
  도보: "WALK_IN",
  구급차: "AMBULANCE",
  전원: "TRANSFER",
  기타: "OTHER",
};

const STATUS_POLICY_HIDDEN = new Set(["WAITING", "CALLED", "PAYMENT_WAIT", "INACTIVE"]);
const STATUS_REASON_REQUIRED = new Set(["CANCELED", "TRANSFERRED", "ON_HOLD"]);

const STATUS_TRANSITIONS: Record<string, string[]> = {
  REGISTERED: ["TRIAGE", "IN_PROGRESS", "OBSERVATION", "ON_HOLD", "TRANSFERRED", "CANCELED"],
  WAITING: ["REGISTERED", "TRIAGE", "IN_PROGRESS", "OBSERVATION", "ON_HOLD", "TRANSFERRED", "CANCELED"],
  CALLED: ["TRIAGE", "IN_PROGRESS", "OBSERVATION", "ON_HOLD", "TRANSFERRED", "CANCELED"],
  TRIAGE: ["IN_PROGRESS", "OBSERVATION", "ON_HOLD", "TRANSFERRED", "CANCELED"],
  IN_PROGRESS: ["OBSERVATION", "COMPLETED", "ON_HOLD", "TRANSFERRED", "CANCELED"],
  OBSERVATION: ["IN_PROGRESS", "COMPLETED", "ON_HOLD", "TRANSFERRED", "CANCELED"],
  ON_HOLD: ["TRIAGE", "IN_PROGRESS", "OBSERVATION", "COMPLETED", "TRANSFERRED", "CANCELED"],
  COMPLETED: [],
  TRANSFERRED: [],
  CANCELED: [],
  PAYMENT_WAIT: ["COMPLETED"],
  INACTIVE: [],
};

const STATUS_FALLBACK_LABEL: Record<string, string> = {
  PAYMENT_WAIT: "수납대기",
  INACTIVE: "비활성",
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

function toCurrentDateTimeLocal() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getPatientDisplayName(
  patient?: (Partial<PatientOption> & { name?: string | null }) | null
) {
  const rawName =
    (typeof patient?.patientName === "string" ? patient.patientName : "") ||
    (typeof patient?.name === "string" ? patient.name : "");
  const trimmed = rawName.trim();
  if (trimmed) return trimmed;

  const id = patient?.patientId;
  if (typeof id === "number") return `환자 ${id}`;
  return "";
}

function toPatientOption(patient: Patient): PatientOption {
  return {
    patientId: Number(patient.patientId),
    patientName: (patient.name ?? "").trim(),
  };
}

function statusLabelByCode(code?: string | null) {
  const safe = (code ?? "").trim();
  if (!safe) return "-";
  const matched = statusOptions.find((opt) => opt.value === safe);
  if (matched) return matched.label;
  return STATUS_FALLBACK_LABEL[safe] ?? safe;
}

function isStatusTransitionAllowed(fromStatus: string, toStatus: string) {
  if (!fromStatus || fromStatus === toStatus) return true;
  const allowed = STATUS_TRANSITIONS[fromStatus];
  if (!allowed) return true;
  return allowed.includes(toStatus);
}

export default function EmergencyReceptionForm({
  title,
  initial,
  receptionId,
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
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [showOptionalFields, setShowOptionalFields] = React.useState(isEditMode);
  const isPatientFixed = !isEditMode && initial.patientId.trim().length > 0;
  const initialStatusCode = React.useMemo(
    () => statusLabelToCode[initial.status] ?? initial.status ?? "REGISTERED",
    [initial.status]
  );
  const reasonRequired = isEditMode && STATUS_REASON_REQUIRED.has(form.status);

  const editStatusOptions = React.useMemo(() => {
    const base = statusOptions.filter((opt) => !STATUS_POLICY_HIDDEN.has(opt.value));
    if (!form.status) return base;
    if (base.some((opt) => opt.value === form.status)) return base;
    return [{ value: form.status, label: statusLabelByCode(form.status) }, ...base];
  }, [form.status]);

  const statusTransitionHint = React.useMemo(() => {
    const allowed = STATUS_TRANSITIONS[initialStatusCode] ?? [];
    if (allowed.length === 0) return "현재 상태에서는 다른 상태로 변경할 수 없습니다.";
    return allowed.map((status) => statusLabelByCode(status)).join(", ");
  }, [initialStatusCode]);

  React.useEffect(() => {
    const nextForm: EmergencyReceptionFormState = {
      ...initial,
      departmentId: EMERGENCY_DEPARTMENT_ID,
      status: statusLabelToCode[initial.status] ?? initial.status,
      arrivalMode: arrivalLabelToCode[initial.arrivalMode] ?? initial.arrivalMode,
    };
    setForm((prev) => (isSameFormState(prev, nextForm) ? prev : nextForm));
  }, [initial]);

  React.useEffect(() => {
    if (!isEditMode && form.status !== "WAITING") {
      setForm((prev) => ({ ...prev, status: "WAITING" }));
    }
  }, [form.status, isEditMode]);

  React.useEffect(() => {
    if (!isEditMode) return;
    setShowOptionalFields(true);
  }, [isEditMode]);

  React.useEffect(() => {
    if (form.status === "TRIAGE" || reasonRequired) {
      setShowOptionalFields(true);
    }
  }, [form.status, reasonRequired]);

  React.useEffect(() => {
    if (isEditMode) return;
    if (form.arrivedAt.trim()) return;
    setForm((prev) => ({ ...prev, arrivedAt: toCurrentDateTimeLocal() }));
  }, [form.arrivedAt, isEditMode]);

  React.useEffect(() => {
    if (!isEditMode) return;
    const initialPatientId = initial.patientId.trim();
    if (!initialPatientId) return;
    if (form.patientId.trim()) return;
    setForm((prev) => ({ ...prev, patientId: initialPatientId }));
  }, [isEditMode, initial.patientId, form.patientId]);

  React.useEffect(() => {
    if (!form.note.trim() && form.triageNote.trim()) {
      setForm((prev) => ({ ...prev, note: prev.triageNote }));
    }
  }, [form.note, form.triageNote]);

  React.useEffect(() => {
    const fixedPatientId = Number(form.patientId.trim() || initial.patientId.trim());
    if (!Number.isFinite(fixedPatientId) || fixedPatientId <= 0) return;
    if (patients.some((item) => item.patientId === fixedPatientId)) return;

    let mounted = true;
    const loadDetail = async () => {
      try {
        setListError(null);
        const patient = await fetchPatientApi(fixedPatientId);
        if (!mounted) return;
        const option = toPatientOption(patient);
        setPatients((prev) => {
          if (prev.some((item) => item.patientId === option.patientId)) return prev;
          return [option, ...prev];
        });
        if (!patientKeyword.trim()) {
          setPatientKeyword(option.patientName);
        }
      } catch (err) {
        if (!mounted) return;
        const message =
          err instanceof Error ? err.message : "환자 상세 정보를 불러오지 못했습니다.";
        setListError(message);
      }
    };

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [form.patientId, initial.patientId, patients, patientKeyword]);

  React.useEffect(() => {
    if (isEditMode || isPatientFixed) return;

    const keyword = patientKeyword.trim();
    if (!keyword) {
      if (!form.patientId.trim()) {
        setPatients([]);
      }
      return;
    }

    let mounted = true;
    const timer = setTimeout(async () => {
      try {
        setListError(null);
        const list = await searchPatientsApi("name", keyword);
        if (!mounted) return;

        const mapped = list
          .map(toPatientOption)
          .filter((item) => Number.isFinite(item.patientId));

        setPatients(mapped);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "환자 검색에 실패했습니다.";
        setListError(message);
        setPatients([]);
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [patientKeyword, isEditMode, isPatientFixed, form.patientId]);

  React.useEffect(() => {
    setSubmitError(null);
  }, [form]);

  const handleSubmit = () => {
    const effectivePatientId = form.patientId.trim() || (isEditMode ? initial.patientId.trim() : "");
    const patientId = toOptionalNumber(effectivePatientId);
    const departmentId = toOptionalString(form.departmentId);
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

    if (isEditMode && !isStatusTransitionAllowed(initialStatusCode, form.status)) {
      setSubmitError(
        `현재 상태(${statusLabelByCode(initialStatusCode)})에서 ${statusLabelByCode(form.status)}(으)로는 변경할 수 없습니다.`
      );
      return;
    }

    if (reasonRequired && !form.note.trim()) {
      setSubmitError("보류/전원/취소 상태로 변경하려면 사유(메모)를 입력해주세요.");
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

    if (form.status === "TRIAGE") {
      const missingVitals = [
        vitalTemp,
        vitalBpSystolic,
        vitalBpDiastolic,
        vitalHr,
        vitalRr,
        vitalSpo2,
      ].some((value) => value === undefined);
      if (missingVitals) {
        setSubmitError("트리아지 진행 상태로 저장하려면 바이탈(체온/혈압/심박수/호흡수/SpO2)을 모두 입력해주세요.");
        return;
      }
    }

    onSubmit({
      receptionNo: isEditMode ? form.receptionNo.trim() : "",
      patientId,
      departmentId,
      doctorId: null,
      scheduledAt: toOptionalDateTime(form.scheduledAt),
      arrivedAt: toOptionalDateTime(form.arrivedAt),
      status: (isEditMode ? form.status || "WAITING" : "WAITING") as EmergencyReceptionFormPayload["status"],
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
    if (selectedPatient) {
      const resolvedName = getPatientDisplayName(selectedPatient);
      if (isEditMode) {
        if (patientKeyword !== resolvedName) {
          setPatientKeyword(resolvedName);
        }
        return;
      }
      if (!patientKeyword.trim()) {
        setPatientKeyword(resolvedName);
      }
      return;
    }

    if (!patientKeyword.trim() && initial.patientName.trim()) {
      setPatientKeyword(initial.patientName.trim());
    }
  }, [selectedPatient, patientKeyword, initial.patientName, isEditMode]);

  const exactMatchedPatient = React.useMemo(() => {
    const keyword = patientKeyword.trim().toLowerCase();
    if (!keyword) return null;
    return patients.find((p) => getPatientDisplayName(p).toLowerCase() === keyword) ?? null;
  }, [patients, patientKeyword]);

  const hasMatchingPatient = React.useMemo(() => {
    const keyword = patientKeyword.trim().toLowerCase();
    if (!keyword) return true;
    return patients.some((p) => getPatientDisplayName(p).toLowerCase().includes(keyword));
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
            helperText="접수번호는 서버에서 자동 생성됩니다."
            sx={fieldSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Stack spacing={0.75} sx={{ flex: { xs: 1, sm: 1.6 } }}>
              <Autocomplete
                options={patients}
                value={selectedPatient}
                inputValue={patientKeyword}
                disableClearable={isEditMode || isPatientFixed}
                readOnly={isEditMode || isPatientFixed}
                open={isEditMode ? false : undefined}
                popupIcon={isEditMode ? null : undefined}
                onInputChange={(_, value, reason) => {
                  if (isEditMode || isPatientFixed) return;
                  if (reason === "input") {
                    setPatientKeyword(value);
                    setForm((prev) => ({ ...prev, patientId: "" }));
                    return;
                  }
                  if (reason === "clear") {
                    setPatientKeyword("");
                    setForm((prev) => ({ ...prev, patientId: "" }));
                  }
                }}
                onChange={(_, value) => {
                  if (isEditMode || isPatientFixed) {
                    setPatientKeyword(getPatientDisplayName(selectedPatient));
                    return;
                  }
                  setForm((prev) => ({
                    ...prev,
                    patientId: value ? String(value.patientId) : "",
                  }));
                  setPatientKeyword(getPatientDisplayName(value));
                }}
                getOptionLabel={(option) => getPatientDisplayName(option)}
                isOptionEqualToValue={(option, value) => option.patientId === value.patientId}
                renderOption={(props, option) => (
                  <li {...props} key={option.patientId}>
                    {getPatientDisplayName(option)}
                  </li>
                )}
                noOptionsText="검색 결과가 없습니다"
                renderInput={(params) => (
                  <TextField {...params} label="환자 이름" required fullWidth sx={fieldSx} />
                )}
              />
              {!isEditMode && patientKeyword.trim() && !form.patientId && hasMatchingPatient && (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  환자명을 선택하거나 정확히 입력해주세요.
                </Typography>
              )}
              {!isEditMode && patientKeyword.trim() && !hasMatchingPatient && (
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
                label="진료과"
                value={EMERGENCY_DEPARTMENT_NAME}
                required
                fullWidth
                InputProps={{ readOnly: true }}
                sx={fieldSx}
              />
            </Box>
          </Stack>
          {isEditMode && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                select
                label="상태"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                fullWidth
                sx={fieldSx}
              >
                {editStatusOptions.map((opt) => (
                  <MenuItem
                    key={opt.value}
                    value={opt.value}
                    disabled={!isStatusTransitionAllowed(initialStatusCode, opt.value)}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
          {isEditMode && (
            <Stack spacing={0.25}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                가능한 상태 변경: {statusTransitionHint}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                수납대기(PAYMENT_WAIT), 비활성(INACTIVE)은 응급접수 수정 화면에서 직접 변경하지 않습니다.
              </Typography>
            </Stack>
          )}
          {!isEditMode && (
            <Typography variant="body2" sx={{ color: "#9a3412", fontWeight: 700 }}>
              등록 시 상태는 자동으로 &apos;대기&apos;로 시작됩니다.
            </Typography>
          )}

          <TextField
            type="datetime-local"
            label="도착 시간"
            InputLabelProps={{ shrink: true }}
            value={form.arrivedAt}
            onChange={(e) => setForm((prev) => ({ ...prev, arrivedAt: e.target.value }))}
            helperText="현재 시간으로 자동 입력됩니다. 필요 시 수정할 수 있습니다."
            fullWidth
            sx={fieldSx}
          />

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="중증도 *"
              value={form.triageLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, triageLevel: e.target.value }))}
              required
              fullWidth
              helperText="1-소생 / 2-긴급 / 3-응급 / 4-준응급 / 5-비응급"
              sx={fieldSx}
            >
              {triageLevelOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="주호소"
              value={form.chiefComplaint}
              onChange={(e) => setForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              바이탈/도착방법/메모는 선택 입력입니다
            </Typography>
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={() => setShowOptionalFields((prev) => !prev)}
              sx={{
                borderColor: accent,
                color: accent,
                fontWeight: 700,
                "&:hover": { borderColor: accent, bgcolor: "rgba(194,65,12,0.06)" },
              }}
            >
              {showOptionalFields ? "선택 입력 숨기기" : "선택 입력 펼치기"}
            </Button>
          </Stack>
          {showOptionalFields && (
            <>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="체온(℃)"
                  value={form.vitalTemp}
                  onChange={(e) => setForm((prev) => ({ ...prev, vitalTemp: e.target.value }))}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="수축기혈압(mmHg)"
                  value={form.vitalBpSystolic}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, vitalBpSystolic: e.target.value }))
                  }
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="이완기혈압(mmHg)"
                  value={form.vitalBpDiastolic}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, vitalBpDiastolic: e.target.value }))
                  }
                  fullWidth
                  sx={fieldSx}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="심박수(bpm)"
                  value={form.vitalHr}
                  onChange={(e) => setForm((prev) => ({ ...prev, vitalHr: e.target.value }))}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="호흡수(회/분)"
                  value={form.vitalRr}
                  onChange={(e) => setForm((prev) => ({ ...prev, vitalRr: e.target.value }))}
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="SpO2(동맥혈산소포화도)(%)"
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
                required={reasonRequired}
                helperText={
                  reasonRequired
                    ? "보류/전원/취소 상태로 변경하려면 사유(메모)를 입력해야 합니다."
                    : undefined
                }
                sx={fieldSx}
              />
            </>
          )}
          {isEditMode && receptionId && (
            <>
              <Divider />
              <EmergencyReceptionStatusTimeline receptionId={receptionId} />
            </>
          )}
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
              !(form.patientId.trim() || (isEditMode ? initial.patientId.trim() : "")) ||
              !form.departmentId.trim() ||
              !form.arrivedAt.trim() ||
              !form.triageLevel.trim() ||
              !form.chiefComplaint.trim() ||
              (reasonRequired && !form.note.trim())
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
