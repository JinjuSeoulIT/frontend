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
import {
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
          처치 기본 정보와 수행 상태, 처치 내용을 확인하고 수정할 수 있습니다.
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
              처치 기본 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              처치 결과 식별 정보를 확인합니다.
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
                label="처치결과 ID"
                size="small"
                value={form.procedureResultId}
                disabled
                fullWidth
              />

              <TextField
                label="처치결과 관리 ID"
                size="small"
                value={form.treatmentResultId}
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
              상태 및 처치 일시
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              진행상태, 활성여부와 실제 처치일시를 관리합니다.
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
                  onChange={(e) =>
                    setDraftForm({ ...form, status: e.target.value })
                  }
                  fullWidth
                >
                  {TREATMENT_RESULT_ACTIVE_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

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
              </Box>
            </LocalizationProvider>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mb: 2,
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
              수행자 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              처치를 수행한 간호사 정보를 확인하고 수정합니다.
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
                label="간호사 ID"
                size="small"
                value={form.nursingId}
                onChange={(e) =>
                  setDraftForm({ ...form, nursingId: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="간호사명"
                size="small"
                value={form.nurseName}
                onChange={(e) =>
                  setDraftForm({ ...form, nurseName: e.target.value })
                }
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mb: 2,
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
              처치 상세 내용
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              실제 처치 내용을 상세히 기록합니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <TextField
              label="처치내용"
              size="small"
              value={form.detail}
              onChange={(e) => setDraftForm({ ...form, detail: e.target.value })}
              multiline
              minRows={5}
              fullWidth
            />
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
