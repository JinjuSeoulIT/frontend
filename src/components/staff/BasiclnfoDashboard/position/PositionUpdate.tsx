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
import {
  positionDetailRequest,
  positionUpdateRequest,
  resetPositionState,
} from "@/features/staff/position/positionSlice";
import {
  initialPositionForm,
  PositionIdParam,
  PositionRequest,
} from "@/features/staff/position/positiontypes";

const POSITION_TYPE_OPTIONS = ["DOCTOR", "NURSE", "RECEPTION", "ADMIN", "COMMON"];
const MANAGER_YN_OPTIONS = ["Y", "N"];



//직책
const PositionUpdate = ({ positionId }: PositionIdParam) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { positionDetail, loading, error, updateSuccess } = useSelector(
    (state: RootState) =>
      (state as any).position ?? {
        positionDetail: null,
        loading: false,
        error: null,
        updateSuccess: false,
      }
  );

  const [form, setForm] = useState<PositionRequest>(initialPositionForm);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!positionId) return;
    dispatch(positionDetailRequest(positionId));
  }, [dispatch, positionId]);

  useEffect(() => {
    if (!positionDetail || loadedRef.current) return;
    setForm({
      positionId: positionDetail.positionId || "",
      positionType: positionDetail.positionType || "",
      positionCode: positionDetail.positionCode || "",
      positionLevel: positionDetail.positionLevel || "",
      positionName: positionDetail.positionName || "",
      managerYn: positionDetail.managerYn || "N",
      rmk: positionDetail.rmk || "",
    });
    loadedRef.current = true;
  }, [positionDetail]);

  useEffect(() => {
    if (updateSuccess) {
      alert("직책 수정이 완료되었습니다.");
      dispatch(resetPositionState());
      router.push("/staff/position/list");
    }
  }, [updateSuccess, dispatch, router]);

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
      positionUpdateRequest({
        positionId,
        positionReq: {
          positionId,
          positionType: form.positionType.trim(),
          positionCode: form.positionCode.trim(),
          positionLevel: form.positionLevel.trim(),
          positionName: form.positionName.trim(),
          managerYn: form.managerYn.trim() || "N",
          rmk: form.rmk.trim(),
        },
      })
    );
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        직책 수정
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        직책 마스터 정보를 수정합니다.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="직책 ID" value={positionId} fullWidth disabled />
            <TextField
              label="직책 코드"
              value={form.positionCode}
              onChange={handleChange("positionCode")}
              fullWidth
              required
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="직책 유형"
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
              label="직책명"
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
              {loading ? "수정 중..." : "수정"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default PositionUpdate;
