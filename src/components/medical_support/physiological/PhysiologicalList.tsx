"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "@/components/layout/MainLayout";
import ExamDetailDialog, {
  type ExamDetailSection,
} from "@/components/medical_support/common/ExamDetailDialog";
import {
  formatActiveStatus,
  formatDateTime,
  formatProgressStatus,
  getActiveStatusColor,
  getActiveStatusSx,
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
import { PhysiologicalActions } from "@/features/medical_support/physiological/physiologicalSlice";
import type { PhysiologicalExam } from "@/features/medical_support/physiological/physiologicalType";
import type { RootState, AppDispatch } from "@/store/store";

export default function PhysiologicalList() {
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedItem, setSelectedItem] = React.useState<PhysiologicalExam | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.physiologicals
  );

  React.useEffect(() => {
    dispatch(PhysiologicalActions.fetchPhysiologicalsRequest());
  }, [dispatch]);

  const waitingCount = React.useMemo(
    () =>
      items.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "WAITING"
      ).length,
    [items]
  );

  const inProgressCount = React.useMemo(
    () =>
      items.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "IN_PROGRESS"
      ).length,
    [items]
  );

  const completedCount = React.useMemo(
    () =>
      items.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "COMPLETED"
      ).length,
    [items]
  );

  const maxPage = Math.max(0, Math.ceil(items.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedItems = React.useMemo(
    () =>
      items.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, items, rowsPerPage]
  );

  const detailSections = React.useMemo<ExamDetailSection[]>(() => {
    if (!selectedItem) return [];

    return [
      {
        title: "기본 정보",
        fields: [
          {
            label: "생리기능검사아이디",
            value: safeValue(selectedItem.physiologicalExamId),
          },
          {
            label: "검사수행아이디",
            value: safeValue(selectedItem.testExecutionId),
          },
          {
            label: "담당자아이디",
            value: safeValue(selectedItem.performerId),
          },
          {
            label: "진행상태",
            value: (
              <Chip
                label={formatProgressStatus(selectedItem.progressStatus)}
                color={getProgressStatusColor(selectedItem.progressStatus)}
                size="small"
              />
            ),
          },
          {
            label: "활성 여부",
            value: (
              <Chip
                label={formatActiveStatus(selectedItem.status)}
                color={getActiveStatusColor(selectedItem.status)}
                size="small"
                sx={getActiveStatusSx(selectedItem.status)}
              />
            ),
          },
        ],
      },
      {
        title: "검사 상세 정보",
        fields: [
          {
            label: "검사장비아이디",
            value: safeValue(selectedItem.examEquipmentId),
          },
          { label: "원본데이터", value: safeValue(selectedItem.rawData) },
          {
            label: "리포트문서아이디",
            value: safeValue(selectedItem.reportDocId),
          },
        ],
      },
      {
        title: "이력 정보",
        fields: [
          { label: "생성일시", value: formatDateTime(selectedItem.createdAt) },
          { label: "수정일시", value: formatDateTime(selectedItem.updatedAt) },
        ],
      },
    ];
  }, [selectedItem]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleOpenDetail = (item: PhysiologicalExam) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailDialogOpen(false);
    setSelectedItem(null);
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
                  생리 기능 검사 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  생리 기능 검사 목록을 조회하고 선택한 항목의 상세 정보를 확인하는 화면입니다.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
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
          <Chip label={`전체 ${items.length}`} color="primary" />
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
          {loading && <Chip label="불러오는 중" variant="outlined" />}
          {error && <Chip label={`오류: ${error}`} color="error" />}
        </Stack>

        <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
          <CardContent sx={{ p: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ScienceOutlinedIcon sx={{ color: "var(--brand)" }} />
                <Typography fontWeight={800}>생리 기능 검사 목록</Typography>
              </Stack>
              <Chip label={`표시 ${items.length}`} size="small" />
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
                      minWidth: 760,
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
                        <TableCell align="center">생리기능검사아이디</TableCell>
                        <TableCell align="center">검사장비아이디</TableCell>
                        <TableCell align="center">리포트문서아이디</TableCell>
                        <TableCell align="center">담당자아이디</TableCell>
                        <TableCell align="center">진행상태</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                            생리 기능 검사 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}

                      {paginatedItems.map((item, index) => (
                        <TableRow
                          key={String(item.physiologicalExamId)}
                          hover
                          onClick={() => handleOpenDetail(item)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#f9fbff" },
                          }}
                        >
                          <TableCell align="center">
                            {currentPage * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.physiologicalExamId)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.examEquipmentId)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.reportDocId)}
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
                  count={items.length}
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

        <ExamDetailDialog
          open={isDetailDialogOpen}
          title="생리 기능 검사 상세"
          sections={detailSections}
          editHref={`/medical_support/physiological/edit/${selectedItem?.physiologicalExamId ?? ""}`}
          onClose={handleCloseDetail}
        />
      </Stack>
    </MainLayout>
  );
}
