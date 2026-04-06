"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
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
import {
  locationDetailRequest,
  resetLocationState,
} from "@/features/staff/location/locationSlice";
import { LocationIdParam } from "@/features/staff/location/locationtypes";

const LocationDetail = ({ deptId }: LocationIdParam) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { locationDetail, loading, error } = useSelector((state: RootState) => state.location);

  useEffect(() => {
    if (deptId) {
      dispatch(locationDetailRequest(deptId));
    }

    return () => {
      dispatch(resetLocationState());
    };
  }, [dispatch, deptId]);

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        부서 위치 상세
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        부서별 위치와 대표 연락처 정보를 확인합니다.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && locationDetail && (
        <Stack spacing={2}>
          <Box><Typography variant="subtitle2" color="text.secondary">부서 ID</Typography><Typography>{locationDetail.deptId}</Typography></Box>
          <Divider />
          <Box><Typography variant="subtitle2" color="text.secondary">건물명</Typography><Typography>{locationDetail.buildingName}</Typography></Box>
          <Divider />
          <Box><Typography variant="subtitle2" color="text.secondary">층</Typography><Typography>{locationDetail.floorNo}</Typography></Box>
          <Divider />
          <Box><Typography variant="subtitle2" color="text.secondary">호실</Typography><Typography>{locationDetail.roomNo}</Typography></Box>
          <Divider />
          <Box><Typography variant="subtitle2" color="text.secondary">주간 대표번호</Typography><Typography>{locationDetail.dayPhone || "-"}</Typography></Box>
          <Divider />
          <Box><Typography variant="subtitle2" color="text.secondary">야간 전환번호</Typography><Typography>{locationDetail.nightPhone || "-"}</Typography></Box>
          <Divider />
          <Box><Typography variant="subtitle2" color="text.secondary">대표 안내번호</Typography><Typography>{locationDetail.mainPhone || "-"}</Typography></Box>
          <Divider />
          <Box><Typography variant="subtitle2" color="text.secondary">위치 설명</Typography><Typography>{locationDetail.locationDesc || "-"}</Typography></Box>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button variant="outlined" onClick={() => router.push("/staff/location/list")}>
              목록
            </Button>
            <Button variant="contained" onClick={() => router.push(`/staff/location/${deptId}/edit`)}>
              수정
            </Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};

export default LocationDetail;
