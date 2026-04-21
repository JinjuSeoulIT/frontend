"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  MEDICATION_RECORD_ACTIVE_STATUS_OPTIONS,
  MEDICATION_RECORD_PROGRESS_STATUS_OPTIONS,
} from "@/components/medical_support/medicationRecord/medicationRecordDisplay";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import { StaffIdNameSelectFields } from "@/components/medical_support/common/StaffIdNameSelectFields";
import type { StaffOption } from "@/lib/medical_support/staffLookupApi";
import { fetchStaffOptionsApi } from "@/lib/medical_support/staffLookupApi";

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
  progressStatus: string;
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
  progressStatus: item?.progressStatus ?? "",
  status: item?.status ?? "",
  patientName: item?.patientName ?? "",
  patientId: item?.patientId ?? "",
  departmentName: item?.departmentName ?? "",
});

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const ALLOWED_PROGRESS_STATUSES = [
  "REQUESTED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

const normalizeProgressStatus = (value?: string | null) => {
  const normalized = (value ?? "").trim().toUpperCase();
  if (
    ALLOWED_PROGRESS_STATUSES.includes(
      normalized as (typeof ALLOWED_PROGRESS_STATUSES)[number]
    )
  ) {
    return normalized;
  }
  return "REQUESTED";
};

const normalizeActiveStatus = (value?: string | null) =>
  (value ?? "").trim().toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";

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
  const [nurseStaffOptions, setNurseStaffOptions] = useState<StaffOption[]>([]);

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
      progressStatus: selected.progressStatus ?? "",
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
    let cancelled = false;
    const load = async () => {
      const opts = await fetchStaffOptionsApi({ role: "NURSE" });
      if (!cancelled) {
        setNurseStaffOptions(opts);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("투약 기록이 수정되었습니다.");
    dispatch(MedicationRecordActions.resetUpdateSuccess());
    router.push("/medical_support/medicationTreatment");
  }, [dispatch, router, updateSuccess]);

  if (detailLoading && !form.medicationRecordId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  const isCompleted = normalizeProgressStatus(form.progressStatus) === "COMPLETED";

  const buildUpdatePayload = (
    nextProgressStatus: string,
    nextStatus?: string
  ) => ({
    medicationId: toNullableString(form.medicationId),
    administeredAt: toNullableString(form.administeredAt),
    doseNumber: form.doseNumber.trim() ? Number(form.doseNumber) : null,
    doseUnit: toNullableString(form.doseUnit),
    doseKind: toNullableString(form.doseKind),
    nursingId: toNullableString(form.nursingId),
    nurseName: toNullableString(form.nurseName),
    progressStatus: normalizeProgressStatus(nextProgressStatus),
    status: toNullableString(nextStatus ?? form.status),
    patientId: form.patientId.trim() ? Number(form.patientId) : null,
    patientName: toNullableString(form.patientName),
    departmentName: toNullableString(form.departmentName),
  });

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 1120, mx: "auto", pb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          투약 기록 수정
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          투약 기본 정보와 투약 상태, 투약 내용을 확인하고 수정할 수 있습니다.
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => router.push("/medical_support/medicationTreatment")}
            >
              목록
            </Button>
            <Button
              variant="outlined"
              color={
                normalizeActiveStatus(form.status) === "INACTIVE"
                  ? "success"
                  : "warning"
              }
              onClick={() => {
                if (!medicationRecordId) return;
                const nextStatus =
                  normalizeActiveStatus(form.status) === "INACTIVE"
                    ? "ACTIVE"
                    : "INACTIVE";
                dispatch(
                  MedicationRecordActions.updateMedicationRecordRequest({
                    medicationRecordId,
                    form: buildUpdatePayload(form.progressStatus, nextStatus),
                  })
                );
              }}
              disabled={loading || detailLoading}
            >
              {normalizeActiveStatus(form.status) === "INACTIVE"
                ? "활성화"
                : "비활성화"}
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                if (!medicationRecordId) return;
                dispatch(
                  MedicationRecordActions.updateMedicationRecordRequest({
                    medicationRecordId,
                    form: buildUpdatePayload("IN_PROGRESS"),
                  })
                );
              }}
              disabled={loading || detailLoading || isCompleted}
            >
              진행시작
            </Button>
          </Stack>
        </Box>

        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
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
              투약 기본 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              투약 기록과 연결된 식별 정보를 확인합니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
                label="투약기록 ID"
                size="small"
                value={form.medicationRecordId}
                disabled
                fullWidth
              />

              <TextField
                label="투약 ID"
                size="small"
                value={form.medicationId}
                disabled
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
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
              상태 및 투약 일시
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              진행상태, 활성여부와 실제 투약일시를 관리합니다.
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
                  value={normalizeProgressStatus(form.progressStatus)}
                  onChange={(e) =>
                    setDraftForm({ ...form, progressStatus: e.target.value })
                  }
                  disabled={isCompleted}
                  fullWidth
                >
                  {MEDICATION_RECORD_PROGRESS_STATUS_OPTIONS.map((option) => (
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
                  onChange={(e) =>
                    setDraftForm({ ...form, status: e.target.value })
                  }
                  fullWidth
                >
                  {MEDICATION_RECORD_ACTIVE_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

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
                        helperText:
                          "시간 선택기를 사용해 투약일시를 수정할 수 있습니다.",
                      },
                    }}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
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
              투약 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              투여량, 단위와 투약 종류를 관리합니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
                label="투약량"
                size="small"
                value={form.doseNumber}
                onChange={(e) =>
                  setDraftForm({ ...form, doseNumber: e.target.value })
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
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
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
              수행자 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              투약을 수행한 간호사 정보를 확인하고 수정합니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
              <StaffIdNameSelectFields
                staffOptions={nurseStaffOptions}
                staffId={form.nursingId}
                fullName={form.nurseName}
                onChange={(next) =>
                  setDraftForm({
                    ...form,
                    nursingId: next.staffId,
                    nurseName: next.fullName,
                  })
                }
                idLabel="간호사 ID"
                nameLabel="간호사명"
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
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
              환자 및 진료 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              환자 식별 정보와 진료과는 조회용입니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
                label="환자명"
                size="small"
                value={form.patientName}
                disabled
                fullWidth
              />

              <TextField
                label="환자 ID"
                size="small"
                value={form.patientId}
                disabled
                fullWidth
              />

              <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                <TextField
                  label="진료과"
                  size="small"
                  value={form.departmentName}
                  disabled
                  fullWidth
                />
              </Box>
            </Box>
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
                    저장 완료
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    저장완료를 누르면 진행상태가 완료로 저장되고 이후 수정이 제한됩니다.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (!medicationRecordId) return;

                      dispatch(
                        MedicationRecordActions.updateMedicationRecordRequest({
                          medicationRecordId,
                          form: buildUpdatePayload("COMPLETED"),
                        })
                      );
                    }}
                    disabled={loading || detailLoading || isCompleted}
                  >
                    저장완료
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
