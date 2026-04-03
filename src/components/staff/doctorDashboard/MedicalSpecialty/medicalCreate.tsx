"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { medicalCreateRequest, resetMedicalState } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";
import { initialMedicalCreateForm, type MedicalCreateRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtytypes";

export const MedicalCreate = () => {
  const dispatch = useDispatch();

  const router = useRouter();

  const { loading, error, createSuccess } = useSelector((state: RootState) => state.medical);

  const [form, setForm] = useState<MedicalCreateRequest>(initialMedicalCreateForm);



  
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    dispatch(medicalCreateRequest({
    specialtyId: Number(String(form.specialtyId).trim()),
    specialtyName: form.specialtyName.trim(),
    specialtyCode: form.specialtyCode.trim(),
    description: form.description.trim(),
    rmk: form.rmk.trim(),
    status: form.status.trim(),
    }));
    };

  useEffect(() => {
    if (createSuccess) {
      alert("메지컬 등록이 완료되었습니다.");
      dispatch(resetMedicalState());
      router.push("/staff/doctor/medical/list");
    }
  }, [createSuccess, dispatch, router]);

  return (
      <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>메지컬 등록</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        메지컬 화면은 컬럼이 많은 과목 등록 마스터 기준으로 수정했습니다.
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField label="메지컬 ID *" 
          name="specialtyId" 
          value={form.specialtyId} 
          onChange={handleChange} fullWidth required />


          <TextField label="메지컬명 *" 
          name="specialtyName" value={form.specialtyName} 
          onChange={handleChange} fullWidth required />


          <TextField label="메지컬 코드 *" 
          name="specialtyCode" value={form.specialtyCode} 
          onChange={handleChange} fullWidth required />


          <TextField label="설명" 
          name="description" value={form.description}
          onChange={handleChange} fullWidth multiline minRows={3} />

          <TextField label="비고" 
          name="rmk" value={form.rmk} 
          onChange={handleChange} fullWidth multiline minRows={2} />


          <TextField select label="상태" 
          name="status" value={form.status} 
          onChange={handleChange} fullWidth>

          <MenuItem value="ACTIVE">ACTIVE</MenuItem>
          <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </TextField>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          
          <Button variant="outlined" onClick={() => router.push("/staff/doctor/medical/list")}>취소</Button>
          
          <Button type="submit" variant="contained" disabled={loading}>{loading ? "등록 중..." : "등록"}</Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>
    </Paper>
  );
};

export default MedicalCreate;
