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
  Divider,
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
  formatMedicationRecordStatus,
  getMedicationRecordStatusColor,
  getMedicationRecordStatusSx,
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
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
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
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  투약 정보
                </Typography>

                <Box
                  sx={{
                    mt: 1.5,
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                  }}
                >
                  <DetailField
                    label="투약기록 ID"
                    value={safeValue(item.medicationRecordId)}
                  />
                  <DetailField
                    label="상태"
                    value={
                      <Chip
                        label={formatMedicationRecordStatus(item.status)}
                        color={getMedicationRecordStatusColor(item.status)}
                        size="small"
                        sx={getMedicationRecordStatusSx(item.status)}
                      />
                    }
                  />
                  <DetailField
                    label="투약일시"
                    value={formatDateTime(item.administeredAt)}
                  />
                  <DetailField
                    label="투약량"
                    value={formatMedicationDose(item.doseNumber, item.doseUnit)}
                  />
                  <DetailField
                    label="투약단위"
                    value={safeValue(item.doseUnit)}
                  />
                  <DetailField
                    label="투약종류"
                    value={safeValue(item.doseKind)}
                  />
                  <DetailField
                    label="간호사 ID"
                    value={safeValue(item.nursingId)}
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  환자 정보
                </Typography>

                <Box
                  sx={{
                    mt: 1.5,
                    display: "grid",
                    gap: 2,
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
                  />
                </Box>
              </Box>
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
