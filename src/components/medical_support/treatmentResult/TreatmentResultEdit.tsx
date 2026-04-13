"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/ko";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime } from "@/components/medical_support/common/ExamDisplay";
import {
  formatTreatmentResultActiveStatus,
  formatTreatmentResultProgressStatus,
  getTreatmentResultActiveStatusColor,
  getTreatmentResultActiveStatusSx,
  getTreatmentResultProgressStatusColor,
  getTreatmentResultProgressStatusSx,
  TREATMENT_RESULT_ACTIVE_STATUS_OPTIONS,
  TREATMENT_RESULT_PROGRESS_STATUS_OPTIONS,
} from "@/components/medical_support/treatmentResult/treatmentResultDisplay";
import { TreatmentResultActions } from "@/features/medical_support/treatmentResult/treatmentResultSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

dayjs.extend(customParseFormat);

const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm";

type TreatmentResultEditForm = {
  treatmentResultId: string;
  procedureResultId: string;
  progressStatus: string;
  status: string;
  treatmentAt: string;
  nursingId: string;
  nurseName: string;
  detail: string;
  patientId: string;
  patientName: string;
  departmentName: string;
};

const toTreatmentResultFormData = (
  item?: Partial<TreatmentResultEditForm>
): TreatmentResultEditForm => ({
  treatmentResultId: item?.treatmentResultId ?? "",
  procedureResultId: item?.procedureResultId ?? "",
  progressStatus: item?.progressStatus ?? "",
  status: item?.status ?? "",
  treatmentAt: item?.treatmentAt ?? "",
  nursingId: item?.nursingId ?? "",
  nurseName: item?.nurseName ?? "",
  detail: item?.detail ?? "",
  patientId: item?.patientId ?? "",
  patientName: item?.patientName ?? "",
  departmentName: item?.departmentName ?? "",
});

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const parseTreatmentAt = (value: string): Dayjs | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const defaultParsed = dayjs(trimmed);
  if (defaultParsed.isValid()) return defaultParsed;

  const customParsed = dayjs(trimmed, DATE_TIME_FORMAT, true);
  if (customParsed.isValid()) return customParsed;

  const secondsParsed = dayjs(trimmed, "YYYY-MM-DD HH:mm:ss", true);
  if (secondsParsed.isValid()) return secondsParsed;

  return null;
};

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

type SummaryItemProps = {
  label: string;
  value: React.ReactNode;
  truncate?: boolean;
};

