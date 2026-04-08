"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
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
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { TestExecutionActions } from "@/features/medical_support/testExecution/testExecutionSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import TestExecutionSearch from "./TestExecutionSearch";

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

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";

  const text = String(value).trim();
  return text ? text : "-";
};

const normalizeStatus = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

const formatProgressStatusLabel = (status?: string | null) => {
  const normalized = normalizeStatus(status);

  if (normalized === "WAITING") return "대기중";
  if (normalized === "IN_PROGRESS") return "검사중";
  if (normalized === "COMPLETED") return "검사완료";
  if (normalized === "CANCELLED") return "취소";

  return safeValue(status);
};

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

const TABLE_HEADERS = [
  "번호",
  "환자명",
  "진료과",
  "검사유형",
  "진행상태",
  "생성일시",
  "검사수행 ID",
];

export default function TestExecutionList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.testexecutions
  );

  useEffect(() => {
    dispatch(TestExecutionActions.fetchTestExecutionsRequest(undefined));
  }, [dispatch]);

  const completedCount = useMemo(
    () =>
      items.filter((item) =>
        DONE_STATUSES.includes(normalizeStatus(item.progressStatus))
      ).length,
    [items]
  );

  const inProgressCount = useMemo(
    () =>
      items.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeStatus(item.progressStatus))
      ).length,
    [items]
  );

  const maxPage = Math.max(0, Math.ceil(items.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedItems = useMemo(
    () =>
      items.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, items, rowsPerPage]
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
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
                검사 수행 목록
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                검사실 담당자가 환자, 진료과, 상태를 빠르게 확인할 수 있는
                운영용 목록입니다.
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
            >
              <Chip label={`총 ${items.length}건`} size="small" />
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
                  dispatch(TestExecutionActions.fetchTestExecutionsRequest(undefined))
                }
                disabled={loading}
              >
                새로고침
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider />

        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ mb: 2 }}>
            <TestExecutionSearch />
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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
                <Table size="small" stickyHeader sx={{ minWidth: 980 }}>
                  <TableHead>
                    <TableRow>
                      {TABLE_HEADERS.map((label) => (
                        <TableCell
                          key={label}
                          align="center"
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={TABLE_HEADERS.length}
                          align="center"
                          sx={{ py: 5 }}
                        >
                          검사 수행 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}

                    {paginatedItems.map((item, index) => (
                      <TableRow
                        key={String(item.testExecutionId)}
                        hover
                        sx={{
                          cursor: "pointer",
                          "& td": { py: 1.25, whiteSpace: "nowrap" },
                          "&:hover": { backgroundColor: "#f9fbff" },
                        }}
                        onClick={() =>
                          router.push(
                            `/medical_support/testExecution/edit/${item.testExecutionId}`
                          )
                        }
                      >
                        <TableCell align="center">
                          {currentPage * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.patientName)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.departmentName)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.executionType)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={formatProgressStatusLabel(item.progressStatus)}
                            color={getStatusColor(item.progressStatus)}
                            size="small"
                            sx={getStatusSx(item.progressStatus)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {formatDateTime(item.createdAt)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.testExecutionId)}
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
                rowsPerPageOptions={[5, 10, 25]}
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
  );
}
