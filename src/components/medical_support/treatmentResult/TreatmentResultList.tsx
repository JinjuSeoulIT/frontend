"use client";

import * as React from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { TreatmentResultActions } from "@/features/medical_support/treatmentResult/treatmentResultSlice";
import type { RootState, AppDispatch } from "@/store/store";

const DONE_STATUSES = ["COMPLETED"];
const ACTIVE_STATUSES = ["IN_PROGRESS"];

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

const normalizeStatus = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

const getStatusColor = (
  status?: string | null
): "default" | "info" | "success" => {
  const normalized = normalizeStatus(status);

  if (DONE_STATUSES.includes(normalized)) return "success";
  if (ACTIVE_STATUSES.includes(normalized)) return "info";

  return "default";
};

const getStatusSx = (status?: string | null) => {
  const normalized = normalizeStatus(status);

  if (normalized === "WAITING") {
    return {
      backgroundColor: "#616161",
      color: "#ffffff",
      fontWeight: 600,
    };
  }

  if (normalized === "CANCELLED") {
    return {
      backgroundColor: "#eeeeee",
      color: "#757575",
      fontWeight: 500,
    };
  }

  return {
    fontWeight: 600,
  };
};

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

export default function TreatmentResultList() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const { list: rows, loading, error } = useSelector(
    (state: RootState) => state.treatmentResults
  );

  React.useEffect(() => {
    dispatch(TreatmentResultActions.fetchTreatmentResultsRequest());
  }, [dispatch]);

  const completedCount = React.useMemo(
    () =>
      rows.filter((item) =>
        DONE_STATUSES.includes(normalizeStatus(item.status))
      ).length,
    [rows]
  );

  const inProgressCount = React.useMemo(
    () =>
      rows.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeStatus(item.status))
      ).length,
    [rows]
  );

  const maxPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedRows = React.useMemo(
    () =>
      rows.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, rows, rowsPerPage]
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
    <MainLayout>
      <Box sx={{ px: 3, py: 3, maxWidth: 1400, mx: "auto" }}>
        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ px: 3, py: 2.5, backgroundColor: "#fafafa" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", lg: "center" },
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ minWidth: 240, flex: "1 1 280px" }}>
                <Typography variant="h6" fontWeight={700}>
                  처치 결과 목록
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  처치 결과 정보를 조회할 수 있습니다.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Chip label={`총 ${rows.length}건`} size="small" />
                <Chip
                  label={`진행 중 ${inProgressCount}건`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
                <Chip
                  label={`완료 ${completedCount}건`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() =>
                    dispatch(TreatmentResultActions.fetchTreatmentResultsRequest())
                  }
                >
                  새로고침
                </Button>
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 2.5 }}>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                  overflow: "hidden",
                }}
              >
                <TableContainer>
                  <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">번호</TableCell>
                        <TableCell align="center">처치결과 ID</TableCell>
                        <TableCell align="center">상태</TableCell>
                        <TableCell align="center">시행일시</TableCell>
                        <TableCell align="center">시행자 ID</TableCell>
                        <TableCell align="center">처치내용</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedRows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            처치 결과 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}

                      {paginatedRows.map((row, index) => (
                        <TableRow key={String(row.procedureResultId)} hover>
                          <TableCell align="center">
                            {currentPage * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell align="center">{safeValue(row.procedureResultId)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={safeValue(row.status)}
                              color={getStatusColor(row.status)}
                              size="small"
                              sx={getStatusSx(row.status)}
                            />
                          </TableCell>
                          <TableCell align="center">{formatDateTime(row.performedAt)}</TableCell>
                          <TableCell align="center">{safeValue(row.performerId)}</TableCell>
                          <TableCell align="center">{safeValue(row.detail)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={rows.length}
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
      </Box>
    </MainLayout>
  );
}