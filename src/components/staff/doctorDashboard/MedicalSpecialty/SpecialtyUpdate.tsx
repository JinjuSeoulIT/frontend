"use client";

import { resetSpecialtyState, specialtyDetailRequest, specialtyUpdateRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";
import { initialSpecialtyUpdateForm, SpecialtyUpdateRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtytypes";
import { RootState } from "@/store/rootReducer";
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const SpecialtyUpdate = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams<{ specialtyid: string }>();
  const specialtyId = String(params.specialtyid ?? "");
  const { specialtyDetail, loading, error, updateSuccess } = useSelector((state: RootState) => state.specialty);
  const [form, setForm] = useState<SpecialtyUpdateRequest>(initialSpecialtyUpdateForm);

  useEffect(() => {
    if (specialtyId) dispatch(specialtyDetailRequest(specialtyId));
  }, [dispatch, specialtyId]);

  useEffect(() => {
    if (specialtyDetail) {
      setForm({
        assignedAt: specialtyDetail.assignedAt ?? "",
        primaryYn: specialtyDetail.primaryYn ?? "Y",
        rmk: specialtyDetail.rmk ?? "",
      });
    }
  }, [specialtyDetail]);

  useEffect(() => {
    if (updateSuccess) {
      alert("스페셜티 수정이 완료되었습니다.");
      dispatch(resetSpecialtyState());
      router.push(`/staff/doctor/specialty/${specialtyId}/detail`);
    }
  }, [dispatch, specialtyId, router, updateSuccess]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(specialtyUpdateRequest({
      specialtyId,
      specialtyReq: {
        assignedAt: form.assignedAt.trim(),
        primaryYn: form.primaryYn.trim(),
        rmk: form.rmk.trim(),
      },
    }));
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>스페셜티 수정</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField label="직원 ID" value={specialtyDetail?.staffId ?? ""} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="메지컬 ID" value={specialtyDetail?.medicalId ?? specialtyDetail?.specialtyId ?? ""} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="배정일" name="assignedAt" value={form.assignedAt} onChange={handleChange} fullWidth placeholder="YYYY-MM-DD" />
          <TextField select label="대표 여부" name="primaryYn" value={form.primaryYn} onChange={handleChange} fullWidth>
            <MenuItem value="Y">Y</MenuItem>
            <MenuItem value="N">N</MenuItem>
          </TextField>
          <TextField label="비고" name="rmk" value={form.rmk} onChange={handleChange} fullWidth multiline minRows={3} />
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push(`/staff/doctor/specialty/${specialtyId}/detail`)}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? "수정 중..." : "수정"}</Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>
    </Paper>
  );
};

export default SpecialtyUpdate;
