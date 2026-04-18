"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";
import type {
  AssessmentRes,
  VitalSignsRes,
} from "@/lib/clinical/clinicalVitalsApi";
import dayjs from "dayjs";

type RecordVisitChartDialogProps = {
  open: boolean;
  title: string;
  subtitle: string;
  patient: Patient | null;
  vitals: VitalSignsRes | null;
  assessment: AssessmentRes | null;
  loading: boolean;
  onClose: () => void;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
};

const formatValue = (
  value?: string | number | null,
  unit?: string
): string | number => {
  if (value === null || value === undefined || value === "") return "-";
  return unit ? `${value} ${unit}` : value;
};

function present(value?: string | number | null) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 2,
        py: 1.75,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          fontWeight: 600,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value ?? "-"}
      </Typography>
    </Box>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "#fafafa",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Paper>
  );
}

export default function RecordVisitChartDialog({
  open,
  title,
  subtitle,
  patient,
  vitals,
  assessment,
  loading,
  onClose,
}: RecordVisitChartDialogProps) {
  const measuredAt = formatDateTime(vitals?.measuredAt ?? assessment?.assessedAt);
  const hasVitals =
    vitals != null &&
    [
      vitals.temperature,
      vitals.pulse,
      vitals.bpSystolic,
      vitals.bpDiastolic,
      vitals.respiratoryRate,
      vitals.heightCm,
      vitals.weightKg,
      vitals.spo2,
      vitals.painScore,
      vitals.consciousnessLevel,
    ].some((value) => present(value));
  const hasAssessment =
    assessment != null &&
    [
      assessment.chiefComplaint,
      assessment.visitReason,
      assessment.historyPresentIllness,
      assessment.pastHistory,
      assessment.familyHistory,
      assessment.allergy,
      assessment.currentMedication,
    ].some((value) => present(value));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="닫기"
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  px: { xs: 2, sm: 2.5 },
                  py: 2.25,
                  border: "1px solid",
                  borderColor: "primary.100",
                  background:
                    "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.02) 100%)",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="overline"
                      color="primary.main"
                      sx={{ letterSpacing: 0.8, fontWeight: 700 }}
                    >
                      동일 방문 차트
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {patient?.name ?? "-"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, wordBreak: "break-word" }}
                    >
                      환자 ID {patient?.patientId ?? "-"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      측정/기록 시각
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                      {measuredAt}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Section
                title="활력징후"
                description="동일 방문에서 기록된 활력징후를 확인할 수 있습니다."
              >
                {hasVitals ? (
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                    }}
                  >
                    <DetailItem label="측정 시각" value={measuredAt} />
                    <DetailItem label="키" value={formatValue(vitals?.heightCm, "cm")} />
                    <DetailItem
                      label="몸무게"
                      value={formatValue(vitals?.weightKg, "kg")}
                    />
                    <DetailItem
                      label="수축기 혈압"
                      value={formatValue(vitals?.bpSystolic, "mmHg")}
                    />
                    <DetailItem
                      label="이완기 혈압"
                      value={formatValue(vitals?.bpDiastolic, "mmHg")}
                    />
                    <DetailItem
                      label="체온"
                      value={formatValue(vitals?.temperature, "℃")}
                    />
                    <DetailItem label="맥박" value={formatValue(vitals?.pulse, "bpm")} />
                    <DetailItem
                      label="호흡수"
                      value={formatValue(vitals?.respiratoryRate, "rpm")}
                    />
                    <DetailItem
                      label="산소포화도"
                      value={formatValue(vitals?.spo2, "%")}
                    />
                    <DetailItem
                      label="통증 점수"
                      value={vitals?.painScore ?? "-"}
                    />
                    <DetailItem
                      label="의식 수준"
                      value={vitals?.consciousnessLevel || "-"}
                    />
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    등록된 활력징후가 없습니다.
                  </Typography>
                )}
              </Section>

              <Section
                title="문진 및 평가"
                description="동일 방문에서 작성된 문진과 평가를 확인할 수 있습니다."
              >
                {hasAssessment ? (
                  <Stack spacing={1.5}>
                    <DetailItem
                      label="주호소"
                      value={assessment?.chiefComplaint || "-"}
                    />
                    <DetailItem
                      label="내원 사유"
                      value={assessment?.visitReason || "-"}
                    />
                    <DetailItem
                      label="현병력"
                      value={assessment?.historyPresentIllness || "-"}
                    />
                    <DetailItem
                      label="과거력"
                      value={assessment?.pastHistory || "-"}
                    />
                    <DetailItem
                      label="가족력"
                      value={assessment?.familyHistory || "-"}
                    />
                    <DetailItem
                      label="알레르기"
                      value={assessment?.allergy || "-"}
                    />
                    <DetailItem
                      label="복용 중 약물"
                      value={assessment?.currentMedication || "-"}
                    />
                  </Stack>
                ) : (
                  <Typography color="text.secondary">
                    등록된 문진 및 평가가 없습니다.
                  </Typography>
                )}
              </Section>

              {!hasVitals && !hasAssessment ? (
                <>
                  <Divider />
                  <Typography color="text.secondary">
                    동일 방문의 진료기록이 아직 등록되지 않았습니다.
                  </Typography>
                </>
              ) : null}
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
