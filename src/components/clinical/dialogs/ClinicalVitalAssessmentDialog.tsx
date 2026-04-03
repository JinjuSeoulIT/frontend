"use client";

import * as React from "react";
import {
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
import { saveVitalsApi, saveAssessmentApi } from "@/lib/clinical/clinicalVitalsApi";

export type VitalsFormState = {
  temperature: string;
  pulse: string;
  bpSystolic: string;
  bpDiastolic: string;
  respiratoryRate: string;
  measuredAt: string;
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
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="맥박 (/분)"
              value={vitalsForm.pulse}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, pulse: e.target.value })}
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
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="혈압 이완기"
              value={vitalsForm.bpDiastolic}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, bpDiastolic: e.target.value })}
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
            />
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              label="측정 시각"
              value={vitalsForm.measuredAt}
              onChange={(e) => onVitalsFormChange({ ...vitalsForm, measuredAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
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
      <DialogActions sx={{ px: 3, py: 2 }}>
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
              await saveVitalsApi(visitId, {
                temperature: vitalsForm.temperature ? Number(vitalsForm.temperature) : null,
                pulse: vitalsForm.pulse ? Number(vitalsForm.pulse) : null,
                bpSystolic: vitalsForm.bpSystolic ? Number(vitalsForm.bpSystolic) : null,
                bpDiastolic: vitalsForm.bpDiastolic ? Number(vitalsForm.bpDiastolic) : null,
                respiratoryRate: vitalsForm.respiratoryRate
                  ? Number(vitalsForm.respiratoryRate)
                  : null,
                measuredAt: vitalsForm.measuredAt || new Date().toISOString(),
              });
              await saveAssessmentApi(visitId, {
                chiefComplaint: assessmentForm.chiefComplaint || null,
                visitReason: assessmentForm.visitReason || null,
                historyPresentIllness: assessmentForm.historyPresentIllness || null,
                pastHistory: assessmentForm.pastHistory || null,
                familyHistory: assessmentForm.familyHistory || null,
                allergy: assessmentForm.allergy || null,
                currentMedication: assessmentForm.currentMedication || null,
                assessedAt: new Date().toISOString(),
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
      </DialogActions>
    </Dialog>
  );
}
