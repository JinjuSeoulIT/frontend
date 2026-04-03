"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { departmentDetailRequest, departmentUpdateRequest, resetDepartmentState } from "@/features/staff/department/departmentSlisct";
import { DepartmentNumber, DepartmentUpdateRequest, initialDeptUpdateForm } from "@/features/staff/department/departmentType";



const DepartmentUpdate = ({ deptId }: DepartmentNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { Departmentdetail, loading, error, updateSuccess } = useSelector((state: RootState) => state.department );

  const [form, setForm] = useState<DepartmentUpdateRequest>(initialDeptUpdateForm);
  //상세조회 데이터가져올때  form 초기값 세팅을 딱 1번
  const loadedRef = useRef(false);


  useEffect(() => {
    if (!deptId) return;
    {dispatch(departmentDetailRequest(deptId));}
    }, [dispatch, deptId]);



  //디테일용
  useEffect(() => {
    if (!Departmentdetail || loadedRef.current) return;
     
      setForm({
        deptId: Departmentdetail.deptId || "",
        deptCode: Departmentdetail.deptCode || "",
        deptName: Departmentdetail.deptName || "",
        parentDeptId: Departmentdetail.parentDeptId || "",
        deptTypeCd: Departmentdetail.deptTypeCd || "",
        headDeptId: Departmentdetail.headDeptId || "",
        headDeptName: Departmentdetail.headDeptName || "",
        status: Departmentdetail.status || "ACTIVE",
       });
      
        loadedRef.current = true;
    
    
  }, [Departmentdetail]);

  useEffect(() => {
    if (updateSuccess) {
      alert("부서 수정이 완료되었습니다.");
      dispatch(resetDepartmentState());
      router.push(`/staff/department/list`);
    }
  }, [updateSuccess, dispatch, router, deptId]);



  const handleChange =(field: keyof DepartmentUpdateRequest) =>(event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: FormEvent) => {
  event.preventDefault();

    dispatch(departmentUpdateRequest({
        deptId,
       
        deptReq: {
          deptId,
          deptCode: form.deptCode.trim(),
          deptName: form.deptName.trim(),
          parentDeptId: form.parentDeptId?.trim() || "",
          deptTypeCd: form.deptTypeCd?.trim() || "",
          headDeptId: form.headDeptId?.trim() || "",
          headDeptName: form.headDeptName?.trim() || "",
          status: form.status?.trim() || "ACTIVE",
        },
      })
    );
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        부서 수정
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        부서 마스터와 부서장 정보를 수정합니다.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="부서 ID" value={deptId} fullWidth disabled />
            <TextField label="부서 코드" value={form.deptCode} onChange={handleChange("deptCode")} fullWidth required />
          </Stack>

          <TextField label="부서명" value={form.deptName} onChange={handleChange("deptName")} fullWidth required />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          
          <TextField label="상위부서 ID" value={form.parentDeptId} onChange={handleChange("parentDeptId")} fullWidth />
            
          <TextField label="부서유형" value={form.deptTypeCd} 
          onChange={handleChange("deptTypeCd")} fullWidth >

            </TextField>



          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="부서장 직원 ID" value={form.headDeptId} onChange={handleChange("headDeptId")} fullWidth />
            <TextField label="부서장 이름" value={form.headDeptName} onChange={handleChange("headDeptName")} fullWidth />
          </Stack>

          <TextField label="상태" value={form.status} onChange={handleChange("status")} fullWidth select>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push(`/staff/department/list`)}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "수정 중..." : "수정"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default DepartmentUpdate;
