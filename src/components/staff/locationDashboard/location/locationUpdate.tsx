"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  locationDetailRequest,
  locationUpdateRequest,
  resetLocationState,
} from "@/features/staff/location/locationSlice";
import {
  initialLocationUpdateForm,
  LocationIdParam,
  LocationUpdateRequest,
} from "@/features/staff/location/locationtypes";

const LocationUpdate = ({ deptId }: LocationIdParam) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { locationDetail, loading, error, updateSuccess } = useSelector((state: RootState) => state.location);
  const [form, setForm] = useState<LocationUpdateRequest>(initialLocationUpdateForm);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!deptId) return;
    dispatch(locationDetailRequest(deptId));
  }, [dispatch, deptId]);

  useEffect(() => {
    if (!locationDetail || loadedRef.current) return;

    setForm({
      buildingName: locationDetail.buildingName || "",
      floorNo: locationDetail.floorNo || "",
      roomNo: locationDetail.roomNo || "",
      dayPhone: locationDetail.dayPhone || "",
      nightPhone: locationDetail.nightPhone || "",
      mainPhone: locationDetail.mainPhone || "",
      locationDesc: locationDetail.locationDesc || "",
    });

    loadedRef.current = true;
  }, [locationDetail]);

  useEffect(() => {
    if (updateSuccess) {
      alert("부서 위치 수정이 완료되었습니다.");
      dispatch(resetLocationState());
      router.push("/staff/location/list");
    }
  }, [updateSuccess, dispatch, router]);

  const handleChange =
    (field: keyof LocationUpdateRequest) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    dispatch(
      locationUpdateRequest({
        deptId,
        locationReq: {
          buildingName: form.buildingName.trim(),
          floorNo: form.floorNo.trim(),
          roomNo: form.roomNo.trim(),
          dayPhone: form.dayPhone.trim(),
          nightPhone: form.nightPhone.trim(),
          mainPhone: form.mainPhone.trim(),
          locationDesc: form.locationDesc.trim(),
        },
      })
    );
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        부서 위치 수정
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        부서별 위치와 안내 연락처 정보를 수정합니다.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField label="부서 ID" value={deptId} fullWidth disabled />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="건물명"
              value={form.buildingName}
              onChange={handleChange("buildingName")}
              fullWidth
              required
            />
            <TextField
              label="층"
              value={form.floorNo}
              onChange={handleChange("floorNo")}
              fullWidth
              required
            />
          </Stack>

          <TextField
            label="호실"
            value={form.roomNo}
            onChange={handleChange("roomNo")}
            fullWidth
            required
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="주간 대표번호"
              value={form.dayPhone}
              onChange={handleChange("dayPhone")}
              fullWidth
            />
            <TextField
              label="야간 전환번호"
              value={form.nightPhone}
              onChange={handleChange("nightPhone")}
              fullWidth
            />
          </Stack>

          <TextField
            label="대표 안내번호"
            value={form.mainPhone}
            onChange={handleChange("mainPhone")}
            fullWidth
          />

          <TextField
            label="위치 설명"
            value={form.locationDesc}
            onChange={handleChange("locationDesc")}
            fullWidth
            multiline
            minRows={3}
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push("/staff/location/list")}>
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

export default LocationUpdate;
