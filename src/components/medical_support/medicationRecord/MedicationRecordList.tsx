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
import RefreshIcon from "@mui/icons-material/Refresh";
import { MedicationRecordActions } from "@/features/medical_support/medicationRecord/medicationRecordSlice";
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

const normalizeStatus = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

const getStatusColor = (
  status?: string | null
): "default" | "success" | "error" => {
  const normalized = normalizeStatus(status);

  if (normalized === "ACTIVE") return "success";
  if (normalized === "INACTIVE") return "error";

  return "default";
};

export default function MedicationRecordList() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const { list: rows, loading, error } = useSelector(
    (state: RootState) => state.medicationRecords
  );

  React.useEffect(() => {
    dispatch(MedicationRecordActions.fetchMedicationRecordsRequest());
  }, [dispatch]);

  const activeCount = React.useMemo(
    () => rows.filter((item) => normalizeStatus(item.status) === "ACTIVE").length,
    [rows]
  );

  const inactiveCount = React.useMemo(
    () => rows.filter((item) => normalizeStatus(item.status) === "INACTIVE").length,
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
      <Box sx={{ px: 3, py: 3, maxWidth: 1600, mx: "auto" }}>
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
                  투약 기록 목록
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  투약 기록 정보를 조회할 수 있습니다.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Chip label={`총 ${rows.length}건`} size="small" />
                <Chip label={`활성 ${activeCount}건`} size="small" color="success" variant="outlined" />
                <Chip label={`비활성 ${inactiveCount}건`} size="small" color="error" variant="outlined" />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => dispatch(MedicationRecordActions.fetchMedicationRecordsRequest())}
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
                  <Table size="small" stickyHeader sx={{ minWidth: 1100 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">번호</TableCell>
                        <TableCell align="center">투약기록 ID</TableCell>
                        <TableCell align="center">오더항목 ID</TableCell>
                        <TableCell align="center">투약일시</TableCell>
                        <TableCell align="center">투약량</TableCell>
                        <TableCell align="center">투약단위</TableCell>
                        <TableCell align="center">간호사 ID</TableCell>
                        <TableCell align="center">상태</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedRows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            투약 기록 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}

                      {paginatedRows.map((row, index) => (
                        <TableRow key={String(row.medicationId)} hover>
                          <TableCell align="center">
                            {currentPage * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell align="center">{safeValue(row.medicationId)}</TableCell>
                          <TableCell align="center">{safeValue(row.orderItemId)}</TableCell>
                          <TableCell align="center">{formatDateTime(row.administeredAt)}</TableCell>
                          <TableCell align="center">{safeValue(row.doseNumber)}</TableCell>
                          <TableCell align="center">{safeValue(row.doseUnit)}</TableCell>
                          <TableCell align="center">{safeValue(row.nurseId)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={safeValue(row.status)}
                              color={getStatusColor(row.status)}
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