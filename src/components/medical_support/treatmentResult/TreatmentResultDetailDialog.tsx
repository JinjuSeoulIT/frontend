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
import type { TreatmentResult } from "@/features/medical_support/treatmentResult/treatmentResultType";
import { safeValue } from "@/components/medical_support/common/ExamDisplay";
import {
  formatTreatmentResultActiveStatus,
  formatTreatmentResultProgressStatus,
  getTreatmentResultActiveStatusColor,
  getTreatmentResultActiveStatusSx,
  getTreatmentResultProgressStatusColor,
  getTreatmentResultProgressStatusSx,
} from "@/components/medical_support/treatmentResult/treatmentResultDisplay";

type TreatmentResultDetailDialogProps = {
  open: boolean;
  item: TreatmentResult | null;
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
          <Typography sx={{ fontWeight: 600, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}

export default function TreatmentResultDetailDialog({
  open,
  item,
  loading,
  error,
  onClose,
}: TreatmentResultDetailDialogProps) {
  const editHref = item?.treatmentResultId
    ? `/medical_support/treatmentResult/edit/${item.treatmentResultId}`
    : "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>처치 결과 상세</DialogTitle>

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
                  처치 정보
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
                    label="처치결과 ID"
                    value={safeValue(item.treatmentResultId)}
                  />
                  <DetailField
                    label="진행상태"
                    value={
                      <Chip
                        label={formatTreatmentResultProgressStatus(item.progressStatus)}
                        color={getTreatmentResultProgressStatusColor(
                          item.progressStatus
                        )}
                        size="small"
                        sx={getTreatmentResultProgressStatusSx()}
                      />
                    }
                  />
                  <DetailField
                    label="활성여부"
                    value={
                      <Chip
                        label={formatTreatmentResultActiveStatus(item.status)}
                        color={getTreatmentResultActiveStatusColor(item.status)}
                        size="small"
                        sx={getTreatmentResultActiveStatusSx(item.status)}
                      />
                    }
                  />
                  <DetailField
                    label="간호사명"
                    value={safeValue(item.nurseName)}
                  />
                  <DetailField
                    label="간호사 ID"
                    value={safeValue(item.nursingId)}
                  />
                  <DetailField
                    label="처치내용"
                    value={safeValue(item.detail)}
                  />
                  <DetailField
                    label="진료과"
                    value={safeValue(item.departmentName)}
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
                  <DetailField
                    label="환자명"
                    value={safeValue(item.patientName)}
                  />
                  <DetailField
                    label="환자 ID"
                    value={safeValue(item.patientId)}
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
