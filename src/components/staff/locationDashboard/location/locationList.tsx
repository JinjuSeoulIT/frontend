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
import { locationListRequest } from "@/features/staff/location/locationSlice";

  const LocationList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { locationList, loading, error } = useSelector((state: RootState) => state.location);

  useEffect(() => {
    dispatch(locationListRequest());
  }, [dispatch]);

  return (
    <Paper sx={{ p: 4, maxWidth: 1300, mx: "auto", mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Box>
      <Typography variant="h5" fontWeight="bold">
            위치 목록
      </Typography>
       <Typography variant="body2" color="text.secondary">
            등록된 부서 위치와 안내 정보를 조회합니다.
        </Typography>
        </Box>


         <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }} >
        <Button variant="contained" onClick={() => router.push("/staff/location/create")}>
          위치 등록
        </Button>
            <Button variant="contained" onClick={() => router.push("/staff/Basiclnfo/list")}sx={{ bgcolor: "#da342f" }}>직원 목록</Button>
      </Stack>

          </Stack>




      <Table>
        <TableHead>
          <TableRow>
            <TableCell>부서 ID</TableCell>
            <TableCell>건물명</TableCell>
            <TableCell>층</TableCell>
            <TableCell>호실</TableCell>
            <TableCell>주간 번호</TableCell>
            <TableCell>야간 번호</TableCell>
            <TableCell>대표 번호</TableCell>
            <TableCell align="center">관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && locationList.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                조회된 부서 위치가 없습니다.
              </TableCell>
            </TableRow>
          )}

          {locationList.map((item) => (
            <TableRow key={item.deptId} hover>
              <TableCell>{item.deptId}</TableCell>
              <TableCell>{item.buildingName}</TableCell>
              <TableCell>{item.floorNo}</TableCell>
              <TableCell>{item.roomNo}</TableCell>
              <TableCell>{item.dayPhone || "-"}</TableCell>
              <TableCell>{item.nightPhone || "-"}</TableCell>
              <TableCell>{item.mainPhone || "-"}</TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push(`/staff/location/${item.deptId}/detail`)}
                  >
                    상세
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push(`/staff/location/${item.deptId}/edit`)}
                  >
                    수정
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => router.push(`/staff/location/${item.deptId}/delete`)}
                  >
                    삭제
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    </Paper>
  );
};

export default LocationList;
