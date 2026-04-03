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
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RecActions } from "@/features/medical_support/record/recordSlice";
import type { RecordFormType } from "@/features/medical_support/record/recordTypes";
import { receptionActions } from "@/features/Reception/ReceptionSlice";
import type { Reception } from "@/features/Reception/ReceptionTypes";
import type { AppDispatch, RootState } from "@/store/store";
import RecordSearch from "./RecordSearch";

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

const getStatusLabel = (status?: string | null) => {
  if (status === "ACTIVE") return "ACTIVE";
  if (status === "INACTIVE") return "INACTIVE";
  return "-";
};

const getStatusColor = (status?: string | null) => {
  if (status === "ACTIVE") return "success";
  if (status === "INACTIVE") return "default";
  return "default";
};

const getReceptionStatusLabel = (status?: string | null) => {
  switch (status) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "IN_PROGRESS":
      return "진료중";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "COMPLETED":
      return "완료";
    default:
      return status ?? "-";
  }
};

const getReceptionStatusChipColor = (status?: string | null) => {
  switch (status) {
    case "IN_PROGRESS":
      return "success" as const;
    case "CALLED":
      return "info" as const;
    case "WAITING":
    case "PAYMENT_WAIT":
      return "primary" as const;
    default:
      return "default" as const;
  }
};

