"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { VitalSignsRes, AssessmentRes } from "@/lib/clinical/clinicalVitalsApi";
import type { VitalAssessmentAuditLine } from "@/lib/clinical/medicalSupportRecordBridge";
import type { Patient } from "@/features/patients/patientTypes";
import { formatDateTime } from "../clinicalDocumentation";

function present(v: string | number | null | undefined): boolean {
  return v != null && String(v).trim() !== "";
}

function hasVitalsContent(v: VitalSignsRes | null): boolean {
  if (!v) return false;
  const nums = [v.temperature, v.pulse, v.bpSystolic, v.bpDiastolic, v.respiratoryRate];
  if (nums.some((x) => x != null && Number.isFinite(Number(x)))) return true;
  return (
    present(v.heightCm) ||
    present(v.weightKg) ||
    present(v.spo2) ||
    present(v.painScore) ||
    present(v.consciousnessLevel)
  );
}

function hasAssessmentContent(a: AssessmentRes | null): boolean {
  if (!a) return false;
  return (
    present(a.chiefComplaint) ||
    present(a.visitReason) ||
    present(a.historyPresentIllness) ||
    present(a.pastHistory) ||
    present(a.familyHistory) ||
    present(a.allergy) ||
    present(a.currentMedication)
  );
}

const ASSESSMENT_ROWS: { key: keyof AssessmentRes; label: string }[] = [
  { key: "chiefComplaint", label: "주호소" },
  { key: "visitReason", label: "내원 사유" },
  { key: "historyPresentIllness", label: "현병력" },
  { key: "pastHistory", label: "과거력" },
  { key: "familyHistory", label: "가족력" },
  { key: "allergy", label: "알레르기" },
  { key: "currentMedication", label: "복용 약" },
];

type Props = {
  selectedPatient: Patient | null;
  vitals: VitalSignsRes | null;
  assessment: AssessmentRes | null;
  vitalAuditLines?: VitalAssessmentAuditLine[];
  supportVitalMeasurementAt?: string | null;
  vitalsLoading: boolean;
  assessmentLoading: boolean;
  visitId: number | null;
  onOpenVitalDialog: (mode: "new" | "edit") => void;
  embedded?: boolean;
};

export function ClinicalVitalsCard({
  selectedPatient,
  vitals,
  assessment,
  vitalAuditLines = [],
  supportVitalMeasurementAt = null,
  vitalsLoading,
  assessmentLoading,
  visitId,
  onOpenVitalDialog,
  embedded = false,
}: Props) {
  const showVitals = hasVitalsContent(vitals);
  const showAssessment = hasAssessmentContent(assessment);
  const hasAnyRecord = showVitals || showAssessment;

  return (
    <Card
      variant={embedded ? "outlined" : undefined}
      elevation={embedded ? 0 : undefined}
      sx={{
        borderRadius: 2,
        border: embedded ? "none" : "1px solid var(--line)",
        boxShadow: embedded ? "none" : undefined,
      }}
    >
      <CardContent sx={{ py: embedded ? 0 : 1.5, "&:last-child": { pb: embedded ? 0 : 1.5 } }}>
        {!embedded ? (
          <>
            <Typography fontWeight={800} sx={{ mb: 0.25, fontSize: 15 }}>
              신체계측/바이탈 (SOAP O)
            </Typography>
            <Typography sx={{ fontSize: 10, color: "var(--muted)", mb: 1 }}>계측·문진 (SOAP)</Typography>
          </>
        ) : null}
        {selectedPatient ? (
          hasAnyRecord ? (
            <>
              {showVitals && vitals ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                  {embedded && vitalAuditLines.length > 0 ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 1, pt: 1 }}>
                      시각 순 이력은 위쪽「기록 이력」에서 펼쳐 볼 수 있습니다.
                    </Typography>
                  ) : null}
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>측정 시각</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>혈압(수축)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>혈압(이완)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>체온</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>맥박</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>호흡</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          {formatDateTime(
                            supportVitalMeasurementAt ?? vitals.measuredAt ?? vitals.updatedAt ?? null
                          )}
                        </TableCell>
                        <TableCell>{vitals.bpSystolic ?? "-"}</TableCell>
                        <TableCell>{vitals.bpDiastolic ?? "-"}</TableCell>
                        <TableCell>{vitals.temperature ?? "-"}℃</TableCell>
                        <TableCell>{vitals.pulse ?? "-"}/분</TableCell>
                        <TableCell>{vitals.respiratoryRate ?? "-"}/분</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
              {showVitals && vitals && (present(vitals.heightCm) || present(vitals.weightKg)) ? (
                <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.75 }}>
                  신장·체중:{" "}
                  {[
                    present(vitals.heightCm) ? `${vitals.heightCm} cm` : null,
                    present(vitals.weightKg) ? `${vitals.weightKg} kg` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Typography>
              ) : null}
              {showVitals && vitals && (present(vitals.spo2) || present(vitals.painScore) || present(vitals.consciousnessLevel)) ? (
                <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
                  SpO₂ {vitals.spo2 != null && String(vitals.spo2).trim() !== "" ? vitals.spo2 : "-"}
                  {" · "}통증 {vitals.painScore != null && String(vitals.painScore).trim() !== "" ? vitals.painScore : "-"}
                  {" · "}의식 {vitals.consciousnessLevel != null && String(vitals.consciousnessLevel).trim() !== "" ? vitals.consciousnessLevel : "-"}
                </Typography>
              ) : null}
              {showAssessment && assessment ? (
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    mt: showVitals ? 1.5 : 0,
                    p: 1.25,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 0.75 }}>
                    문진·사정 (요약)
                  </Typography>
                  {assessment.updatedAt || assessment.assessedAt ? (
                    <Typography sx={{ fontSize: 11, color: "var(--muted)", mb: 0.75 }}>
                      {formatDateTime(assessment.updatedAt ?? assessment.assessedAt ?? null)}
                    </Typography>
                  ) : null}
                  <Stack spacing={0.75} sx={{ maxHeight: 160, overflow: "auto" }}>
                    {ASSESSMENT_ROWS.map(({ key, label }) => {
                      const raw = assessment[key];
                      const text = raw == null ? "" : String(raw).trim();
                      if (!text) return null;
                      return (
                        <Box key={key}>
                          <Typography sx={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>
                            {label}
                          </Typography>
                          <Typography sx={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{text}</Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              ) : null}
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1.5, pt: 0.5, width: "100%", justifyContent: "flex-end" }}
                alignItems="center"
                flexWrap="wrap"
              >
                <Button
                  size="small"
                  variant="contained"
                  sx={{ bgcolor: "var(--brand)" }}
                  disabled={visitId == null || vitalsLoading || assessmentLoading}
                  onClick={() => onOpenVitalDialog("edit")}
                >
                  활력·문진 입력·수정
                </Button>
              </Stack>
            </>
          ) : (
            <Box sx={{ py: 2, textAlign: "center" }}>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                계측·문진 기록 없음
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: "var(--brand)" }}
                disabled={visitId == null || vitalsLoading || assessmentLoading}
                onClick={() => onOpenVitalDialog("new")}
              >
                활력·문진 입력
              </Button>
            </Box>
          )
        ) : (
          <Typography color="text.secondary">환자를 선택하면 계측·문진을 표시합니다.</Typography>
        )}
      </CardContent>
    </Card>
  );
}
