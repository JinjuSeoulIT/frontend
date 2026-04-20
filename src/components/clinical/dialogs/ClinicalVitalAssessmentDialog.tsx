"use client";

import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { saveVitalAssessApi } from "@/lib/clinical/clinicalVitalsApi";

export type VitalsFormState = {
  temperature: string;
  pulse: string;
  bpSystolic: string;
  bpDiastolic: string;
  respiratoryRate: string;
  measuredAt: string;
  spo2: string;
  painScore: string;
  consciousnessLevel: string;
  heightCm: string;
  weightKg: string;
};

export type AssessmentFormState = {
  chiefComplaint: string;
  visitReason: string;
  historyPresentIllness: string;
  pastHistory: string;
  familyHistory: string;
  allergy: string;
  currentMedication: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  visitId: number | null;
  vitalsForm: VitalsFormState;
  onVitalsFormChange: (f: VitalsFormState) => void;
  assessmentForm: AssessmentFormState;
  onAssessmentFormChange: (f: AssessmentFormState) => void;
  onSaved: () => void | Promise<void>;
  onBackToVitalsOverview?: () => void;
};

export function ClinicalVitalAssessmentDialog({
  open,
  onClose,
  visitId,
  vitalsForm,
  onVitalsFormChange,
  assessmentForm,
  onAssessmentFormChange,
  onSaved,
  onBackToVitalsOverview,
}: Props) {
  const [saving, setSaving] = React.useState(false);

  return (
    <Dialog
      open={open}
      onClose={() => !saving && onClose()}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ pb: 0.5 }}>활력·문진</DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.25, color: "text.primary" }}>
          활력징후 (Objective)
        </Typography>
        <Stack spacing={2} sx={{ mb: 2.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ step: 0.1, min: 30, max: 45 }}
              label="체온 (℃)"
              value={vitalsForm.temperature}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, temperature: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="맥박 (/분)"
              value={vitalsForm.pulse}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, pulse: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="혈압 수축기"
              value={vitalsForm.bpSystolic}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, bpSystolic: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="혈압 이완기"
              value={vitalsForm.bpDiastolic}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, bpDiastolic: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="호흡 (/분)"
              value={vitalsForm.respiratoryRate}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, respiratoryRate: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ step: 1, min: 0, max: 100 }}
              label="산소포화도 SpO₂ (%)"
              value={vitalsForm.spo2}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, spo2: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ step: 1, min: 0, max: 10 }}
              label="통증 점수 (0–10)"
              value={vitalsForm.painScore}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, painScore: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <TextField
              fullWidth
              size="small"
              label="의식 수준"
              placeholder="예: Alert, Verbal, Pain, Unresponsive"
              value={vitalsForm.consciousnessLevel}
              onChange={(e) =>
                onVitalsFormChange({ ...vitalsForm, consciousnessLevel: e.target.value })
              }
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ step: 0.1, min: 0 }}
              label="신장 (cm)"
              value={vitalsForm.heightCm}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, heightCm: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ step: 0.1, min: 0 }}
              label="체중 (kg)"
              value={vitalsForm.weightKg}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, weightKg: e.target.value })}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.25, color: "text.primary" }}>
          문진·사정 (Subjective)
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="주호소"
            value={assessmentForm.chiefComplaint}
            onChange={(e) =>
              onAssessmentFormChange({ ...assessmentForm, chiefComplaint: e.target.value })
            }
          />
          <TextField
            fullWidth
            size="small"
            label="내원 사유"
            value={assessmentForm.visitReason}
            onChange={(e) =>
              onAssessmentFormChange({ ...assessmentForm, visitReason: e.target.value })
            }
          />
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="현병력"
            value={assessmentForm.historyPresentIllness}
            onChange={(e) =>
              onAssessmentFormChange({
                ...assessmentForm,
                historyPresentIllness: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label="질병·과거 이력 (한 줄에 하나)"
            placeholder={"고혈압\n당뇨\n수술: 맹장수술"}
            helperText="수술은 「수술:」 또는 「수술력」으로 시작하는 줄로 구분"
            value={assessmentForm.pastHistory}
            onChange={(e) =>
              onAssessmentFormChange({ ...assessmentForm, pastHistory: e.target.value })
            }
          />
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="가족력"
            value={assessmentForm.familyHistory}
            onChange={(e) =>
              onAssessmentFormChange({ ...assessmentForm, familyHistory: e.target.value })
            }
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="알레르기"
              value={assessmentForm.allergy}
              onChange={(e) =>
                onAssessmentFormChange({ ...assessmentForm, allergy: e.target.value })
              }
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="복용 약"
              value={assessmentForm.currentMedication}
              onChange={(e) =>
                onAssessmentFormChange({
                  ...assessmentForm,
                  currentMedication: e.target.value,
                })
              }
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box>
          {onBackToVitalsOverview ? (
            <Button variant="outlined" disabled={saving} onClick={() => onBackToVitalsOverview()}>
              이전
            </Button>
          ) : null}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "var(--brand)" }}
            disabled={visitId == null || saving}
            onClick={async () => {
            if (visitId == null) return;
            setSaving(true);
            try {
              const recordedAt = vitalsForm.measuredAt
                ? new Date(vitalsForm.measuredAt).toISOString()
                : new Date().toISOString();
              await saveVitalAssessApi(visitId, {
                temperature: vitalsForm.temperature ? Number(vitalsForm.temperature) : null,
                pulse: vitalsForm.pulse ? Number(vitalsForm.pulse) : null,
                systolicBp: vitalsForm.bpSystolic ? Number(vitalsForm.bpSystolic) : null,
                diastolicBp: vitalsForm.bpDiastolic ? Number(vitalsForm.bpDiastolic) : null,
                respiration: vitalsForm.respiratoryRate
                  ? Number(vitalsForm.respiratoryRate)
                  : null,
                spo2: vitalsForm.spo2.trim() ? Number(vitalsForm.spo2) : null,
                painScore: vitalsForm.painScore.trim() ? Number(vitalsForm.painScore) : null,
                consciousnessLevel: vitalsForm.consciousnessLevel.trim() || null,
                heightCm: vitalsForm.heightCm.trim() || null,
                weightKg: vitalsForm.weightKg.trim() || null,
                recordedAt,
                chiefComplaint: assessmentForm.chiefComplaint || null,
                visitReason: assessmentForm.visitReason || null,
                historyPresentIllness: assessmentForm.historyPresentIllness || null,
                pastHistory: assessmentForm.pastHistory || null,
                familyHistory: assessmentForm.familyHistory || null,
                allergy: assessmentForm.allergy || null,
                currentMedication: assessmentForm.currentMedication || null,
              });
              await onSaved();
              onClose();
            } catch (err) {
              window.alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "저장 중…" : "활력·문진 저장"}
        </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
