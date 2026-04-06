"use client";

import { Button, Paper, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const DoctorMedicalSpecialtyHub = () => {
  const router = useRouter();

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        의사 기준정보 분리 허브
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        메지컬은 과목 등록 마스터, 스페셜티는 doctor + medical 배정 결과 기준으로 정리했습니다.
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Button variant="contained" onClick={() => router.push("/staff/doctor/medical/list")}>메지컬 목록</Button>
        <Button variant="contained" onClick={() => router.push("/staff/doctor/specialty/list")}>스페셜티 목록</Button>
        <Button variant="outlined" onClick={() => router.push("/staff/doctor/list")}>의사 목록</Button>
      </Stack>
    </Paper>
  );
};

export default DoctorMedicalSpecialtyHub;
