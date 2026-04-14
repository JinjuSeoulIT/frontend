"use client";

import * as React from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";
import {
  fetchVitalsApi,
  type VitalSignsRes,
  type AssessmentRes,
} from "@/lib/clinical/clinicalVitalsApi";
import type { PastHistoryItem } from "@/lib/clinical/clinicalPastHistoryApi";
import type { DoctorNoteRes, DiagnosisRes, PrescriptionRes } from "@/lib/clinical/clinicalRecordApi";
import type { ClinicalRes } from "../types";
import { ClinicalVitalsCard } from "./ClinicalVitalsCard";
import { ClinicalPastHistoryCard } from "./ClinicalPastHistoryCard";
import { ClinicalPastVisitsCard, type PriorSubjectiveApplyMode } from "./ClinicalPastVisitsCard";
import { ClinicalSoapCard } from "./ClinicalSoapCard";
import type { RecordFormType } from "@/features/medical_support/record/recordTypes";
import { formatDateTime } from "../clinicalDocumentation";
import TestResultList from "@/components/medical_support/testResult/TestResultList";

type RecordVitalsLineFields = Pick<
  RecordFormType,
  | "heightCm"
  | "weightKg"
  | "systolicBp"
  | "diastolicBp"
  | "pulse"
  | "respiration"
  | "temperature"
  | "spo2"
  | "painScore"
  | "consciousnessLevel"
>;

type VitalSeverity = "normal" | "warning" | "critical";

type GroupedVitalRow = {
  key: string;
  label: string;
  value: string;
  empty: boolean;
  severity: VitalSeverity;
  trendKey: "sbp" | "pulse" | "rr" | "temp" | null;
};

function formatVitalLineValue(
  value?: string | number | null,
  unit?: string
): string | number {
  if (value === null || value === undefined || value === "") return "-";
  return unit ? `${value} ${unit}` : value;
}

function severityPain(n: number): VitalSeverity {
  if (n >= 9) return "critical";
  if (n >= 7) return "warning";
  return "normal";
}

function buildGroupedVitalRows(v: Partial<RecordVitalsLineFields>): GroupedVitalRow[] {
  const sbp = parseNumField(v.systolicBp);
  const dbp = parseNumField(v.diastolicBp);
  const pulse = parseNumField(v.pulse);
  const rr = parseNumField(v.respiration);
  const temp = parseNumField(v.temperature);
  const spo2 = parseNumField(v.spo2);
  const painN = parseNumField(v.painScore);

  let bpValue: string;
  if (sbp != null && dbp != null) bpValue = `${sbp}/${dbp} mmHg`;
  else if (sbp != null) bpValue = `${sbp} / - mmHg`;
  else if (dbp != null) bpValue = `- / ${dbp} mmHg`;
  else bpValue = "-";

  const hDisp = formatVitalLineValue(v.heightCm, "cm");
  const wDisp = formatVitalLineValue(v.weightKg, "kg");
  const anthEmpty = hDisp === "-" && wDisp === "-";
  const anthValue = anthEmpty ? "-" : `${hDisp} · ${wDisp}`;

  const pain =
    v.painScore === null || v.painScore === undefined || String(v.painScore).trim() === ""
      ? "-"
      : String(v.painScore);
  const consciousness =
    v.consciousnessLevel != null && String(v.consciousnessLevel).trim()
      ? String(v.consciousnessLevel)
      : "-";

  return [
    {
      key: "bp",
      label: "혈압",
      value: bpValue,
      empty: bpValue === "-",
      severity: sbp != null || dbp != null ? bpSeverity(sbp, dbp) : "normal",
      trendKey: "sbp",
    },
    {
      key: "hw",
      label: "신체계측 (키·몸무게)",
      value: anthValue,
      empty: anthEmpty,
      severity: "normal",
      trendKey: null,
    },
    {
      key: "p",
      label: "맥박",
      value: String(formatVitalLineValue(v.pulse, "bpm")),
      empty: formatVitalLineValue(v.pulse, "bpm") === "-",
      severity: pulse != null ? severityPulse(pulse) : "normal",
      trendKey: "pulse",
    },
    {
      key: "rr",
      label: "호흡수",
      value: String(formatVitalLineValue(v.respiration, "rpm")),
      empty: formatVitalLineValue(v.respiration, "rpm") === "-",
      severity: rr != null ? severityRr(rr) : "normal",
      trendKey: "rr",
    },
    {
      key: "t",
      label: "체온",
      value: String(formatVitalLineValue(v.temperature, "℃")),
      empty: formatVitalLineValue(v.temperature, "℃") === "-",
      severity: temp != null ? severityTemp(temp) : "normal",
      trendKey: "temp",
    },
    {
      key: "spo2",
      label: "산소포화도",
      value: String(formatVitalLineValue(v.spo2, "%")),
      empty: formatVitalLineValue(v.spo2, "%") === "-",
      severity: spo2 != null ? severitySpo2(spo2) : "normal",
      trendKey: null,
    },
    {
      key: "pain",
      label: "통증 점수",
      value: pain,
      empty: pain === "-",
      severity: painN != null ? severityPain(painN) : "normal",
      trendKey: null,
    },
    {
      key: "loc",
      label: "의식 수준",
      value: consciousness,
      empty: consciousness === "-",
      severity: "normal",
      trendKey: null,
    },
  ];
}

