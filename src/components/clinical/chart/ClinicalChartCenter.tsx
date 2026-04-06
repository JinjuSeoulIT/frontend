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
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";
import type { VitalSignsRes, AssessmentRes } from "@/lib/clinical/clinicalVitalsApi";
import type { PastHistoryItem } from "@/lib/clinical/clinicalPastHistoryApi";
import type { DoctorNoteRes, DiagnosisRes, PrescriptionRes } from "@/lib/clinical/clinicalRecordApi";
import type { ClinicalRes } from "../types";
import { ClinicalVitalsCard } from "./ClinicalVitalsCard";
import { ClinicalPastHistoryCard } from "./ClinicalPastHistoryCard";
import { ClinicalPastVisitsCard, type PriorSubjectiveApplyMode } from "./ClinicalPastVisitsCard";
import { ClinicalSoapCard } from "./ClinicalSoapCard";

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

  const pat = p.selectedPatient;
  const displayName = pat?.name ?? "환자 미선택";
  const displayNo = pat?.patientNo?.trim() || "—";
  const birthLabel = formatClinicalBirthDate(pat?.birthDate);
  const genderLabel = formatClinicalGender(pat?.gender);

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
    </Box>
  );
}
