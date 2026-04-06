"use client";




import { medicalListRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";
import { RootState } from "@/store/rootReducer";
import { Alert, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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
          <Typography variant="body2" color="text.secondary">DOCTOR_SPECIALTY_MEDICAL 마스터 목록입니다.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" onClick={() => router.push("/staff/doctor/medical/create")}>메지컬 등록</Button>

          <Button variant="outlined" onClick={() => router.push("/staff/doctor/Specialty/create")}>스페셜티 등록</Button>
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
          {medicalList.map((item, index) => {
            const specialtyId = item.specialtyId ?? `${index}`;
            return (
              <TableRow key={String(specialtyId)} hover>
                <TableCell>{item.specialtyId ?? "-"}</TableCell>
                <TableCell>{item.specialtyName ?? "-"}</TableCell>
                <TableCell>{item.specialtyCode ?? "-"}</TableCell>
                <TableCell>{item.descripion ?? "-"}</TableCell>
                <TableCell>{item.rmk ?? "-"}</TableCell>
                <TableCell>{item.status ?? "-"}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => router.push(`/staff/doctor/medical/${specialtyId}/detail`)}>상세</Button>
                   
                    <Button size="small" 
                    variant="outlined" 
                    onClick={() => router.push(`/staff/doctor/medical/${specialtyId}/edit`)}>수정</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => router.push(`/staff/doctor/medical/${specialtyId}/delete`)}>삭제</Button>
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
