"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  formatProgressStatus,
  getProgressStatusColor,
  normalizeProgressStatus,
  safeValue,
} from "@/components/medical_support/common/ExamDisplay";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { EndoscopyActions } from "@/features/medical_support/endoscopy/endoscopySlice";
import type { RootState, AppDispatch } from "@/store/store";

export default function EndoscopyList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.endoscopies
  );

  React.useEffect(() => {
    dispatch(EndoscopyActions.fetchEndoscopiesRequest());
  }, [dispatch]);

  const visibleItems = React.useMemo(
    () =>
      items.filter(
        (item) => normalizeProgressStatus(item.progressStatus) !== "CANCELLED"
      ),
    [items]
  );

  const cancelledCount = React.useMemo(
    () =>
      items.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "CANCELLED"
      ).length,
    [items]
  );

  const waitingCount = React.useMemo(
    () =>
      visibleItems.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "WAITING"
      ).length,
    [visibleItems]
  );

  const inProgressCount = React.useMemo(
    () =>
      visibleItems.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "IN_PROGRESS"
      ).length,
    [visibleItems]
  );

  const completedCount = React.useMemo(
    () =>
      visibleItems.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "COMPLETED"
      ).length,
    [visibleItems]
  );

  const maxPage = Math.max(0, Math.ceil(visibleItems.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedItems = React.useMemo(
    () =>
      visibleItems.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, visibleItems, rowsPerPage]
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
    <MainLayout showSidebar={false}>
      <Stack spacing={2}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(11, 91, 143, 0.2) 0%, rgba(11, 91, 143, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="center"
            >
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  내시경 검사 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  내시경 검사 목록을 조회하고 항목을 선택하면 수정 화면으로 바로 이동합니다.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => dispatch(EndoscopyActions.fetchEndoscopiesRequest())}
                  disabled={loading}
                >
                  새로고침
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip label={`전체 ${visibleItems.length}`} color="primary" />
          <Chip label={`대기 ${waitingCount}`} color="warning" variant="outlined" />
          <Chip
            label={`진행 중 ${inProgressCount}`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`완료 ${completedCount}`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`취소 ${cancelledCount}`}
            color="error"
            variant="outlined"
          />
          {loading && <Chip label="불러오는 중" variant="outlined" />}
          {error && <Chip label={`오류: ${error}`} color="error" />}
        </Stack>

        <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ScienceOutlinedIcon sx={{ color: "var(--brand)" }} />
                <Typography fontWeight={800}>내시경 검사 목록</Typography>
              </Stack>
              <Chip label={`표시 ${visibleItems.length}`} size="small" />
            </Stack>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  border: "1px solid var(--line)",
                  overflow: "hidden",
                }}
              >
                <TableContainer>
                  <Table
                    size="small"
                    stickyHeader
                    sx={{
                      minWidth: 980,
                      "& .MuiTableCell-root": {
                        px: 1,
                        py: 1,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">번호</TableCell>
                        <TableCell align="center">내시경검사 ID</TableCell>
                        <TableCell align="center">환자명</TableCell>
                        <TableCell align="center">진료과</TableCell>
                        <TableCell align="center">시술실</TableCell>
                        <TableCell align="center">장비</TableCell>
                        <TableCell align="center">검사수행 ID</TableCell>
                        <TableCell align="center">담당자 ID</TableCell>
                        <TableCell align="center">진행상태</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                            표시할 내시경 검사 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}

                      {paginatedItems.map((item, index) => (
                        <TableRow
                          key={String(item.endoscopyExamId)}
                          hover
                          onClick={() =>
                            router.push(
                              `/medical_support/endoscopy/edit/${item.endoscopyExamId}`
                            )
                          }
                          sx={{
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#f9fbff" },
                          }}
                        >
                          <TableCell align="center">
                            {currentPage * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.endoscopyExamId)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.patientName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.departmentName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.procedureRoom)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.equipment)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.testExecutionId)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.performerId)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={formatProgressStatus(item.progressStatus)}
                              color={getProgressStatusColor(item.progressStatus)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={visibleItems.length}
                  page={currentPage}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 20, 50]}
                  labelRowsPerPage="페이지당 행 수"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} / 총 ${count}`
                  }
                />
              </Paper>
            )}
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}