"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
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
import {
  departmentCreateRequest,
  resetDepartmentState,
} from "@/features/staff/department/departmentSlisct";
import {
  DepartmentCreateRequest,
  DEPT_ID,
  initialDeptCreateForm,
} from "@/features/staff/department/departmentType";





const DepartmentCreate = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error, createSuccess } = useSelector((state: RootState) => state.department);

  const [form, setForm] = useState<DepartmentCreateRequest>(initialDeptCreateForm);

  


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const deptReq: DepartmentCreateRequest= {
        deptId: form.deptId.trim(),
        deptCode: form.deptCode.trim(),
        deptName: form.deptName.trim(),
        parentDeptId: form.parentDeptId?.trim() || "",
        deptTypeCd: form.deptTypeCd?.trim() || "",
        headDeptId: form.headDeptId?.trim() || "",
        headDeptName: form.headDeptName?.trim() || "",
        status: form.status?.trim() || "ACTIVE",
    }
     dispatch(departmentCreateRequest(deptReq)
    );
  };

    useEffect(() => {
    if (createSuccess) {
      alert("부서 등록이 완료되었습니다.");
      dispatch(resetDepartmentState());
      router.push("/staff/department/list");
    }
    }, [createSuccess, dispatch, router]);


    

  const handleChange =(field: keyof DepartmentCreateRequest) =>(event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };



  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        부서 등록
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        부서 마스터와 부서장 정보를 함께 등록합니다.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
         




          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="DEPT_XXXX *"
              value={form.deptId}
              onChange={handleChange("deptId")}
              fullWidth
              required
            />
          

            <TextField
              label="부서 코드 *"
              value={form.deptCode}
              onChange={handleChange("deptCode")}
              fullWidth
              required
            />
          </Stack>

          <TextField
            label="부서명 *"
            value={form.deptName}
            onChange={handleChange("deptName")}
            fullWidth
            required
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="상위부서 ID"
              value={form.parentDeptId}
              onChange={handleChange("parentDeptId")}
              fullWidth
            />

            <TextField
              label="부서유형"
              value={form.deptTypeCd}
              onChange={handleChange("deptTypeCd")}
              fullWidth
            
            />
           
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="부서장 직원 ID"
              value={form.headDeptId}
              onChange={handleChange("headDeptId")}
              fullWidth
            />
            <TextField
              label="부서장 이름"
              value={form.headDeptName}
              onChange={handleChange("headDeptName")}
              fullWidth
            />
          </Stack>

          <TextField
            label="상태"
            value={form.status}
            onChange={handleChange("status")}
            fullWidth
            select
          >
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push("/staff/department/list")}>
              취소
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "등록 중..." : "등록"}
            </Button>
          </Stack>
        </Stack>
         {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </Paper>
  );
};

export default DepartmentCreate;
