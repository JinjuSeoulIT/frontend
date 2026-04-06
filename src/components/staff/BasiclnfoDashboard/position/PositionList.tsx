"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { positionListRequest } from "@/features/staff/position/positionSlice";



//직책
  const PositionList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { positionList, loading, error } = useSelector((state: RootState) => state.position);

  useEffect(() => {
    dispatch(positionListRequest());
  }, [dispatch]);

  return (
    <Paper sx={{ p: 4, maxWidth: 1300, mx: "auto", mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            직책 목록
          </Typography>
          <Typography variant="body2" color="text.secondary">
            등록된 직책 마스터 정보를 조회합니다.
          </Typography>
        </Box>


         <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }} >
          
        <Button variant="contained" onClick={() => router.push("/staff/position/create")}>
          직책 등록
        </Button>

         <Button variant="contained" onClick={() => router.push("/staff/Basiclnfo/list")}sx={{ bgcolor: "#da342f" }}>직원 목록</Button>
          </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Table>
        <TableHead>
          <TableRow>
         <TableCell>직책 ID</TableCell>
         <TableCell>직책 유형</TableCell>
         <TableCell>직책 코드</TableCell>
         <TableCell>직책 레벨</TableCell>
         <TableCell>직책명</TableCell>
         <TableCell>관리자 여부</TableCell>
         <TableCell>비고</TableCell>
         <TableCell align="center">관리</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
          {!loading && positionList.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                조회된 직책이 없습니다.
              </TableCell>
            </TableRow>
          )}

          {positionList.map((item: any) => (
            <TableRow key={item.positionId} hover>
              <TableCell>{item.positionId}</TableCell>
              <TableCell>{item.positionType || "-"}</TableCell>
              <TableCell>{item.positionCode || "-"}</TableCell>
              <TableCell>{item.positionLevel || "-"}</TableCell>
              <TableCell>{item.positionName || "-"}</TableCell>
              <TableCell>{item.managerYn || "-"}</TableCell>
              <TableCell>{item.rmk || "-"}</TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push(`/staff/position/${item.positionId}/detail`)}
                  >
                    상세
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push(`/staff/position/${item.positionId}/edit`)}
                  >
                    수정
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => router.push(`/staff/position/${item.positionId}/delete`)}
                  >
                    삭제
                  </Button>
                  </Stack>
                  </TableCell>
                  </TableRow>
                  ))}
                  </TableBody>
                  </Table>
                  </Paper>
  );
};

export default PositionList;
