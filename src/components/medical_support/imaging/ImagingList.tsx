"use client";

import * as React from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "@/components/layout/MainLayout";
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
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { ImagingActions } from "@/features/medical_support/imaging/imagingSlice";
import type { ImagingExam } from "@/features/medical_support/imaging/imagingType";
import type { RootState, AppDispatch } from "@/store/store";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

const formatExamStatus = (value?: string | null) => {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "Y") return "완료";
  if (normalized === "N") return "미완료";

  return safeValue(value);
};

const getExamStatusColor = (
  value?: string | null
): "default" | "success" => {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "Y") return "success";
  return "default";
};

const getExamStatusSx = (value?: string | null) => {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "Y") {
    return {
      fontWeight: 600,
    };
  }

  return {
    backgroundColor: "#eeeeee",
    color: "#757575",
    fontWeight: 500,
  };
};

export default function ImagingList() {
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.imagings
  );

  React.useEffect(() => {
    dispatch(ImagingActions.fetchImagingsRequest());
  }, [dispatch]);

  const completedCount = React.useMemo(
    () =>
      items.filter((item) => item.examStatusYn?.trim().toUpperCase() === "Y")
        .length,
    [items]
  );

  const pendingCount = React.useMemo(
    () =>
      items.filter((item) => item.examStatusYn?.trim().toUpperCase() !== "Y")
        .length,
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

  const selected = React.useMemo(
    () =>
      items.find((item) => String(item.imagingExamId) === String(selectedId)) ??
      null,
    [items, selectedId]
  );

  const activeSelected = selected ?? paginatedItems[0] ?? items[0] ?? null;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleSelect = (item: ImagingExam) => {
    setSelectedId(String(item.imagingExamId));
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
                  영상 검사 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  영상 검사 목록을 조회하고 선택한 항목의 상세 정보를 확인하는 화면입니다.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => dispatch(ImagingActions.fetchImagingsRequest())}
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
          <Chip
            label={`완료 ${completedCount}`}
            color="success"
            variant="outlined"
          />
          <Chip label={`미완료 ${pendingCount}`} variant="outlined" />
          {loading && <Chip label="불러오는 중" variant="outlined" />}
          {error && <Chip label={`오류: ${error}`} color="error" />}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1.2fr" },
            alignItems: "stretch",
          }}
        >
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
                  <Typography fontWeight={800}>영상 검사 목록</Typography>
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
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">번호</TableCell>
                          <TableCell align="center">영상검사아이디</TableCell>
                          <TableCell align="center">검사수행아이디</TableCell>
                          <TableCell align="center">영상검사유형</TableCell>
                          <TableCell align="center">검사상태여부</TableCell>
                          <TableCell align="center">검사일시</TableCell>
                          <TableCell align="center">생성일시</TableCell>
                          <TableCell align="center">수정일시</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                              영상 검사 데이터가 없습니다.
                            </TableCell>
                          </TableRow>
                        )}

                        {paginatedItems.map((item, index) => (
                          <TableRow
                            key={String(item.imagingExamId)}
                            hover
                            onClick={() => handleSelect(item)}
                            sx={{
                              cursor: "pointer",
                              "& td": { py: 1.25, whiteSpace: "nowrap" },
                              "&:hover": { backgroundColor: "#f9fbff" },
                              backgroundColor:
                                String(activeSelected?.imagingExamId) ===
                                String(item.imagingExamId)
                                  ? "rgba(11, 91, 143, 0.08)"
                                  : "transparent",
                            }}
                          >
                            <TableCell align="center">
                              {currentPage * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.imagingExamId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.testExecutionId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.imagingType)}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={formatExamStatus(item.examStatusYn)}
                                color={getExamStatusColor(item.examStatusYn)}
                                size="small"
                                sx={getExamStatusSx(item.examStatusYn)}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {formatDateTime(item.examAt)}
                            </TableCell>
                            <TableCell align="center">
                              {formatDateTime(item.createdAt)}
                            </TableCell>
                            <TableCell align="center">
                              {formatDateTime(item.updatedAt)}
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

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScienceOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                    <Typography fontWeight={800}>선택 영상 검사</Typography>
                  </Stack>

                  {activeSelected && (
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={formatExamStatus(activeSelected.examStatusYn)}
                        size="small"
                        color={getExamStatusColor(activeSelected.examStatusYn)}
                        sx={getExamStatusSx(activeSelected.examStatusYn)}
                      />
                      <Button
                        component={Link}
                        href={`/medical_support/imaging/edit/${activeSelected.imagingExamId}`}
                        variant="outlined"
                        size="small"
                        startIcon={<EditOutlinedIcon />}
                      >
                        수정
                      </Button>
                    </Stack>
                  )}
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.7)",
                  }}
                >
                  <Row
                    label="영상검사아이디"
                    value={safeValue(activeSelected?.imagingExamId)}
                  />
                  <Row
                    label="검사수행아이디"
                    value={safeValue(activeSelected?.testExecutionId)}
                  />
                  <Row
                    label="영상검사유형"
                    value={safeValue(activeSelected?.imagingType)}
                  />
                  <Row
                    label="검사상태여부"
                    value={formatExamStatus(activeSelected?.examStatusYn)}
                  />
                  <Row
                    label="검사일시"
                    value={formatDateTime(activeSelected?.examAt)}
                  />
                  <Row
                    label="생성일시"
                    value={formatDateTime(activeSelected?.createdAt)}
                  />
                  <Row
                    label="수정일시"
                    value={formatDateTime(activeSelected?.updatedAt)}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FactCheckOutlinedIcon sx={{ color: "var(--accent)" }} />
                  <Typography fontWeight={800}>상태 요약</Typography>
                </Stack>
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  <SummaryRow label="전체 항목" value={items.length} />
                  <SummaryRow label="완료 항목" value={completedCount} />
                  <SummaryRow label="미완료 항목" value={pendingCount} />
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HelpOutlineOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>점검 가이드</Typography>
                </Stack>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {[
                    "좌측 목록: 영상 검사 항목 조회",
                    "행 클릭: 우측 상세 정보 갱신",
                    "수정 버튼: 영상 검사 수정 화면으로 이동",
                  ].map((text) => (
                    <Box
                      key={text}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid var(--line)",
                        bgcolor: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </MainLayout>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: "1px solid var(--line)",
        display: "flex",
        justifyContent: "space-between",
        bgcolor: "rgba(255,255,255,0.7)",
      }}
    >
      <Typography>{label}</Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Box>
  );
}