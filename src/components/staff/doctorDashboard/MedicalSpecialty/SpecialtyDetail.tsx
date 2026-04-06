"use client";

import { specialtyDetailRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";
import { RootState } from "@/store/rootReducer";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const SpecialtyDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams<{ specialtyid: string }>();
  const specialtyId = String(params.specialtyid ?? "");
  const { specialtyDetail, loading, error } = useSelector((state: RootState) => state.specialty);

  const resolvedMedicalId = specialtyDetail?.medicalId ?? specialtyDetail?.specialtyId ?? "-";
  const resolvedMedicalName = specialtyDetail?.medicalName ?? specialtyDetail?.specialtyName ?? "-";
  const resolvedMedicalCode = specialtyDetail?.medicalCode ?? specialtyDetail?.specialtyCode ?? "-";

  useEffect(() => {
    if (specialtyId) dispatch(specialtyDetailRequest(specialtyId));
  }, [dispatch, specialtyId]);

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>스페셜티 상세</Typography>
      {loading && <Typography>조회 중...</Typography>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {specialtyDetail && (
        <Stack spacing={1.5}>
          <Typography><strong>직원 ID:</strong> {specialtyDetail.staffId ?? "-"}</Typography>
          <Typography><strong>의사명:</strong> {specialtyDetail.doctorName ?? specialtyDetail.name ?? "-"}</Typography>
          <Typography><strong>의사 타입:</strong> {specialtyDetail.doctorType ?? "-"}</Typography>
          <Typography><strong>면허번호:</strong> {specialtyDetail.licenseNo ?? "-"}</Typography>
          <Typography><strong>내선번호:</strong> {specialtyDetail.extNo ?? "-"}</Typography>
          <Typography><strong>메지컬 ID:</strong> {resolvedMedicalId}</Typography>
          <Typography><strong>메지컬명:</strong> {resolvedMedicalName}</Typography>
          <Typography><strong>메지컬 코드:</strong> {resolvedMedicalCode}</Typography>
          <Typography><strong>설명:</strong> {specialtyDetail.description ?? "-"}</Typography>
          <Typography><strong>배정일:</strong> {specialtyDetail.assignedAt ?? "-"}</Typography>
          <Typography><strong>대표 여부:</strong> {specialtyDetail.primaryYn ?? "-"}</Typography>
          <Typography><strong>비고:</strong> {specialtyDetail.rmk ?? "-"}</Typography>
          <Typography><strong>상태:</strong> {specialtyDetail.status ?? "-"}</Typography>
        </Stack>
      )}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => router.push("/staff/doctor/specialty/list")}>목록</Button>
        <Button variant="contained" onClick={() => router.push(`/staff/doctor/specialty/${specialtyId}/edit`)}>수정</Button>
      </Stack>
    </Paper>
  );
};

export default SpecialtyDetail;
