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
import { PhysiologicalActions } from "@/features/medical_support/physiological/physiologicalSlice";
import type { PhysiologicalExam } from "@/features/medical_support/physiological/physiologicalType";
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

const formatStatus = (value?: string | null) => {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "ACTIVE") return "활성화";
  if (normalized === "INACTIVE") return "비활성화";

  return safeValue(value);
};

const getStatusColor = (
  value?: string | null
): "default" | "success" => {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "ACTIVE") return "success";
  return "default";
};

const getStatusSx = (value?: string | null) => {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "ACTIVE") {
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

export default function PhysiologicalList() {
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.physiologicals
  );

  React.useEffect(() => {
    dispatch(PhysiologicalActions.fetchPhysiologicalsRequest());
  }, [dispatch]);

  const activeCount = React.useMemo(
    () =>
      items.filter((item) => item.status?.trim().toUpperCase() === "ACTIVE")
        .length,
    [items]
  );

  const inactiveCount = React.useMemo(
    () =>
      items.filter((item) => item.status?.trim().toUpperCase() === "INACTIVE")
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
      items.find(
        (item) =>
          String(item.physiologicalExamId) === String(selectedId)
      ) ?? null,
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

  const handleSelect = (item: PhysiologicalExam) => {
    setSelectedId(String(item.physiologicalExamId));
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
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
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
                  onClick={() => dispatch(PhysiologicalActions.fetchPhysiologicalsRequest())}
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
          <Chip label={`활성화 ${activeCount}`} color="success" variant="outlined" />
          <Chip label={`비활성화 ${inactiveCount}`} variant="outlined" />
          {loading && <Chip label="불러오는 중" variant="outlined" />}
          {error && <Chip label={`오류: ${error}`} color="error" />}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1fr" },
            alignItems: "stretch",
          }}
        >
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
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
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table
                      size="small"
                      stickyHeader
                      sx={{
                        minWidth: 900,
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
                          <TableCell align="center">검사수행아이디</TableCell>
                          <TableCell align="center">검사장비아이디</TableCell>
                          <TableCell align="center">원본데이터</TableCell>
                          <TableCell align="center">리포트문서아이디</TableCell>
                          <TableCell align="center">상태</TableCell>
                          <TableCell align="center">생성일시</TableCell>
                          <TableCell align="center">수정일시</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                              생리 기능 검사 데이터가 없습니다.
                            </TableCell>
                          </TableRow>
                        )}

                        {paginatedItems.map((item, index) => (
                          <TableRow
                            key={String(item.physiologicalExamId)}
                            hover
                            onClick={() => handleSelect(item)}
                            sx={{
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "#f9fbff" },
                              backgroundColor:
                                String(activeSelected?.physiologicalExamId) ===
                                String(item.physiologicalExamId)
                                  ? "rgba(11, 91, 143, 0.08)"
                                  : "transparent",
                            }}
                          >
                            <TableCell align="center">
                              {currentPage * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell align="center">{safeValue(item.physiologicalExamId)}</TableCell>
                            <TableCell align="center">{safeValue(item.testExecutionId)}</TableCell>
                            <TableCell align="center">{safeValue(item.examEquipmentId)}</TableCell>
                            <TableCell align="center">{safeValue(item.rawData)}</TableCell>
                            <TableCell align="center">{safeValue(item.reportDocId)}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={formatStatus(item.status)}
                                color={getStatusColor(item.status)}
                                size="small"
                                sx={getStatusSx(item.status)}
                              />
                            </TableCell>
                            <TableCell align="center">{formatDateTime(item.createdAt)}</TableCell>
                            <TableCell align="center">{formatDateTime(item.updatedAt)}</TableCell>
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
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScienceOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                    <Typography fontWeight={800}>선택 생리 기능 검사</Typography>
                  </Stack>

                  {activeSelected && (
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={formatStatus(activeSelected.status)}
                        size="small"
                        color={getStatusColor(activeSelected.status)}
                        sx={getStatusSx(activeSelected.status)}
                      />
                      <Button
                        component={Link}
                        href={`/medical_support/physiological/edit/${activeSelected.physiologicalExamId}`}
                        variant="outlined"
                        size="small"
                        startIcon={<EditOutlinedIcon />}
                      >
                        수정
                      </Button>
                    </Stack>
                  )}
                </Stack>

                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.7)" }}>
                  <Row label="생리기능검사아이디" value={safeValue(activeSelected?.physiologicalExamId)} />
                  <Row label="검사수행아이디" value={safeValue(activeSelected?.testExecutionId)} />
                  <Row label="검사장비아이디" value={safeValue(activeSelected?.examEquipmentId)} />
                  <Row label="원본데이터" value={safeValue(activeSelected?.rawData)} />
                  <Row label="리포트문서아이디" value={safeValue(activeSelected?.reportDocId)} />
                  <Row label="상태" value={formatStatus(activeSelected?.status)} />
                  <Row label="생성일시" value={formatDateTime(activeSelected?.createdAt)} />
                  <Row label="수정일시" value={formatDateTime(activeSelected?.updatedAt)} />
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
                  <SummaryRow label="활성화 항목" value={activeCount} />
                  <SummaryRow label="비활성화 항목" value={inactiveCount} />
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
                    "좌측 목록: 생리 기능 검사 항목 조회",
                    "행 클릭: 우측 상세 정보 갱신",
                    "수정 버튼: 생리 기능 검사 수정 화면으로 이동",
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
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
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