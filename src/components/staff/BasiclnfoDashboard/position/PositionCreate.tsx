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
  positionCreateRequest,
  resetPositionState,
} from "@/features/staff/position/positionSlice";
import {
  initialPositionForm,
  PositionRequest,
} from "@/features/staff/position/positiontypes";





  const POSITION_TYPE_OPTIONS = ["DOCTOR", "NURSE", "RECEPTION", "ADMIN", "COMMON"];
  const MANAGER_YN_OPTIONS = ["Y", "N"];


  //직책
  const PositionCreate = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, createSuccess } = useSelector( (state: RootState) => state.position);

  const [form, setForm] = useState<PositionRequest>(initialPositionForm);

    useEffect(() => {
    if (createSuccess) {
      alert("직책 등록이 완료되었습니다."); //alert팝업창
      dispatch(resetPositionState());
      router.push("/staff/position/list");
    }
    }, [createSuccess, dispatch, router]);

      const handleChange =
     (field: keyof PositionRequest) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      };

      const handleSubmit = (event: FormEvent) => {
      event.preventDefault();
 
      dispatch(
      positionCreateRequest({
        positionId: form.positionId.trim(),
        positionType: form.positionType.trim(),
        positionCode: form.positionCode.trim(),
        positionLevel: form.positionLevel.trim(),
        positionName: form.positionName.trim(),
        managerYn: form.managerYn.trim() || "N",
        rmk: form.rmk.trim(),
      })
      );
      };

  return (
          <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
           직책 등록
           </Typography>

           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
           직책 마스터 정보를 등록합니다.
           </Typography>

           <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
             {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="직책 ID *"
              value={form.positionId}
              onChange={handleChange("positionId")}
              fullWidth
              required
            />
            <TextField
              label="직책 코드 *"
              value={form.positionCode}
              onChange={handleChange("positionCode")}
              fullWidth
              required
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="직책 유형 *"
              value={form.positionType}
              onChange={handleChange("positionType")}
              fullWidth
              required
              select
            >
              {POSITION_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="직책 레벨"
              value={form.positionLevel}
              onChange={handleChange("positionLevel")}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="직책명 *"
              value={form.positionName}
              onChange={handleChange("positionName")}
              fullWidth
              required
            />
            <TextField
              label="관리자 여부"
              value={form.managerYn}
              onChange={handleChange("managerYn")}
              fullWidth
              select
            >
              {MANAGER_YN_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="비고"
            value={form.rmk}
            onChange={handleChange("rmk")}
            fullWidth
            multiline
            minRows={3}
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push("/staff/position/list")}>
              취소
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "등록 중..." : "등록"}
            </Button>
            </Stack>
           </Stack>
           </Box>
          </Paper>
  );
};

export default PositionCreate;
