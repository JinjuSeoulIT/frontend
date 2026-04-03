"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  medicalDeleteRequest,
  medicalDetailRequest,
  resetMedicalState,
  resetSpecialtyState,
  specialtyDeleteRequest,
  specialtyDetailRequest,
} from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";

export const MedicalDelete = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams<{ medicalid: string }>();
  const medicalId = Number(params.medicalid ?? 0);
  const { medicalDetail, loading, error, deleteSuccess } = useSelector((state: RootState) => state.medical);
  const medicalName = medicalDetail?.medicalName ?? medicalDetail?.specialtyName ?? medicalDetail?.medicalId ?? medicalDetail?.specialtyId ?? "-";

  useEffect(() => {
    if (medicalId > 0) dispatch(medicalDetailRequest(medicalId));
  }, [dispatch, medicalId]);

  useEffect(() => {
    if (deleteSuccess) {
      alert("메지컬 삭제가 완료되었습니다.");
      dispatch(resetMedicalState());
      router.push("/staff/doctor/medical/list");
    }
  }, [deleteSuccess, dispatch, router]);

  return (
    <Paper sx={{ p: 4, maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>메지컬 삭제</Typography>
      <Typography sx={{ mb: 2 }}>
        {medicalDetail ? `${medicalName} 메지컬을 삭제하시겠습니까?` : "삭제 대상을 확인합니다."}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => router.push(`/staff/doctor/medical/${medicalId}/detail`)}>취소</Button>
        <Button color="error" variant="contained" disabled={loading} onClick={() => dispatch(medicalDeleteRequest(String(medicalId)))}>{loading ? "삭제 중..." : "삭제"}</Button>
      </Stack>
    </Paper>
  );
};

export const SpecialtyDelete = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams<{ specialtyid: string }>();
  const specialtyId = String(params.specialtyid ?? "");
  const { specialtyDetail, loading, error, deleteSuccess } = useSelector((state: RootState) => state.specialty);
  const targetLabel = specialtyDetail?.doctorName ?? specialtyDetail?.name ?? specialtyDetail?.staffId ?? specialtyId;

  useEffect(() => {
    if (specialtyId) dispatch(specialtyDetailRequest(specialtyId));
  }, [dispatch, specialtyId]);

  useEffect(() => {
    if (deleteSuccess) {
      alert("스페셜티 삭제가 완료되었습니다.");
      dispatch(resetSpecialtyState());
      router.push("/staff/doctor/specialty/list");
    }
  }, [deleteSuccess, dispatch, router]);

  return (
    <Paper sx={{ p: 4, maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>스페셜티 삭제</Typography>
      <Typography sx={{ mb: 2 }}>
        {specialtyDetail ? `${targetLabel} 배정 정보를 삭제하시겠습니까?` : "삭제 대상을 확인합니다."}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => router.push(`/staff/doctor/specialty/${specialtyId}/detail`)}>취소</Button>
        <Button color="error" variant="contained" disabled={loading} onClick={() => dispatch(specialtyDeleteRequest(specialtyId))}>{loading ? "삭제 중..." : "삭제"}</Button>
      </Stack>
    </Paper>
  );
};

export default MedicalDelete;