function trendSeriesForRow(
  row: GroupedVitalRow,
  historyPoints: { v: VitalSignsRes }[]
): number[] {
  if (!row.trendKey) return [];
  switch (row.trendKey) {
    case "sbp":
      return numericSeriesFromHistory(historyPoints, (r) => r.bpSystolic ?? null);
    case "pulse":
      return numericSeriesFromHistory(historyPoints, (r) => r.pulse ?? null);
    case "rr":
      return numericSeriesFromHistory(historyPoints, (r) => r.respiratoryRate ?? null);
    case "temp":
      return numericSeriesFromHistory(historyPoints, (r) => r.temperature ?? null);
    default:
      return [];
  }
}

function mapClinicalVitalsToRecordVitalsLine(
  res: VitalSignsRes | null
): Partial<RecordVitalsLineFields> {
  if (!res) return {};
  const out: Partial<RecordVitalsLineFields> = {};
  if (res.bpSystolic != null) out.systolicBp = String(res.bpSystolic);
  if (res.bpDiastolic != null) out.diastolicBp = String(res.bpDiastolic);
  if (res.pulse != null) out.pulse = String(res.pulse);
  if (res.respiratoryRate != null) out.respiration = String(res.respiratoryRate);
  if (res.temperature != null) out.temperature = String(res.temperature);
  if (res.heightCm != null && String(res.heightCm).trim() !== "") out.heightCm = res.heightCm;
  if (res.weightKg != null && String(res.weightKg).trim() !== "") out.weightKg = res.weightKg;
  if (res.spo2 != null && String(res.spo2).trim() !== "") out.spo2 = String(res.spo2);
  if (res.painScore != null && String(res.painScore).trim() !== "") out.painScore = String(res.painScore);
  if (res.consciousnessLevel != null && String(res.consciousnessLevel).trim() !== "") {
    out.consciousnessLevel = res.consciousnessLevel;
  }
  return out;
}

function parseNumField(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function severitySbp(n: number): VitalSeverity {
  if (n < 90 || n > 180) return "critical";
  if (n < 100 || n >= 140) return "warning";
  return "normal";
}

function severityDbp(n: number): VitalSeverity {
  if (n < 60 || n > 120) return "critical";
  if (n < 70 || n >= 90) return "warning";
  return "normal";
}

function severityPulse(n: number): VitalSeverity {
  if (n < 50 || n > 120) return "critical";
  if (n < 55 || n > 100) return "warning";
  return "normal";
}

function severityRr(n: number): VitalSeverity {
  if (n < 8 || n > 30) return "critical";
  if (n < 10 || n > 24) return "warning";
  return "normal";
}

function severityTemp(n: number): VitalSeverity {
  if (n < 35 || n >= 39) return "critical";
  if (n < 35.5 || n >= 37.5) return "warning";
  return "normal";
}

function severitySpo2(n: number): VitalSeverity {
  if (n < 92) return "critical";
  if (n < 95) return "warning";
  return "normal";
}

function maxSeverity(a: VitalSeverity, b: VitalSeverity): VitalSeverity {
  const o = { normal: 0, warning: 1, critical: 2 };
  return o[a] >= o[b] ? a : b;
}

function bpSeverity(sbp: number | null, dbp: number | null): VitalSeverity {
  let s: VitalSeverity = "normal";
  if (sbp != null) s = maxSeverity(s, severitySbp(sbp));
  if (dbp != null) s = maxSeverity(s, severityDbp(dbp));
  return s;
}

function numericSeriesFromHistory(
  points: { v: VitalSignsRes }[],
  pick: (r: VitalSignsRes) => number | null | undefined
): number[] {
  const out: number[] = [];
  for (const { v } of points) {
    const x = pick(v);
    if (x != null && Number.isFinite(x)) out.push(x);
  }
  return out;
}

function lastDelta(series: number[]): number | null {
  if (series.length < 2) return null;
  return series[series.length - 1] - series[series.length - 2];
}

function VitalSparkline({ series }: { series: number[] }) {
  const w = 112;
  const h = 36;
  const pad = 4;
  if (series.length < 2) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
        추세: 방문별 기록이 2회 이상일 때 표시
      </Typography>
    );
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const pts = series.map((v, i) => {
    const x = pad + (series.length === 1 ? w / 2 : (i / (series.length - 1)) * (w - 2 * pad));
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  });
  return (
    <Box sx={{ mt: 0.75, color: "primary.main", opacity: 0.9 }}>
      <Box component="svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} sx={{ display: "block" }}>
        <polyline fill="none" stroke="currentColor" strokeWidth="1.75" points={pts.join(" ")} />
      </Box>
    </Box>
  );
}