function SummaryItem({ label, value, truncate = false }: SummaryItemProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>

      {typeof value === "string" || typeof value === "number" ? (
        <Typography
          variant="body2"
          fontWeight={700}
          sx={
            truncate
              ? {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }
              : undefined
          }
        >
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  );
}

export default function TreatmentResultEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const treatmentResultId = useMemo(() => {
    const value = params?.treatmentResultId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<TreatmentResultEditForm | null>(
    null
  );

  const {
    selected,
    loading,
    detailLoading,
    error,
    detailError,
    updateSuccess,
  } = useSelector((state: RootState) => state.treatmentResults);

  useEffect(() => {
    if (!treatmentResultId) return;
    dispatch(
      TreatmentResultActions.fetchTreatmentResultRequest(treatmentResultId)
    );
  }, [dispatch, treatmentResultId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toTreatmentResultFormData();
    if (
      String(selected.treatmentResultId ?? "") !== String(treatmentResultId)
    ) {
      return toTreatmentResultFormData();
    }

    return toTreatmentResultFormData({
      treatmentResultId: selected.treatmentResultId ?? "",
      procedureResultId: selected.procedureResultId ?? "",
      progressStatus: selected.progressStatus ?? "",
      status: selected.status ?? "",
      treatmentAt: selected.treatmentAt ?? "",
      nursingId: selected.nursingId ?? "",
      nurseName: selected.nurseName ?? "",
      detail: selected.detail ?? "",
      patientId:
        selected.patientId === null || selected.patientId === undefined
          ? ""
          : String(selected.patientId),
      patientName: selected.patientName ?? "",
      departmentName: selected.departmentName ?? "",
    });
  }, [draftForm, selected, treatmentResultId]);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("처치 결과가 수정되었습니다.");
    dispatch(TreatmentResultActions.resetUpdateSuccess());
    router.push("/medical_support/medicationTreatment");
  }, [dispatch, router, updateSuccess]);

  if (detailLoading && !form.treatmentResultId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 1120, mx: "auto", pb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          처치 결과 수정
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          환자와 결과 요약을 먼저 확인하고, 아래에서 진행상태와 활성여부를 포함한
          상세 정보를 수정할 수 있습니다.
        </Typography>

        {detailError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {detailError}
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
          }}
        >
          <CardContent sx={{ px: { xs: 2, md: 3 }, py: 2.25 }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                gap={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: 0.8 }}
                  >
                    환자 및 결과 요약
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    <Typography variant="h6" fontWeight={800}>
                      {displayValue(form.patientName)}
                    </Typography>

                    <Chip
                      label={`환자 ID ${displayValue(form.patientId)}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={displayValue(form.departmentName)}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    label={formatTreatmentResultProgressStatus(form.progressStatus)}
                    color={getTreatmentResultProgressStatusColor(form.progressStatus)}
                    sx={getTreatmentResultProgressStatusSx()}
                  />
                  <Chip
                    label={formatTreatmentResultActiveStatus(form.status)}
                    color={getTreatmentResultActiveStatusColor(form.status)}
                    sx={getTreatmentResultActiveStatusSx(form.status)}
                  />
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.75,
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                }}
              >
                <SummaryItem
                  label="처치결과 ID"
                  value={displayValue(form.procedureResultId)}
                />
                <SummaryItem
                  label="처치일시"
                  value={formatDateTime(form.treatmentAt)}
                />
                <SummaryItem
                  label="담당 간호사"
                  value={displayValue(form.nurseName)}
                  truncate
                />
                <SummaryItem
                  label="현재 진행상태"
                  value={formatTreatmentResultProgressStatus(form.progressStatus)}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2,
              borderBottom: "1px solid",
              borderColor: "grey.200",
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              수정 항목
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              진행상태와 활성여부를 분리해서 관리하고, 간호사 정보와 처치 내용을 함께
              수정할 수 있습니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
              <Box
                sx={{
                  display: "grid",
                  gap: 1.75,
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                }}
              >
                <TextField
                  select
                  label="진행상태"
                  size="small"
                  value={form.progressStatus}
                  onChange={(e) =>
                    setDraftForm({ ...form, progressStatus: e.target.value })
                  }
                  fullWidth
                >
                  {TREATMENT_RESULT_PROGRESS_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="활성여부"
                  size="small"
                  value={form.status}
                  onChange={(e) => setDraftForm({ ...form, status: e.target.value })}
                  fullWidth
                >
                  {TREATMENT_RESULT_ACTIVE_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="간호사명"
                  size="small"
                  value={form.nurseName}
                  onChange={(e) => setDraftForm({ ...form, nurseName: e.target.value })}
                  fullWidth
                />

                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <DateTimePicker
                    label="처치일시"
                    value={parseTreatmentAt(form.treatmentAt)}
                    onChange={(value) =>
                      setDraftForm({
                        ...form,
                        treatmentAt: value ? value.format(DATE_TIME_FORMAT) : "",
                      })
                    }
                    format={DATE_TIME_FORMAT}
                    ampm={false}
                    timeSteps={{ minutes: 1 }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        helperText:
                          "시간 선택기를 사용해 처치일시를 수정할 수 있습니다.",
                      },
                    }}
                  />
                </Box>

                <TextField
                  label="간호사 ID"
                  size="small"
                  value={form.nursingId}
                  onChange={(e) => setDraftForm({ ...form, nursingId: e.target.value })}
                  fullWidth
                />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    border: "1px dashed",
                    borderColor: "grey.300",
                    backgroundColor: "#fcfcfd",
                    gridColumn: { md: "1 / -1" },
                  }}
                >
                  <SummaryItem
                    label="환자 요약"
                    value={`${displayValue(form.patientName)} / ${displayValue(form.patientId)}`}
                    truncate
                  />
                </Box>

                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <TextField
                    label="처치내용"
                    size="small"
                    value={form.detail}
                    onChange={(e) => setDraftForm({ ...form, detail: e.target.value })}
                    multiline
                    minRows={5}
                    fullWidth
                  />
                </Box>
              </Box>
            </LocalizationProvider>
          </CardContent>
        </Card>

        <Box
          sx={{
            position: "sticky",
            bottom: 16,
            zIndex: 20,
            mt: 2,
          }}
        >
          <Card
            elevation={6}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
            }}
          >
            <CardContent
              sx={{
                px: { xs: 2, md: 2.5 },
                py: 1.5,
                "&:last-child": { pb: 1.5 },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                gap={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    변경 사항 확인
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    진행상태, 활성여부, 처치일시, 간호사 정보와 처치 내용을 확인한 뒤
                    저장하세요.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() =>
                      router.push("/medical_support/medicationTreatment")
                    }
                  >
                    취소
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => {
                      if (!treatmentResultId) return;

                      dispatch(
                        TreatmentResultActions.updateTreatmentResultRequest({
                          treatmentResultId,
                          form: {
                            progressStatus: toNullableString(form.progressStatus),
                            status: toNullableString(form.status),
                            treatmentAt: toNullableString(form.treatmentAt),
                            nursingId: toNullableString(form.nursingId),
                            nurseName: toNullableString(form.nurseName),
                            detail: toNullableString(form.detail),
                            patientId: form.patientId.trim()
                              ? Number(form.patientId)
                              : null,
                            patientName: toNullableString(form.patientName),
                            departmentName: toNullableString(form.departmentName),
                            procedureResultId: toNullableString(
                              form.procedureResultId
                            ),
                          },
                        })
                      );
                    }}
                    disabled={loading || detailLoading}
                  >
                    저장
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </main>
  );
}
