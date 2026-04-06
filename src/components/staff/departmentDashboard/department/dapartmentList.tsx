"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { departmentListRequest } from "@/features/staff/department/departmentSlisct";
import { DeptTypeLabel } from "@/features/staff/department/departmentType";




  const DepartmentList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { Departmentlist, loading, error } = useSelector((state: RootState) => state.department);

  useEffect(() => { dispatch(departmentListRequest()); }, [dispatch]);

  return (
    <Paper sx={{ p: 4, maxWidth: 1300, mx: "auto", mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight="bold">부서 목록

        </Typography>
        <Typography variant="body2" color="text.secondary">등록된 부서와 부서장 정보를 조회합니다.</Typography>
        </Box>
        
         <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }} >
        <Button variant="contained" onClick={() => router.push("/staff/department/create")}>부서 등록</Button>

          <Button variant="contained" onClick={() => router.push("/staff/Basiclnfo/list")}sx={{ bgcolor: "#da342f" }}>직원 목록</Button>
          </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>부서ID</TableCell>
            <TableCell>부서업무명</TableCell>
            <TableCell>부서명</TableCell>
            <TableCell>상위부서</TableCell>
            <TableCell>부서유형</TableCell>
            <TableCell>부서장 ID</TableCell>
            <TableCell>부서장 이름</TableCell>
            <TableCell>상태</TableCell>
            <TableCell align="center">관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && Departmentlist.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center">조회된 부서가 없습니다.</TableCell>
            </TableRow>
          )}
          {Departmentlist.map((item) => (
              <TableRow key={item.deptId} hover>
                
              <TableCell>{item.deptId}</TableCell>

              <TableCell>{item.deptCode}</TableCell>

              <TableCell>{item.deptName}</TableCell>

              <TableCell>{item.parentDeptId || "-"}</TableCell>

              <TableCell>{DeptTypeLabel(item.deptTypeCd)}</TableCell>

              <TableCell>{item.headDeptId || "-"}</TableCell>

              <TableCell>{item.headDeptName || "-"}</TableCell>

              <TableCell>{item.status || "-"}</TableCell>
              <TableCell align="center">


                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                 
                 
                  <Button size="small" variant="outlined" 
                  onClick={() => router.push(`/staff/department/${item.deptId}/detail`)}>상세</Button>

                  <Button size="small" variant="outlined" 
                  onClick={() => router.push(`/staff/department/${item.deptId}/edit`)}>수정</Button>

                  <Button size="small" color="error"
                   variant="outlined" onClick={() => router.push(`/staff/department/${item.deptId}/delete`)}>삭제</Button>
                </Stack>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default DepartmentList;
