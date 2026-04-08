"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { TreatmentResultActions } from "@/features/medical_support/treatmentResult/treatmentResultSlice";
import { TREATMENT_RESULT_STATUS_OPTIONS } from "@/components/medical_support/treatmentResult/treatmentResultDisplay";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type TreatmentResultEditForm = {
  treatmentResultId: string;
  procedureResultId: string;
  status: string;
  nursingId: string;
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
  status: item?.status ?? "",
  nursingId: item?.nursingId ?? "",
  detail: item?.detail ?? "",
  patientId: item?.patientId ?? "",
  patientName: item?.patientName ?? "",
  departmentName: item?.departmentName ?? "",
});

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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

  const [draftForm, setDraftForm] = useState<TreatmentResultEditForm | null>(null);

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
    dispatch(TreatmentResultActions.fetchTreatmentResultRequest(treatmentResultId));
  }, [dispatch, treatmentResultId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toTreatmentResultFormData();
    if (String(selected.treatmentResultId ?? "") !== String(treatmentResultId)) {
      return toTreatmentResultFormData();
    }

    return toTreatmentResultFormData({
      treatmentResultId: selected.treatmentResultId ?? "",
      procedureResultId: selected.procedureResultId ?? "",
      status: selected.status ?? "",
      nursingId: selected.nursingId ?? "",
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
      <Box sx={{ maxWidth: 840 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          처치 결과 수정
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

        <Stack spacing={2}>
          <TextField
            label="처치결과 ID"
            value={form.treatmentResultId}
            disabled
            fullWidth
          />
          <TextField
            select
            label="상태"
            value={form.status}
            onChange={(e) => setDraftForm({ ...form, status: e.target.value })}
            fullWidth
          >
            {TREATMENT_RESULT_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="환자명"
            value={form.patientName}
            onChange={(e) =>
              setDraftForm({ ...form, patientName: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="환자 ID"
            value={form.patientId}
            onChange={(e) => setDraftForm({ ...form, patientId: e.target.value })}
            fullWidth
          />
          <TextField
            label="진료과명"
            value={form.departmentName}
            onChange={(e) =>
              setDraftForm({ ...form, departmentName: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="간호사 ID"
            value={form.nursingId}
            onChange={(e) =>
              setDraftForm({ ...form, nursingId: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="처치내용"
            value={form.detail}
            onChange={(e) => setDraftForm({ ...form, detail: e.target.value })}
            multiline
            minRows={4}
            fullWidth
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => router.push("/medical_support/medicationTreatment")}
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
                      status: toNullableString(form.status),
                      nursingId: toNullableString(form.nursingId),
                      detail: toNullableString(form.detail),
                      patientId: form.patientId.trim()
                        ? Number(form.patientId)
                        : null,
                      patientName: toNullableString(form.patientName),
                      departmentName: toNullableString(form.departmentName),
                      procedureResultId: toNullableString(form.procedureResultId),
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
      </Box>
    </main>
  );
}
