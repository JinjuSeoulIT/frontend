"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { departmentDeleteRequest, departmentDetailRequest, resetDepartmentState } from "@/features/staff/department/departmentSlisct";
import { DepartmentNumber } from "@/features/staff/department/departmentType";


  const DepartmentDelete = ({ deptId }: DepartmentNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();
 
  const { Departmentdetail, loading, error, deleteSuccess } = useSelector((state: RootState) => state.department);

  useEffect(() => {
  if (deptId) {
  dispatch(departmentDetailRequest(deptId));
  }
  }, [dispatch, deptId]);

  useEffect(() => {
  if (deleteSuccess) {
  alert("부서 삭제가 완료되었습니다.");
  dispatch(resetDepartmentState());
  router.push("/staff/department/list");
  }
  }, [deleteSuccess, dispatch, router]);

  const handleDelete = () => {
  const ok = window.confirm("정말 삭제하시겠습니까?");
  if (!ok) return;

  dispatch(departmentDeleteRequest(deptId));
  };

  return (
  <Paper sx={{ p: 4, maxWidth: 700, mx: "auto", mt: 4 }}>
  <Typography variant="h5" fontWeight="bold" gutterBottom color="error">
   부서 삭제
  </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      삭제 전 부서 정보를 다시 확인해주세요.
      </Typography>

     

      <Stack spacing={2}>
        <Typography>
        <strong>부서 ID:</strong> {Departmentdetail?.deptId || deptId}
        </Typography>
        <Typography>
        <strong>부서명:</strong> {Departmentdetail?.deptName || "-"}
        </Typography>
        <Typography>
        <strong>부서유형:</strong> {Departmentdetail?.deptTypeCd || "-"}
        </Typography>


      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2 }}>
      <Button
      variant="outlined"
      onClick={() => router.push(`/staff/department/${deptId}`)}>
      취소
      </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={loading}
          >
          {loading ? "삭제 중..." : "삭제"}
          </Button>
          </Stack>
          {error && (<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>)}
          </Stack>
          </Paper>
          );
        
          };

export default DepartmentDelete;