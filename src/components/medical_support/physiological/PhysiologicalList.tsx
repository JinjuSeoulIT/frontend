"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  formatProgressStatus,
  getProgressStatusColor,
  normalizeActiveStatus,
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
  FormControlLabel,
  Paper,
  Stack,
  Switch,
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
import { PhysiologicalActions } from "@/features/medical_support/physiological/physiologicalSlice";
import type { RootState, AppDispatch } from "@/store/store";

export default function PhysiologicalList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [includeInactive, setIncludeInactive] = React.useState(false);

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.physiologicals
  );

  React.useEffect(() => {
    dispatch(PhysiologicalActions.fetchPhysiologicalsRequest());
  }, [dispatch]);

  const nonCancelledItems = React.useMemo(
    () =>
      items.filter(
        (item) => normalizeProgressStatus(item.progressStatus) !== "CANCELLED"
      ),
    [items]
  );

  const visibleItems = React.useMemo(
    () =>
      includeInactive
        ? nonCancelledItems
        : nonCancelledItems.filter(
            (item) => normalizeActiveStatus(item.status) !== "INACTIVE"
          ),
    [includeInactive, nonCancelledItems]
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

  const inactiveCount = React.useMemo(
    () =>
      visibleItems.filter(
        (item) => normalizeActiveStatus(item.status) === "INACTIVE"
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
                  생리기능 검사 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  생리기능 검사 목록을 조회하고 항목을 선택하면 수정 화면으로 바로 이동합니다.
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={includeInactive}
                      onChange={(event) => {
                        setIncludeInactive(event.target.checked);
                        setPage(0);
                      }}
                    />
                  }
                  label="비활성 포함"
                  sx={{ mr: 0.5 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() =>
                    dispatch(PhysiologicalActions.fetchPhysiologicalsRequest())
                  }
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
          {includeInactive && inactiveCount > 0 ? (
            <Chip label={`비활성 ${inactiveCount}`} variant="outlined" />
          ) : null}
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
                <Typography fontWeight={800}>생리기능 검사 목록</Typography>
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
                      minWidth: 1100,
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
                        <TableCell align="center">생리기능검사 ID</TableCell>
                        <TableCell align="center">환자명</TableCell>
                        <TableCell align="center">진료과</TableCell>
                        <TableCell align="center">검사장비 ID</TableCell>
                        <TableCell align="center">리포트문서 ID</TableCell>
                        <TableCell align="center">검사명</TableCell>
                        <TableCell align="center">검사수행 ID</TableCell>
                        <TableCell align="center">담당자 ID</TableCell>
                        <TableCell align="center">진행상태</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                            표시할 생리기능 검사 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}

                      {paginatedItems.map((item, index) => {
                        const inactive =
                          normalizeActiveStatus(item.status) === "INACTIVE";

                        return (
                          <TableRow
                            key={String(item.physiologicalExamId)}
                            hover
                            onClick={() =>
                              router.push(
                                `/medical_support/physiological/edit/${item.physiologicalExamId}`
                              )
                            }
                            sx={{
                              cursor: "pointer",
                              backgroundColor: inactive ? "#fcfcfc" : undefined,
                              "&:hover": {
                                backgroundColor: inactive ? "#f4f6f8" : "#f9fbff",
                              },
                              "& td": {
                                color: inactive ? "text.secondary" : undefined,
                              },
                            }}
                          >
                            <TableCell align="center">
                              {currentPage * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.physiologicalExamId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.patientName)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.departmentName)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.examEquipmentId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.reportDocId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.detailCode)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.testExecutionId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.performerId)}
                            </TableCell>
                            <TableCell align="center">
                              <Stack
                                direction="row"
                                spacing={0.75}
                                justifyContent="center"
                                useFlexGap
                                flexWrap="wrap"
                              >
                                <Chip
                                  label={formatProgressStatus(item.progressStatus)}
                                  color={getProgressStatusColor(item.progressStatus)}
                                  size="small"
                                />
                                {inactive ? (
                                  <Chip
                                    label="비활성"
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderColor: "grey.400",
                                      color: "text.secondary",
                                    }}
                                  />
                                ) : null}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
