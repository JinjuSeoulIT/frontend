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
  positionDetailRequest,
  resetPositionState,
} from "@/features/staff/position/positionSlice";
import { PositionIdParam } from "@/features/staff/position/positiontypes";



//직책
  const PositionDetail = ({ positionId }: PositionIdParam) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { positionDetail, loading, error } = useSelector(
    (state: RootState) =>
      (state as any).position ?? { positionDetail: null, loading: false, error: null }
  );

  useEffect(() => {
    if (positionId) dispatch(positionDetailRequest(positionId));
    return () => {
      dispatch(resetPositionState());
    };
  }, [dispatch, positionId]);

  return (
      <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        직책 상세
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        직책 마스터 정보를 확인합니다.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && positionDetail && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">직책 ID</Typography>
            <Typography>{positionDetail.positionId}</Typography>
          </Box>
          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">직책 유형</Typography>
            <Typography>{positionDetail.positionType || "-"}</Typography>
          </Box>
          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">직책 코드</Typography>
            <Typography>{positionDetail.positionCode || "-"}</Typography>
          </Box>
          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">직책 레벨</Typography>
            <Typography>{positionDetail.positionLevel || "-"}</Typography>
          </Box>
          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">직책명</Typography>
            <Typography>{positionDetail.positionName || "-"}</Typography>
          </Box>
          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">관리자 여부</Typography>
            <Typography>{positionDetail.managerYn || "-"}</Typography>
          </Box>
          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">비고</Typography>
            <Typography>{positionDetail.rmk || "-"}</Typography>
          </Box>
          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">생성일</Typography>
            <Typography>{positionDetail.createdAt || "-"}</Typography>
          </Box>
          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">수정일</Typography>
            <Typography>{positionDetail.updatedAt || "-"}</Typography>
          </Box>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button variant="outlined" onClick={() => router.push("/staff/position/list")}>
              목록
            </Button>
            <Button variant="contained" onClick={() => router.push(`/staff/position/${positionId}/edit`)}>
              수정
            </Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};

export default PositionDetail;
