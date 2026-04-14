"use client";

import Link from "next/link";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { MedicationRecord } from "@/features/medical_support/medicationRecord/medicationRecordType";
import {
  formatDateTime,
  safeValue,
} from "@/components/medical_support/common/ExamDisplay";
import {
  formatMedicationDose,
  formatMedicationRecordActiveStatus,
  formatMedicationRecordProgressStatus,
  getMedicationRecordActiveStatusColor,
  getMedicationRecordActiveStatusSx,
  getMedicationRecordProgressStatusColor,
  getMedicationRecordProgressStatusSx,
} from "@/components/medical_support/medicationRecord/medicationRecordDisplay";

type MedicationRecordDetailDialogProps = {
  open: boolean;
  item: MedicationRecord | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
};

type DetailSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function DetailField({ label, value, fullWidth = false }: DetailFieldProps) {
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
        gridColumn: fullWidth ? { sm: "1 / -1" } : undefined,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>
        {typeof value === "string" || typeof value === "number" ? (
          <Typography
            sx={{ fontWeight: 600, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}

function DetailSection({ title, description, children }: DetailSectionProps) {
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

export default function MedicationRecordDetailDialog({
  open,
  item,
  loading,
  error,
  onClose,
}: MedicationRecordDetailDialogProps) {
  const editHref = item?.medicationRecordId
    ? `/medical_support/medicationRecord/edit/${item.medicationRecordId}`
    : "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>투약 기록 상세</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}

          {!loading && item ? (
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
                      환자/투약 요약
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {safeValue(item.patientName)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, wordBreak: "break-word" }}
                    >
                      환자 ID {safeValue(item.patientId)} · {safeValue(item.departmentName)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip
                      label={formatMedicationRecordProgressStatus(item.progressStatus)}
                      color={getMedicationRecordProgressStatusColor(
                        item.progressStatus
                      )}
                      size="small"
                      sx={getMedicationRecordProgressStatusSx()}
                    />
                    <Chip
                      label={formatMedicationRecordActiveStatus(item.status)}
                      color={getMedicationRecordActiveStatusColor(item.status)}
                      size="small"
                      sx={getMedicationRecordActiveStatusSx(item.status)}
                    />
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  <DetailField
                    label="투약일시"
                    value={formatDateTime(item.administeredAt)}
                  />
                  <DetailField
                    label="투약량"
                    value={formatMedicationDose(item.doseNumber, item.doseUnit)}
                  />
                  <DetailField
                    label="투약 ID"
                    value={safeValue(item.medicationId)}
                  />
                </Box>
              </Paper>

              <DetailSection
                title="환자 및 진료 정보"
                description="어느 환자에게 어떤 진료과 기준으로 투약되었는지 먼저 확인합니다."
              >
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
                  <DetailField label="환자명" value={safeValue(item.patientName)} />
                  <DetailField label="환자 ID" value={safeValue(item.patientId)} />
                  <DetailField
                    label="진료과"
                    value={safeValue(item.departmentName)}
                    fullWidth
                  />
                </Box>
              </DetailSection>

              <DetailSection
                title="약제 및 용량 정보"
                description="투약된 약제명과 실제 수량·단위를 함께 확인할 수 있도록 묶었습니다."
              >
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
                  <DetailField
                    label="투약종류"
                    value={safeValue(item.doseKind)}
                    fullWidth
                  />
                  <DetailField
                    label="투약량"
                    value={safeValue(item.doseNumber)}
                  />
                  <DetailField
                    label="투약단위"
                    value={safeValue(item.doseUnit)}
                  />
                </Box>
              </DetailSection>

              <DetailSection
                title="투약 수행 정보"
                description="실제 투약 시점과 수행 간호사 정보를 업무 흐름에 맞게 배치했습니다."
              >
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
                  <DetailField
                    label="투약일시"
                    value={formatDateTime(item.administeredAt)}
                  />
                  <DetailField label="간호사명" value={safeValue(item.nurseName)} />
                  <DetailField label="간호사 ID" value={safeValue(item.nursingId)} />
                </Box>
              </DetailSection>

              <DetailSection
                title="상태 및 식별 정보"
                description="상태값과 시스템 식별자를 분리해 조회·문의·추적 시 바로 확인할 수 있게 정리했습니다."
              >
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
                  <DetailField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatMedicationRecordProgressStatus(item.progressStatus)}
                        color={getMedicationRecordProgressStatusColor(
                          item.progressStatus
                        )}
                        size="small"
                        sx={getMedicationRecordProgressStatusSx()}
                      />
                    }
                  />
                  <DetailField
                    label="활성여부"
                    value={
                      <Chip
                        label={formatMedicationRecordActiveStatus(item.status)}
                        color={getMedicationRecordActiveStatusColor(item.status)}
                        size="small"
                        sx={getMedicationRecordActiveStatusSx(item.status)}
                      />
                    }
                  />
                  <DetailField label="투약 ID" value={safeValue(item.medicationId)} />
                  <DetailField
                    label="투약기록 관리 ID"
                    value={safeValue(item.medicationRecordId)}
                  />
                  <DetailField
                    label="등록일시"
                    value={formatDateTime(item.createdAt)}
                    fullWidth
                  />
                </Box>
              </DetailSection>
            </>
          ) : null}

          {!loading && !error && !item ? (
            <Typography color="text.secondary">
              상세 정보를 불러오지 못했습니다.
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        {editHref ? (
          <Button
            component={Link}
            href={editHref}
            variant="contained"
            startIcon={<EditOutlinedIcon />}
          >
            수정
          </Button>
        ) : (
          <Button variant="contained" startIcon={<EditOutlinedIcon />} disabled>
            수정
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
