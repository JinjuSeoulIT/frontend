"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { medicalDetailRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";

export const MedicalDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams<{ medicalid: string }>();
  const medicalId = Number(params.medicalid ?? 0);
  const { medicalDetail, loading, error } = useSelector((state: RootState) => state.medical);

  const resolvedMedicalId = medicalDetail?.medicalId ?? medicalDetail?.specialtyId ?? "-";
  const resolvedMedicalName = medicalDetail?.medicalName ?? medicalDetail?.specialtyName ?? "-";
  const resolvedMedicalCode = medicalDetail?.medicalCode ?? medicalDetail?.specialtyCode ?? "-";
  const resolvedCreatedAt = medicalDetail?.createdAt ?? medicalDetail?.created_at ?? "-";
  const resolvedUpdatedAt = medicalDetail?.updatedAt ?? medicalDetail?.updated_at ?? "-";

  useEffect(() => {
    if (medicalId > 0) dispatch(medicalDetailRequest(medicalId));
  }, [dispatch, medicalId]);

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>메지컬 상세</Typography>
      {loading && <Typography>조회 중...</Typography>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {medicalDetail && (
        <Stack spacing={1.5}>
          <Typography><strong>메지컬 ID:</strong> {resolvedMedicalId}</Typography>
          <Typography><strong>메지컬명:</strong> {resolvedMedicalName}</Typography>
          <Typography><strong>메지컬 코드:</strong> {resolvedMedicalCode}</Typography>
          <Typography><strong>설명:</strong> {medicalDetail.description ?? "-"}</Typography>
          <Typography><strong>비고:</strong> {medicalDetail.rmk ?? "-"}</Typography>
          <Typography><strong>상태:</strong> {medicalDetail.status ?? "-"}</Typography>
          <Typography><strong>생성일:</strong> {resolvedCreatedAt}</Typography>
          <Typography><strong>수정일:</strong> {resolvedUpdatedAt}</Typography>
        </Stack>
      )}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => router.push("/staff/doctor/medical/list")}>목록</Button>
        <Button variant="contained" onClick={() => router.push(`/staff/doctor/medical/${medicalId}/edit`)}>수정</Button>
      </Stack>
    </Paper>
  );
};

export default MedicalDetail;
