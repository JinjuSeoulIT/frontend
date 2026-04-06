"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  positionDeleteRequest,
  positionDetailRequest,
  resetPositionState,
} from "@/features/staff/position/positionSlice";
import { PositionIdParam } from "@/features/staff/position/positiontypes";



//직책
  const PositionDelete = ({ positionId }: PositionIdParam) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { positionDetail, loading, error, deleteSuccess } = useSelector(
    (state: RootState) =>
      (state as any).position ?? {
        positionDetail: null,
        loading: false,
        error: null,
        deleteSuccess: false,
      }
  );

  useEffect(() => {
    if (positionId) {
      dispatch(positionDetailRequest(positionId));
    }
  }, [dispatch, positionId]);

  useEffect(() => {
    if (deleteSuccess) {
      alert("직책 삭제가 완료되었습니다.");
      dispatch(resetPositionState());
      router.push("/staff/position/list");
    }
  }, [deleteSuccess, dispatch, router]);

  const handleDelete = () => {
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;
    dispatch(positionDeleteRequest(positionId));
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom color="error">
        직책 삭제
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        삭제 전 직책 정보를 다시 확인해주세요.
      </Typography>

      <Stack spacing={2}>
        <Typography>
          <strong>직책 ID:</strong> {positionDetail?.positionId || positionId}
        </Typography>
        <Typography>
          <strong>직책명:</strong> {positionDetail?.positionName || "-"}
        </Typography>
        <Typography>
          <strong>직책 유형:</strong> {positionDetail?.positionType || "-"}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2 }}>
          <Button variant="outlined" onClick={() => router.push("/staff/position/list")}>
            취소
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={loading}>
            {loading ? "삭제 중..." : "삭제"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PositionDelete;