const isToday = (value?: string | null) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export default function RecordList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { list, loading, error } = useSelector(
    (state: RootState) => state.records
  );
  const {
    list: receptions,
    loading: receptionsLoading,
    error: receptionsError,
  } = useSelector((state: RootState) => state.receptions);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReceptionId, setSelectedReceptionId] = useState<number | null>(
    null
  );

  useEffect(() => {
    dispatch(RecActions.fetchRecordsRequest());
    dispatch(receptionActions.fetchReceptionsRequest());
  }, [dispatch]);

  const maxPage = Math.max(0, Math.ceil(list.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);
  const paginatedList = list.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const receptionList = useMemo(
    () =>
      receptions
        .filter((item) => item.visitType === "OUTPATIENT")
        .filter((item) => isToday(item.createdAt) || isToday(item.arrivedAt))
        .filter((item) =>
          ["WAITING", "CALLED", "IN_PROGRESS"].includes(item.status)
        )
        .sort((a, b) => {
          const left = new Date(a.arrivedAt ?? a.createdAt ?? 0).getTime();
          const right = new Date(b.arrivedAt ?? b.createdAt ?? 0).getTime();
          return right - left;
        }),
    [receptions]
  );

  const selectedReception = useMemo(
    () =>
      receptionList.find((item) => item.receptionId === selectedReceptionId) ??
      null,
    [receptionList, selectedReceptionId]
  );

  const activeReception = selectedReception ?? receptionList[0] ?? null;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleRowClick = (record: RecordFormType) => {
    router.push(`/medical_support/record/detail/${record.recordId}`);
  };

  const handleReceptionClick = (reception: Reception) => {
    setSelectedReceptionId(reception.receptionId);
  };

  const handleCreateWithReception = () => {
    router.push("/medical_support/record/create");
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 3,
        maxWidth: 1240,
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "360px minmax(0, 1.8fr)",
          },
        }}
      >
        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fff",
            minWidth: 0,
            order: { xs: 2, xl: 1 },
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              backgroundColor: "#fafafa",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", lg: "center" },
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ minWidth: 220, flex: "1 1 260px" }}>
                <Typography variant="h6" fontWeight={700}>
                  간호 기록
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  간호 기록 목록을 조회하고 상세 페이지로 이동할 수 있습니다.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip label={`총 ${list.length}건`} size="small" />

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    dispatch(RecActions.fetchRecordsRequest());
                    dispatch(receptionActions.fetchReceptionsRequest());
                  }}
                  disabled={loading || receptionsLoading}
                >
                  새로고침
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateWithReception}
                  disabled={!activeReception}
                  sx={{
                    whiteSpace: "nowrap",
                    borderRadius: 2,
                    px: 1.75,
                    height: 36,
                    flexShrink: 0,
                  }}
                >
                  간호 기록 등록
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 2,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: activeReception ? "#bfdbfe" : "grey.200",
                backgroundColor: activeReception ? "#f8fbff" : "#fff",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                선택된 접수 환자
              </Typography>
              {!activeReception && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.75 }}
                >
                  오른쪽 접수 환자 목록에서 환자를 선택하면 여기서 정보를 확인할 수 있습니다.
                </Typography>
              )}
              {activeReception && (
                <Box
                  sx={{
                    mt: 1,
                    display: "grid",
                    gap: 1,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      접수번호
                    </Typography>
                    <Typography fontWeight={700}>
                      {activeReception.receptionNo ?? "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      환자명
                    </Typography>
                    <Typography fontWeight={700}>
                      {activeReception.patientName ?? "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      진료과
                    </Typography>
                    <Typography fontWeight={700}>
                      {activeReception.departmentName ?? "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      상태
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getReceptionStatusLabel(activeReception.status)}
                        size="small"
                        color={getReceptionStatusChipColor(
                          activeReception.status
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Divider />

          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ mb: 2 }}>
              <RecordSearch />
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
                  <Table size="small" stickyHeader sx={{ minWidth: 820 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                            width: 72,
                          }}
                          align="center"
                        >
                          번호
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                          }}
                          align="center"
                        >
                          간호사명
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                          }}
                          align="center"
                        >
                          환자명
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                          }}
                          align="center"
                        >
                          진료과
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                          }}
                          align="center"
                        >
                          기록일시
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                          }}
                          align="center"
                        >
                          상태
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {list.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                            데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}

                      {paginatedList.map((record, index) => (
                        <TableRow
                          key={record.recordId}
                          hover
                          sx={{
                            cursor: "pointer",
                            "& td": { py: 1.25 },
                            "&:hover": { backgroundColor: "#f9fbff" },
                          }}
                          onClick={() => handleRowClick(record)}
                        >
                          <TableCell align="center">
                            {currentPage * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell align="center">
                            {record.nurseName ?? "-"}
                          </TableCell>
                          <TableCell align="center">
                            {record.patientName ?? "-"}
                          </TableCell>
                          <TableCell align="center">
                            {record.departmentName ?? "-"}
                          </TableCell>
                          <TableCell align="center">
                            {formatDateTime(record.recordedAt)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getStatusLabel(record.status)}
                              color={getStatusColor(record.status)}
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
                  count={list.length}
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

        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fff",
            minWidth: 0,
            order: { xs: 1, xl: 0 },
          }}
        >
          <Box sx={{ px: 3, py: 2.5, backgroundColor: "#fafafa" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                접수 환자 목록
              </Typography>
              <Chip
                label={`오늘 ${receptionList.length}명`}
                size="small"
                color="primary"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              접수/대기/진료중 환자를 보고 간호 기록 등록 화면으로 이동할 수 있습니다.
            </Typography>
          </Box>

          <Divider />

          <CardContent sx={{ p: 2 }}>
            {receptionsLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {!receptionsLoading && receptionsError && (
              <Alert severity="error">{receptionsError}</Alert>
            )}

            {!receptionsLoading && !receptionsError && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {receptionList.map((reception) => (
                  <Box
                    key={reception.receptionId}
                    onClick={() => handleReceptionClick(reception)}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      alignItems: "center",
                      gap: 1.25,
                      p: 1.25,
                      borderRadius: 2,
                      border: "1px solid",
                      cursor: "pointer",
                      backgroundColor:
                        activeReception?.receptionId === reception.receptionId
                          ? "#f0f7ff"
                          : "rgba(255,255,255,0.9)",
                      borderColor:
                        activeReception?.receptionId === reception.receptionId
                          ? "#93c5fd"
                          : "grey.200",
                      "&:hover": {
                        backgroundColor: "#f8fbff",
                        borderColor: "#bfdbfe",
                      },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {reception.receptionNo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {(reception.patientName ?? "환자 미확인").trim()} ·{" "}
                        {(reception.departmentName ?? "진료과 미정").trim()}
                      </Typography>
                    </Box>
                    <Chip
                      label={getReceptionStatusLabel(reception.status)}
                      size="small"
                      color={getReceptionStatusChipColor(reception.status)}
                    />
                  </Box>
                ))}

                {receptionList.length === 0 && (
                  <Typography
                    color="text.secondary"
                    sx={{ py: 4, textAlign: "center" }}
                  >
                    오늘 표시할 접수 환자가 없습니다.
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}