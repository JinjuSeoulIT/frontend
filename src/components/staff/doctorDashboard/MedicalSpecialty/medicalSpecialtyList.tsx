"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { medicalListRequest, specialtyListRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";

export const MedicalList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { medicalList, loading, error } = useSelector((state: RootState) => state.medical);

  useEffect(() => {
    dispatch(medicalListRequest());
  }, [dispatch]);

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">메지컬 목록</Typography>
          <Typography variant="body2" color="text.secondary">컬럼이 많은 과목 등록 마스터 기준 목록입니다.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" onClick={() => router.push("/staff/doctor/medical/create")}>메지컬 등록</Button>
          <Button variant="outlined" onClick={() => router.push("/staff/doctor/specialty/list")}>스페셜티 이동</Button>
        </Stack>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>메지컬 ID</TableCell>
            <TableCell>메지컬명</TableCell>
            <TableCell>메지컬 코드</TableCell>
            <TableCell>설명</TableCell>
            <TableCell>비고</TableCell>
            <TableCell>상태</TableCell>
            <TableCell align="center">관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && medicalList.length === 0 && (
            <TableRow><TableCell colSpan={7} align="center">조회된 메지컬이 없습니다.</TableCell></TableRow>
          )}
          {medicalList.map((item) => {
            const medicalId = item.medicalId ?? item.specialtyId ?? "";
            const medicalName = item.medicalName ?? item.specialtyName ?? "-";
            const medicalCode = item.medicalCode ?? item.specialtyCode ?? "-";

            return (
              <TableRow key={medicalId} hover>
                <TableCell>{medicalId}</TableCell>
                <TableCell>{medicalName}</TableCell>
                <TableCell>{medicalCode}</TableCell>
                <TableCell>{item.description ?? "-"}</TableCell>
                <TableCell>{item.rmk ?? "-"}</TableCell>
                <TableCell>{item.status ?? "-"}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button size="small" variant="outlined" onClick={() => router.push(`/staff/doctor/medical/${medicalId}/detail`)}>상세</Button>
                    <Button size="small" variant="outlined" onClick={() => router.push(`/staff/doctor/medical/${medicalId}/edit`)}>수정</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => router.push(`/staff/doctor/medical/${medicalId}/delete`)}>삭제</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  );
};

export const SpecialtyList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { specialtyList, loading, error } = useSelector((state: RootState) => state.specialty);

  useEffect(() => {
    dispatch(specialtyListRequest());
  }, [dispatch]);

  return (
    <Paper sx={{ p: 4, maxWidth: 1400, mx: "auto", mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">스페셜티 목록</Typography>
          <Typography variant="body2" color="text.secondary">doctor + medical 이 합쳐진 배정 결과 기준 목록입니다.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" onClick={() => router.push("/staff/doctor/specialty/create")}>스페셜티 등록</Button>
          <Button variant="outlined" onClick={() => router.push("/staff/doctor/medical/list")}>메지컬 이동</Button>
        </Stack>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>직원 ID</TableCell>
            <TableCell>의사명</TableCell>
            <TableCell>의사 타입</TableCell>
            <TableCell>메지컬 ID</TableCell>
            <TableCell>메지컬명</TableCell>
            <TableCell>메지컬 코드</TableCell>
            <TableCell>대표 여부</TableCell>
            <TableCell>배정일</TableCell>
            <TableCell align="center">관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && specialtyList.length === 0 && (
            <TableRow><TableCell colSpan={9} align="center">조회된 스페셜티가 없습니다.</TableCell></TableRow>
          )}
          {specialtyList.map((item, index) => {
            const rowId = item.specialtyAssignId ?? item.specialtyId ?? item.medicalId ?? item.staffId ?? `${item.specialtyId ?? item.medicalId ?? "specialty"}-${index}`;
            const medicalId = item.medicalId ?? item.specialtyId ?? "-";
            const medicalName = item.medicalName ?? item.specialtyName ?? "-";
            const medicalCode = item.medicalCode ?? item.specialtyCode ?? "-";

            return (
              <TableRow key={rowId} hover>
                <TableCell>{item.staffId ?? "-"}</TableCell>
                <TableCell>{item.doctorName ?? item.name ?? "-"}</TableCell>
                <TableCell>{item.doctorType ?? "-"}</TableCell>
                <TableCell>{medicalId}</TableCell>
                <TableCell>{medicalName}</TableCell>
                <TableCell>{medicalCode}</TableCell>
                <TableCell>{item.primaryYn ?? "-"}</TableCell>
                <TableCell>{item.assignedAt ?? "-"}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button size="small" variant="outlined" onClick={() => router.push(`/staff/doctor/specialty/${rowId}/detail`)}>상세</Button>
                    <Button size="small" variant="outlined" onClick={() => router.push(`/staff/doctor/specialty/${rowId}/edit`)}>수정</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => router.push(`/staff/doctor/specialty/${rowId}/delete`)}>삭제</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  );
};

export default MedicalList;