function TrendDeltaChip({ delta }: { delta: number | null }) {
  if (delta == null) return null;
  if (delta === 0) {
    return (
      <Chip
        size="small"
        label="변화 없음"
        sx={{ height: 22, fontWeight: 700, fontSize: 11, "& .MuiChip-label": { px: 0.75 } }}
      />
    );
  }
  const up = delta > 0;
  return (
    <Chip
      size="small"
      color={up ? "warning" : "info"}
      label={`${up ? "↑" : "↓"} ${Math.abs(Math.round(delta * 10) / 10)}`}
      sx={{ height: 22, fontWeight: 800, fontSize: 11, "& .MuiChip-label": { px: 0.75 } }}
    />
  );
}

function formatClinicalBirthDate(raw: string | null | undefined): string {
  if (raw == null || !String(raw).trim()) return "—";
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function formatClinicalGender(g: string | null | undefined): string {
  if (g == null || !String(g).trim()) return "—";
  const u = String(g).trim().toUpperCase();
  if (u === "M" || u === "MALE" || u === "남") return "남";
  if (u === "F" || u === "FEMALE" || u === "여") return "여";
  return String(g).trim();
}

type Props = {
  selectedPatient: Patient | null;
  visitId: number | null;
  currentVisitStartedAt?: string | null;
  vitals: VitalSignsRes | null;
  assessment: AssessmentRes | null;
  vitalsLoading: boolean;
  assessmentLoading: boolean;
  onOpenVitalDialog: (mode: "new" | "edit") => void;
  pastHistoryList: PastHistoryItem[];
  pastHistoryLoading: boolean;
  onAddPhx: () => void;
  onEditPhx: (row: PastHistoryItem) => void;
  onDeletePhx: (rowId: number) => Promise<void>;
  pastClinicalsForPatient: ClinicalRes[];
  paginatedPastClinicals: ClinicalRes[];
  pastClinicalSummaries: Record<number, string>;
  pastVisitNotesById: Record<number, DoctorNoteRes | null>;
  pastVisitNotesLoading: boolean;
  pastClinicalPageSafe: number;
  totalPastClinicalPages: number;
  onPastClinicalPageChange: (page: number) => void;
  repeatingFromClinicalId: number | null;
  onRepeatPrescription: (fromVisitId: number) => Promise<void>;
  onApplyPriorSubjective: (fromVisitId: number, mode: PriorSubjectiveApplyMode) => Promise<boolean>;
  diagnoses: DiagnosisRes[];
  prescriptions: PrescriptionRes[];
  chiefComplaintText: string;
  onChiefComplaintTextChange: (v: string) => void;
  presentIllnessText: string;
  onPresentIllnessTextChange: (v: string) => void;
  prescriptionNameInput: string;
  onPrescriptionNameInputChange: (v: string) => void;
  prescriptionDosageInput: string;
  onPrescriptionDosageInputChange: (v: string) => void;
  prescriptionFrequencyInput: string;
  onPrescriptionFrequencyInputChange: (v: string) => void;
  prescriptionDaysInput: string;
  onPrescriptionDaysInputChange: (v: string) => void;
  additionalMemo: string;
  onAdditionalMemoChange: (v: string) => void;
  savingRecord: boolean;
  onDiagnosesReload: () => void;
  onPrescriptionsReload: () => void;
  onVisitCompleted: () => Promise<void>;
};

function ModalTitleBar({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <DialogTitle sx={{ position: "relative", pr: 5, fontWeight: 800, fontSize: 16 }}>
      {title}
      <IconButton
        aria-label="닫기"
        onClick={onClose}
        size="small"
        sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
  );
}

export function ClinicalChartCenter(p: Props) {
  const [vitalsOpen, setVitalsOpen] = React.useState(false);
  const [pastHistoryOpen, setPastHistoryOpen] = React.useState(false);
  const [pastVisitsOpen, setPastVisitsOpen] = React.useState(false);
  const [testResultsOpen, setTestResultsOpen] = React.useState(false);
  const [vitalHistoryPoints, setVitalHistoryPoints] = React.useState<{ v: VitalSignsRes }[]>([]);
  const [vitalHistoryLoading, setVitalHistoryLoading] = React.useState(false);

  const pat = p.selectedPatient;
  const displayName = pat?.name ?? "환자 미선택";
  const displayNo = pat?.patientNo?.trim() || "—";
  const birthLabel = formatClinicalBirthDate(pat?.birthDate);
  const genderLabel = formatClinicalGender(pat?.gender);

  const vitalLine = React.useMemo(
    () => mapClinicalVitalsToRecordVitalsLine(p.vitals),
    [p.vitals]
  );
  const groupedVitalRows = React.useMemo(() => buildGroupedVitalRows(vitalLine), [vitalLine]);

  React.useEffect(() => {
    if (!vitalsOpen || p.visitId == null) {
      setVitalHistoryPoints([]);
      setVitalHistoryLoading(false);
      return;
    }
    const visitId = p.visitId;
    let cancelled = false;
    setVitalHistoryLoading(true);
    const clinicalById = new Map<number, ClinicalRes>();
    for (const c of p.pastClinicalsForPatient) {
      const id = c.clinicalId ?? c.id;
      if (id != null) clinicalById.set(id, c);
    }
    const pastIds = p.pastClinicalsForPatient
      .map((c) => c.clinicalId ?? c.id)
      .filter((x): x is number => x != null)
      .slice(0, 15);

    Promise.all(pastIds.map((id) => fetchVitalsApi(id)))
      .then((results) => {
        if (cancelled) return;
        const rows: { at: number; v: VitalSignsRes; id: number }[] = [];
        pastIds.forEach((id, i) => {
          const v = results[i];
          if (!v) return;
          const cl = clinicalById.get(id);
          const raw = v.measuredAt ?? cl?.clinicalAt ?? cl?.createdAt ?? "";
          const at = Date.parse(raw) || 0;
          rows.push({ at, v, id });
        });
        if (p.vitals) {
          const rawCur = p.vitals.measuredAt ?? p.currentVisitStartedAt ?? "";
          const atCur = Date.parse(rawCur) || Date.now();
          rows.push({ at: atCur, v: p.vitals, id: visitId });
        }
        rows.sort((a, b) => a.at - b.at || a.id - b.id);
        setVitalHistoryPoints(rows.map((r) => ({ v: r.v })));
      })
      .catch(() => {
        if (!cancelled) setVitalHistoryPoints(p.vitals ? [{ v: p.vitals }] : []);
      })
      .finally(() => {
        if (!cancelled) setVitalHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vitalsOpen, p.visitId, p.pastClinicalsForPatient, p.vitals, p.currentVisitStartedAt]);

  return (
    <Box sx={{ overflow: "auto", p: 2, bgcolor: "rgba(0,0,0,0.02)" }}>
      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "linear-gradient(180deg, #fff 0%, #fafbfc 100%)",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent sx={{ py: 2, px: { xs: 2, sm: 2.5 }, "&:last-child": { pb: 2 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" alignItems="baseline" flexWrap="wrap" columnGap={1.5} rowGap={0.5}>
                  <Typography
                    component="h2"
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.35rem" },
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                      color: "text.primary",
                    }}
                  >
                    {displayName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {displayNo}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={1}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: (t) => (t.palette.mode === "dark" ? "action.selected" : "grey.100"),
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}
                    >
                      생년월일
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                      {birthLabel}
                    </Typography>
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: (t) => (t.palette.mode === "dark" ? "action.selected" : "grey.100"),
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: "text.secondary", fontWeight: 600, mr: 0.75, fontSize: 10 }}
                    >
                      성별
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>
                      {genderLabel}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                sx={{
                  flexShrink: 0,
                  pt: { xs: 0.5, md: 0 },
                  borderTop: { xs: "1px solid", md: "none" },
                  borderColor: "divider",
                }}
              >
                <Chip
                  label="건강보험"
                  size="small"
                  sx={{
                    height: 28,
                    fontWeight: 600,
                    fontSize: 12,
                    bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.200"),
                    color: "text.primary",
                  }}
                />
                <Button size="small" variant="outlined" onClick={() => setVitalsOpen(true)} sx={{ textTransform: "none", fontWeight: 600 }}>
                  바이탈·문진
                </Button>
                <Button size="small" variant="outlined" onClick={() => setPastHistoryOpen(true)} sx={{ textTransform: "none", fontWeight: 600 }}>
                  과거력
                </Button>
                <Button size="small" variant="outlined" onClick={() => setPastVisitsOpen(true)} sx={{ textTransform: "none", fontWeight: 600 }}>
                  과거 진료기록
                </Button>
                <Button size="small" variant="outlined" onClick={() => setTestResultsOpen(true)} sx={{ textTransform: "none", fontWeight: 600 }}>
                  검사결과
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ width: "100%", minWidth: 0 }}>
          <ClinicalSoapCard
            visitId={p.visitId}
            diagnoses={p.diagnoses}
            prescriptions={p.prescriptions}
            chiefComplaintText={p.chiefComplaintText}
            onChiefComplaintTextChange={p.onChiefComplaintTextChange}
            presentIllnessText={p.presentIllnessText}
            onPresentIllnessTextChange={p.onPresentIllnessTextChange}
            prescriptionNameInput={p.prescriptionNameInput}
            onPrescriptionNameInputChange={p.onPrescriptionNameInputChange}
            prescriptionDosageInput={p.prescriptionDosageInput}
            onPrescriptionDosageInputChange={p.onPrescriptionDosageInputChange}
            prescriptionFrequencyInput={p.prescriptionFrequencyInput}
            onPrescriptionFrequencyInputChange={p.onPrescriptionFrequencyInputChange}
            prescriptionDaysInput={p.prescriptionDaysInput}
            onPrescriptionDaysInputChange={p.onPrescriptionDaysInputChange}
            additionalMemo={p.additionalMemo}
            onAdditionalMemoChange={p.onAdditionalMemoChange}
            savingRecord={p.savingRecord}
            onDiagnosesReload={p.onDiagnosesReload}
            onPrescriptionsReload={p.onPrescriptionsReload}
            onVisitCompleted={p.onVisitCompleted}
          />
        </Box>
      </Stack>

      <Dialog
        open={vitalsOpen}
        onClose={() => setVitalsOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <ModalTitleBar title="신체계측/바이탈 (SOAP O)" onClose={() => setVitalsOpen(false)} />
        <DialogContent dividers sx={{ pt: 2 }}>
          {pat ? (
            <Box sx={{ mb: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "baseline" }}
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.25 }}>
                    신체 정보 및 활력징후
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    항목을 묶어 보여 주고, 이상 구간은 강조합니다. 동일 환자 과거 방문 활력이 있으면 미니 추세선과 직전 대비 변화를 표시합니다.
                  </Typography>
                </Box>
                {!p.vitalsLoading && p.vitals?.measuredAt ? (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`측정 ${formatDateTime(p.vitals.measuredAt)}`}
                    sx={{ fontWeight: 600, flexShrink: 0 }}
                  />
                ) : null}
              </Stack>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50"),
                }}
              >
                {p.vitalsLoading ? (
                  <Grid container spacing={1.25}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "background.paper" }}>
                          <Skeleton variant="text" width="45%" height={14} sx={{ mb: 0.75 }} />
                          <Skeleton variant="text" width="72%" height={24} sx={{ mb: 1 }} />
                          <Skeleton variant="rounded" width="100%" height={36} />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Grid container spacing={1.25}>
                    {groupedVitalRows.map((row) => {
                      const series = trendSeriesForRow(row, vitalHistoryPoints);
                      const delta = lastDelta(series);
                      const borderW = row.severity !== "normal" ? 2 : 1;
                      const borderColor =
                        row.severity === "critical"
                          ? "error.main"
                          : row.severity === "warning"
                            ? "warning.main"
                            : "divider";
                      return (
                        <Grid key={row.key} size={{ xs: 6, sm: 4, md: 3 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.25,
                              height: "100%",
                              borderRadius: 1.5,
                              border: `${borderW}px solid`,
                              borderColor,
                              bgcolor: "background.paper",
                            }}
                          >
                            <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={0.5} sx={{ mb: 0.5 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, letterSpacing: "0.02em" }}
                              >
                                {row.label}
                              </Typography>
                              {row.severity === "critical" ? (
                                <Chip size="small" color="error" label="위험" sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
                              ) : row.severity === "warning" ? (
                                <Chip size="small" color="warning" label="주의" sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
                              ) : null}
                              {row.trendKey ? <TrendDeltaChip delta={delta} /> : null}
                            </Stack>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{
                                lineHeight: 1.35,
                                color: row.empty ? "text.disabled" : "text.primary",
                                mb: 0.25,
                              }}
                            >
                              {row.value}
                            </Typography>
                            {row.trendKey ? (
                              vitalHistoryLoading ? (
                                <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 0.5 }} />
                              ) : (
                                <VitalSparkline series={series} />
                              )
                            ) : null}
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Paper>
            </Box>
          ) : null}
          <ClinicalVitalsCard
            embedded
            selectedPatient={p.selectedPatient}
            vitals={p.vitals}
            assessment={p.assessment}
            vitalsLoading={p.vitalsLoading}
            assessmentLoading={p.assessmentLoading}
            visitId={p.visitId}
            onOpenVitalDialog={(mode) => {
              p.onOpenVitalDialog(mode);
              setVitalsOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={pastHistoryOpen}
        onClose={() => setPastHistoryOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <ModalTitleBar title="과거력 (PHx)" onClose={() => setPastHistoryOpen(false)} />
        <DialogContent dividers sx={{ pt: 2 }}>
          <ClinicalPastHistoryCard
            embedded
            selectedPatient={p.selectedPatient}
            visitId={p.visitId}
            vitals={p.vitals}
            assessment={p.assessment}
            assessmentLoading={p.assessmentLoading}
            pastHistoryList={p.pastHistoryList}
            pastHistoryLoading={p.pastHistoryLoading}
            onAddPhx={p.onAddPhx}
            onEditPhx={p.onEditPhx}
            onDeletePhx={p.onDeletePhx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Button color="inherit" onClick={() => setPastHistoryOpen(false)} sx={{ textTransform: "none", fontWeight: 600 }}>
            닫기
          </Button>
          <Button
            variant="contained"
            disabled={p.selectedPatient == null || p.visitId == null || p.pastHistoryLoading}
            onClick={p.onAddPhx}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            항목 추가
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={pastVisitsOpen}
        onClose={() => setPastVisitsOpen(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <ModalTitleBar title="과거 진료기록" onClose={() => setPastVisitsOpen(false)} />
        <DialogContent dividers sx={{ pt: 2 }}>
          <ClinicalPastVisitsCard
            embedded
            pastClinicalsForPatient={p.pastClinicalsForPatient}
            paginatedPastClinicals={p.paginatedPastClinicals}
            pastClinicalSummaries={p.pastClinicalSummaries}
            pastVisitNotesById={p.pastVisitNotesById}
            pastVisitNotesLoading={p.pastVisitNotesLoading}
            visitId={p.visitId}
            pastClinicalPageSafe={p.pastClinicalPageSafe}
            totalPastClinicalPages={p.totalPastClinicalPages}
            onPastClinicalPageChange={p.onPastClinicalPageChange}
            repeatingFromClinicalId={p.repeatingFromClinicalId}
            onRepeatPrescription={p.onRepeatPrescription}
            onApplyPriorSubjective={p.onApplyPriorSubjective}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={testResultsOpen}
        onClose={() => setTestResultsOpen(false)}
        maxWidth="xl"
        fullWidth
        scroll="paper"
      >
        <ModalTitleBar title="" onClose={() => setTestResultsOpen(false)} />
        <DialogContent dividers sx={{ pt: 2 }}>
          <TestResultList
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
