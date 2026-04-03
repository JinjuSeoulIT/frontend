"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { departmentDetailRequest, resetDepartmentState } from "@/features/staff/department/departmentSlisct";
import { DepartmentNumber, DeptTypeLabel } from "@/features/staff/department/departmentType";



  const DepartmentDetail = ({ deptId }: DepartmentNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();


  const { Departmentdetail, loading, error } = useSelector((state: RootState) => state.department);

  
  useEffect(() => {
    if (deptId) dispatch(departmentDetailRequest(deptId));
    return () => { dispatch(resetDepartmentState()); };
  }, [dispatch, deptId]);




  
  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        부서 상세
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        부서 마스터와 부서장 정보를 확인합니다.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && Departmentdetail && (
        <Stack spacing={2}>
          <Box><Typography variant="subtitle2" color="text.secondary">부서 ID
            </Typography><Typography>{Departmentdetail.deptId}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">부서 코드
            </Typography><Typography>{Departmentdetail.deptCode}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">부서명
            </Typography><Typography>{Departmentdetail.deptName}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">상위부서 ID
            </Typography><Typography>{Departmentdetail.parentDeptId || "-"}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">부서유형
            </Typography><Typography>{DeptTypeLabel(Departmentdetail.deptTypeCd)}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">부서장 직원 ID
            </Typography><Typography>{Departmentdetail.headDeptId || "-"}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">부서장 이름
            </Typography><Typography>{Departmentdetail.headDeptName || "-"}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">상태
            </Typography><Typography>{Departmentdetail.status || "-"}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">생성일
            </Typography><Typography>{Departmentdetail.createdAt || "-"}</Typography></Box>
          <Divider />


          <Box><Typography variant="subtitle2" color="text.secondary">수정일
            </Typography><Typography>{Departmentdetail.updatedAt || "-"}</Typography></Box>



          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button variant="outlined" onClick={() => router.push("/staff/department/list")}>목록
            </Button>

            <Button variant="contained" onClick={() => router.push(`/staff/department/${deptId}/edit`)}>수정
            </Button>

          </Stack>
        </Stack>
      )}
    </Paper>
  );
};

export default DepartmentDetail;
