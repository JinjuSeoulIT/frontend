"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  ReceptionListRequest,
  resetReceptionSuccessEnd,
  searchReceptionListRequest,
} from "@/features/staff/reception/receptionSlice";
import type {
  ReceptionResponse,
  ReceptionSearchType,
  SearchReceptionPayload,
} from "@/features/staff/reception/receptionTypes";
import StatusBadge from "../../BasiclnfoDashboard/BasiclnfoStatus";
import ReceptionFont from "../ReceptionFont";

const ReceptionList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { receptionList, receptionSearch, loading, error } = useSelector((state: RootState) => state.reception);

  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<ReceptionSearchType>("all");

  useEffect(() => {
    dispatch(ReceptionListRequest());
  }, [dispatch]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!search.trim()) {
      dispatch(ReceptionListRequest());
      dispatch(resetReceptionSuccessEnd());
      return;
    }
    const receptionReq: SearchReceptionPayload = {
      search: search.trim(),
      searchType,
    };
    dispatch(searchReceptionListRequest(receptionReq));
  };

  const receptions = search.trim() ? receptionSearch : receptionList;

  const goDetail = (reception: ReceptionResponse) => {
    router.push(`/staff/reception/${reception.staffId}/detail`);
  };

  const goEdit = (staffId: number) => {
    router.push(`/staff/reception/${staffId}/edit`);
  };

  const goDelete = (staffId: number) => {
    router.push(`/staff/reception/${staffId}/delete`);
  };

  return (
    <Box sx={{ maxWidth: 1480, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>원무 직원 목록</Typography>
        <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => router.push("/staff")}>직원 홈</Button>
        <Button variant="contained" onClick={() => router.push("/staff/Basiclnfo/list")}>직원 목록</Button>
        </Stack>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              label="검색조건"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value as ReceptionSearchType)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="name">이름</MenuItem>
              <MenuItem value="staffId">직원번호</MenuItem>
              <MenuItem value="dept">부서</MenuItem>
              <MenuItem value="jobTypeCd">업무구분</MenuItem>
              <MenuItem value="deskNo">창구번호</MenuItem>
              <MenuItem value="shiftType">근무형태</MenuItem>
              <MenuItem value="receptionType">직군타입</MenuItem>
              <MenuItem value="extNo">사내번호</MenuItem>
            </TextField>

            <TextField
              label="검색어"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />

            <Button type="submit" variant="contained">검색</Button>
          </Stack>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">직원번호</TableCell>
              <TableCell align="center">이름</TableCell>
              <TableCell align="center">부서</TableCell>
              <TableCell align="center">업무구분</TableCell>
              <TableCell align="center">창구번호</TableCell>
              <TableCell align="center">근무형태</TableCell>
              <TableCell align="center">사내번호</TableCell>
              <TableCell align="center">직군</TableCell>
              <TableCell align="center">상태</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receptions.map((reception) => (
              <TableRow key={reception.staffId} hover>
                <TableCell align="center">{reception.staffId}</TableCell>
                <TableCell align="center">{reception.name ?? "-"}</TableCell>
                <TableCell align="center">{reception.deptId ?? "-"}</TableCell>
                <TableCell align="center">{reception.jobTypeCd ?? "-"}</TableCell>
                <TableCell align="center">{reception.deskNo ?? "-"}</TableCell>
                <TableCell align="center">{reception.shiftType ?? "-"}</TableCell>
                <TableCell align="center">{reception.extNo ?? "-"}</TableCell>
                <TableCell align="center"><ReceptionFont receptionType={reception.receptionType} /></TableCell>
                <TableCell align="center"><StatusBadge status={reception.status} /></TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => goDetail(reception)}>상세</Button>
                  <Button size="small" onClick={() => goEdit(reception.staffId)}>수정</Button>
                  <Button size="small" color="error" onClick={() => goDelete(reception.staffId)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
            {!receptions.length && !loading && (
              <TableRow>
                <TableCell colSpan={9} align="center">조회된 원무 직원이 없습니다.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
};

export default ReceptionList;
