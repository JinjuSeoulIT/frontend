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
import { MedicationRecordActions } from "@/features/medical_support/medicationRecord/medicationRecordSlice";
import { MEDICATION_RECORD_STATUS_OPTIONS } from "@/components/medical_support/medicationRecord/medicationRecordDisplay";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type MedicationRecordEditForm = {
  medicationRecordId: string;
  medicationId: string;
  administeredAt: string;
  doseNumber: string;
  doseUnit: string;
  doseKind: string;
  nursingId: string;
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
  status: item?.status ?? "",
  patientName: item?.patientName ?? "",
  patientId: item?.patientId ?? "",
  departmentName: item?.departmentName ?? "",
});

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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
      <Box sx={{ maxWidth: 840 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          투약 기록 수정
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
            label="투약기록 ID"
            value={form.medicationRecordId}
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
            {MEDICATION_RECORD_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="투약일시"
            value={form.administeredAt}
            onChange={(e) =>
              setDraftForm({ ...form, administeredAt: e.target.value })
            }
            helperText="예: 2026-04-09 09:00"
            fullWidth
          />
          <TextField
            label="투약량"
            value={form.doseNumber}
            onChange={(e) => setDraftForm({ ...form, doseNumber: e.target.value })}
            fullWidth
          />
          <TextField
            label="투약단위"
            value={form.doseUnit}
            onChange={(e) => setDraftForm({ ...form, doseUnit: e.target.value })}
            fullWidth
          />
          <TextField
            label="투약종류"
            value={form.doseKind}
            onChange={(e) => setDraftForm({ ...form, doseKind: e.target.value })}
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

          <Box
            sx={{
              mt: 1,
              p: 2,
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 2,
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              환자 정보
            </Typography>
            <Stack spacing={2}>
              <TextField label="환자명" value={form.patientName} disabled fullWidth />
              <TextField label="환자 ID" value={form.patientId} disabled fullWidth />
              <TextField
                label="진료과"
                value={form.departmentName}
                disabled
                fullWidth
              />
            </Stack>
          </Box>

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
      </Box>
    </main>
  );
}
