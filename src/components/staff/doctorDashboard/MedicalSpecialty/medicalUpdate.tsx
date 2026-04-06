"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { medicalDetailRequest, medicalUpdateRequest, resetMedicalState } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";
import { initialMedicalUpdateForm, type MedicalUpdateRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtytypes";

export const MedicalUpdate = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams<{ medicalid: string }>();
  const medicalId = Number(params.medicalid ?? 0);
  const { medicalDetail, loading, error, updateSuccess } = useSelector((state: RootState) => state.medical);
  const [form, setForm] = useState<MedicalUpdateRequest>(initialMedicalUpdateForm);

  useEffect(() => {
    if (medicalId > 0) dispatch(medicalDetailRequest(medicalId));
  }, [dispatch, medicalId]);

  useEffect(() => {
    if (medicalDetail) {
      setForm({
        medicalName: medicalDetail.medicalName ?? medicalDetail.specialtyName ?? "",
        medicalCode: medicalDetail.medicalCode ?? medicalDetail.specialtyCode ?? "",
        description: medicalDetail.description ?? "",
        rmk: medicalDetail.rmk ?? "",
        status: medicalDetail.status ?? "ACTIVE",
        specialtyName: medicalDetail.medicalName ?? medicalDetail.specialtyName ?? "",
        specialtyCode: medicalDetail.medicalCode ?? medicalDetail.specialtyCode ?? "",
      });
    }
  }, [medicalDetail]);

  useEffect(() => {
    if (updateSuccess) {
      alert("메지컬 수정이 완료되었습니다.");
      dispatch(resetMedicalState());
      router.push(`/staff/doctor/medical/${medicalId}/detail`);
    }
  }, [dispatch, medicalId, router, updateSuccess]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(medicalUpdateRequest({
      medicalId,
      medicalReq: {
        medicalName: form.medicalName.trim(),
        medicalCode: form.medicalCode.trim(),
        description: form.description.trim(),
        rmk: form.rmk.trim(),
        status: form.status.trim(),
        specialtyName: form.medicalName.trim(),
        specialtyCode: form.medicalCode.trim(),
      },
    }));
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>메지컬 수정</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField label="메지컬명 *" name="medicalName" value={form.medicalName} onChange={handleChange} fullWidth required />
          <TextField label="메지컬 코드 *" name="medicalCode" value={form.medicalCode} onChange={handleChange} fullWidth required />
          <TextField label="설명" name="description" value={form.description} onChange={handleChange} fullWidth multiline minRows={3} />
          <TextField label="비고" name="rmk" value={form.rmk} onChange={handleChange} fullWidth multiline minRows={2} />
          <TextField select label="상태" name="status" value={form.status} onChange={handleChange} fullWidth>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </TextField>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push(`/staff/doctor/medical/${medicalId}/detail`)}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? "수정 중..." : "수정"}</Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>
    </Paper>
  );
};

export default MedicalUpdate;
