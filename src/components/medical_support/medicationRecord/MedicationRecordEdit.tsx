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
import { MedicationRecordActions } from "@/features/medical_support/medicationRecord/medicationRecordSlice";
import {
  formatMedicationDose,
  formatMedicationRecordStatus,
  getMedicationRecordStatusColor,
  getMedicationRecordStatusSx,
  MEDICATION_RECORD_STATUS_OPTIONS,
} from "@/components/medical_support/medicationRecord/medicationRecordDisplay";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

dayjs.extend(customParseFormat);

const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm";

type MedicationRecordEditForm = {
  medicationRecordId: string;
  medicationId: string;
  administeredAt: string;
  doseNumber: string;
  doseUnit: string;
  doseKind: string;
  nursingId: string;
  nurseName: string;
  status: string;
  patientName: string;
  patientId: string;
  departmentName: string;
};

const toMedicationRecordFormData = (
  item?: Partial<MedicationRecordEditForm>
): MedicationRecordEditForm => ({
  medicationRecordId: item?.medicationRecordId ?? "",
  medicationId: item?.medicationId ?? "",
  administeredAt: item?.administeredAt ?? "",
  doseNumber: item?.doseNumber ?? "",
  doseUnit: item?.doseUnit ?? "",
  doseKind: item?.doseKind ?? "",
  nursingId: item?.nursingId ?? "",
  nurseName: item?.nurseName ?? "",
  status: item?.status ?? "",
  patientName: item?.patientName ?? "",
  patientId: item?.patientId ?? "",
  departmentName: item?.departmentName ?? "",
});

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const parseAdministeredAt = (value: string): Dayjs | null => {
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

export default function MedicationRecordEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const medicationRecordId = useMemo(() => {
    const value = params?.medicationRecordId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<MedicationRecordEditForm | null>(
    null
  );

  const {
    selected,
    loading,
    detailLoading,
    error,
    detailError,
    updateSuccess,
  } = useSelector((state: RootState) => state.medicationRecords);

  useEffect(() => {
    if (!medicationRecordId) return;
    dispatch(
      MedicationRecordActions.fetchMedicationRecordRequest(medicationRecordId)
    );
  }, [dispatch, medicationRecordId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toMedicationRecordFormData();
    if (String(selected.medicationRecordId ?? "") !== String(medicationRecordId)) {
      return toMedicationRecordFormData();
    }

    return toMedicationRecordFormData({
      medicationRecordId: selected.medicationRecordId ?? "",
      medicationId: selected.medicationId ?? "",
      administeredAt: selected.administeredAt ?? "",
      doseNumber:
        selected.doseNumber === null || selected.doseNumber === undefined
          ? ""
          : String(selected.doseNumber),
      doseUnit: selected.doseUnit ?? "",
      doseKind: selected.doseKind ?? "",
      nursingId: selected.nursingId ?? "",
      nurseName: selected.nurseName ?? "",
      status: selected.status ?? "",
      patientName: selected.patientName ?? "",
      patientId:
        selected.patientId === null || selected.patientId === undefined
          ? ""
          : String(selected.patientId),
      departmentName: selected.departmentName ?? "",
    });
  }, [draftForm, medicationRecordId, selected]);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("투약 기록이 수정되었습니다.");
    dispatch(MedicationRecordActions.resetUpdateSuccess());
    router.push("/medical_support/medicationTreatment");
  }, [dispatch, router, updateSuccess]);

  if (detailLoading && !form.medicationRecordId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 1120, mx: "auto", pb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          투약 기록 수정
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          환자 맥락은 빠르게 확인하고, 수정은 한 화면에서 바로 끝낼 수 있게 구성했습니다.
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
                    환자 및 기록 요약
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

                <Chip
                  label={formatMedicationRecordStatus(form.status)}
                  color={getMedicationRecordStatusColor(form.status)}
                  sx={getMedicationRecordStatusSx(form.status)}
                />
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
                  label="투약기록 ID"
                  value={displayValue(form.medicationRecordId)}
                />
                <SummaryItem
                  label="현재 투약일시"
                  value={displayValue(form.administeredAt)}
                />
                <SummaryItem
                  label="투약량"
                  value={formatMedicationDose(form.doseNumber, form.doseUnit)}
                />
                <SummaryItem
                  label="담당 간호사"
                  value={displayValue(form.nurseName)}
                  truncate
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
              실행 정보와 담당 정보를 빠르게 수정할 수 있습니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="ko"
            >
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
                  label="상태"
                  size="small"
                  value={form.status}
                  onChange={(e) => setDraftForm({ ...form, status: e.target.value })}
                  fullWidth
                >
                  {MEDICATION_RECORD_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="간호사명"
                  size="small"
                  value={form.nurseName}
                  onChange={(e) =>
                    setDraftForm({ ...form, nurseName: e.target.value })
                  }
                  fullWidth
                />

                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <DateTimePicker
                    label="투약일시"
                    value={parseAdministeredAt(form.administeredAt)}
                    onChange={(value) =>
                      setDraftForm({
                        ...form,
                        administeredAt: value ? value.format(DATE_TIME_FORMAT) : "",
                      })
                    }
                    format={DATE_TIME_FORMAT}
                    ampm={false}
                    timeSteps={{ minutes: 1 }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        helperText: "달력과 시간 선택기로 투약일시를 입력할 수 있습니다.",
                      },
                    }}
                  />
                </Box>

                <TextField
                  label="투약량"
                  size="small"
                  value={form.doseNumber}
                  onChange={(e) =>
                    setDraftForm({ ...form, doseNumber: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="간호사 ID"
                  size="small"
                  value={form.nursingId}
                  onChange={(e) =>
                    setDraftForm({ ...form, nursingId: e.target.value })
                  }
                  fullWidth
                />

                <TextField
                  label="투약단위"
                  size="small"
                  value={form.doseUnit}
                  onChange={(e) =>
                    setDraftForm({ ...form, doseUnit: e.target.value })
                  }
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
                  }}
                >
                  <SummaryItem
                    label="환자 식별"
                    value={`${displayValue(form.patientName)} / ${displayValue(form.patientId)}`}
                    truncate
                  />
                </Box>

                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <TextField
                    label="투약종류"
                    size="small"
                    value={form.doseKind}
                    onChange={(e) =>
                      setDraftForm({ ...form, doseKind: e.target.value })
                    }
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
                    변경 사항 저장
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    투약일시, 투약량, 담당 간호사 정보를 수정한 뒤 저장하세요.
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
                      if (!medicationRecordId) return;

                      dispatch(
                        MedicationRecordActions.updateMedicationRecordRequest({
                          medicationRecordId,
                          form: {
                            medicationId: toNullableString(form.medicationId),
                            administeredAt: toNullableString(form.administeredAt),
                            doseNumber: form.doseNumber.trim()
                              ? Number(form.doseNumber)
                              : null,
                            doseUnit: toNullableString(form.doseUnit),
                            doseKind: toNullableString(form.doseKind),
                            nursingId: toNullableString(form.nursingId),
                            nurseName: toNullableString(form.nurseName),
                            status: toNullableString(form.status),
                            patientId: form.patientId.trim()
                              ? Number(form.patientId)
                              : null,
                            patientName: toNullableString(form.patientName),
                            departmentName: toNullableString(form.departmentName),
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
