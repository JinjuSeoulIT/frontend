"use client";

import type { ChangeEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Paper,
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
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RecActions } from "@/features/medical_support/record/recordSlice";
import type { RecordFormType } from "@/features/medical_support/record/recordTypes";
import type { Reception } from "@/features/Reception/ReceptionTypes";
import {
  fetchReceptionDetailApi,
  fetchReceptionQueueApi,
} from "@/lib/medical_support/receptionApi";
import type { AppDispatch, RootState } from "@/store/store";
import RecordSearch from "./RecordSearch";

const RECEPTION_DETAIL_CACHE_TTL_MS = 60 * 1000;

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

const normalizeRecordStatus = (status?: string | null) => {
  const normalized = status?.trim().toUpperCase();
  return normalized === "INACTIVE" ? "INACTIVE" : "ACTIVE";
};

const isInactiveRecord = (record: Pick<RecordFormType, "status">) =>
  normalizeRecordStatus(record.status) === "INACTIVE";

const getStatusLabel = (status?: string | null) => {
  return normalizeRecordStatus(status) === "INACTIVE" ? "비활성" : "활성";
};

const getStatusColor = (status?: string | null) => {
  return normalizeRecordStatus(status) === "INACTIVE" ? "default" : "success";
};

const getReceptionStatusLabel = (status?: string | null) => {
  switch (status) {
    case "WAITING":
      return "대기";
    // case "CALLED":
    //   return "호출";
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

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export default function RecordList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { list, loading, error, statusToggleSuccess } = useSelector(
    (state: RootState) => state.records
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [receptionsLoading, setReceptionsLoading] = useState(false);
  const [receptionsError, setReceptionsError] = useState<string | null>(null);
  const [selectedReceptionId, setSelectedReceptionId] = useState<number | null>(
    null
  );
  const [isReceptionDialogOpen, setIsReceptionDialogOpen] = useState(false);
  const [selectedReceptionDetail, setSelectedReceptionDetail] =
    useState<Reception | null>(null);
  const [receptionDetailLoading, setReceptionDetailLoading] = useState(false);
  const [receptionDetailError, setReceptionDetailError] = useState<string | null>(
    null
  );
  const [inFlightReceptionId, setInFlightReceptionId] = useState<number | null>(
    null
  );
  const [pendingStatusRecordId, setPendingStatusRecordId] = useState<
    string | null
  >(null);
  const pendingStatusActionRef = useRef<"ACTIVE" | "INACTIVE" | null>(null);
  const receptionDetailCacheRef = useRef<
    Map<number, { data: Reception; fetchedAt: number }>
  >(new Map());
  const selectedReceptionIdRef = useRef<number | null>(null);

  useEffect(() => {
    dispatch(RecActions.fetchRecordsRequest());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    setReceptionsLoading(true);
    setReceptionsError(null);

    void fetchReceptionQueueApi()
      .then((queue) => {
        if (cancelled) return;
        setReceptions(queue);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        setReceptions([]);
        setReceptionsError(
          getErrorMessage(requestError, "접수 목록 조회에 실패했습니다.")
        );
      })
      .finally(() => {
        if (!cancelled) {
          setReceptionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!statusToggleSuccess) return;

    if (pendingStatusActionRef.current === "INACTIVE") {
      alert("간호 기록이 비활성화되었습니다.");
    } else if (pendingStatusActionRef.current === "ACTIVE") {
      alert("간호 기록이 활성화되었습니다.");
    }

    pendingStatusActionRef.current = null;
    setPendingStatusRecordId(null);
    dispatch(RecActions.resetStatusToggleSuccess());
  }, [dispatch, statusToggleSuccess]);

  useEffect(() => {
    if (!error) return;
    if (!pendingStatusActionRef.current) return;

    if (error === "Network Error") {
      alert("서버에 연결할 수 없습니다.\n잠시 후 다시 시도해주세요.");
    } else {
      alert("상태 변경에 실패했습니다.\n다시 시도해주세요.");
    }

    pendingStatusActionRef.current = null;
    setPendingStatusRecordId(null);
  }, [error]);

  const visibleRecords = useMemo(
    () => (includeInactive ? list : list.filter((item) => !isInactiveRecord(item))),
    [includeInactive, list]
  );

  const inactiveCount = useMemo(
    () => visibleRecords.filter((item) => isInactiveRecord(item)).length,
    [visibleRecords]
  );

  const maxPage = Math.max(0, Math.ceil(visibleRecords.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);
  const paginatedList = useMemo(
    () =>
      visibleRecords.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, rowsPerPage, visibleRecords]
  );

  const receptionList = receptions;

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

  const handleToggleStatus = (
    event: MouseEvent<HTMLButtonElement>,
    record: RecordFormType
  ) => {
    event.stopPropagation();

    const isActive = !isInactiveRecord(record);
    const nextStatus = isActive ? "INACTIVE" : "ACTIVE";
    const confirmMessage = isActive
      ? "정말 비활성화하시겠습니까?"
      : "정말 활성화하시겠습니까?";

    if (!window.confirm(confirmMessage)) return;

    pendingStatusActionRef.current = nextStatus;
    setPendingStatusRecordId(record.recordId);

    dispatch(
      RecActions.toggleRecordStatusRequest({
        recordId: record.recordId,
        status: nextStatus,
      })
    );
  };

  const loadReceptionDetail = async (
    receptionId: number,
    options?: { forceRefresh?: boolean }
  ) => {
    const forceRefresh = options?.forceRefresh ?? false;

    if (inFlightReceptionId === receptionId) {
      return;
    }

    const cached = receptionDetailCacheRef.current.get(receptionId);
    const isCacheValid =
      !forceRefresh &&
      cached !== undefined &&
      Date.now() - cached.fetchedAt < RECEPTION_DETAIL_CACHE_TTL_MS;

    if (isCacheValid) {
      setSelectedReceptionDetail(cached.data);
      setReceptionDetailError(null);
      setReceptionDetailLoading(false);
      return;
    }

    setReceptionDetailLoading(true);
    setReceptionDetailError(null);
    setSelectedReceptionDetail(null);
    setInFlightReceptionId(receptionId);

    try {
      const detail = await fetchReceptionDetailApi(receptionId);

      if (!detail) {
        throw new Error("Reception detail fetch failed");
      }

      receptionDetailCacheRef.current.set(receptionId, {
        data: detail,
        fetchedAt: Date.now(),
      });

      if (selectedReceptionIdRef.current === receptionId) {
        setSelectedReceptionDetail(detail);
      }
    } catch (requestError: unknown) {
      if (selectedReceptionIdRef.current === receptionId) {
        setSelectedReceptionDetail(null);
        setReceptionDetailError(
          getErrorMessage(requestError, "접수 상세 정보를 불러오지 못했습니다.")
        );
      }
    } finally {
      if (selectedReceptionIdRef.current === receptionId) {
        setReceptionDetailLoading(false);
      }
      setInFlightReceptionId((current) =>
        current === receptionId ? null : current
      );
    }
  };

  const handleReceptionClick = (reception: Reception) => {
    const receptionId = reception.receptionId;
    selectedReceptionIdRef.current = receptionId;
    setSelectedReceptionId(receptionId);
    setIsReceptionDialogOpen(true);
    void loadReceptionDetail(receptionId);
  };

  const handleCreateWithReception = () => {
    if (!selectedReceptionDetail) return;

    const params = new URLSearchParams({
      receptionId: String(selectedReceptionDetail.receptionId),
      patientName: selectedReceptionDetail.patientName ?? "",
      departmentName: selectedReceptionDetail.departmentName ?? "",
    });

    if (selectedReceptionDetail.patientId != null) {
      params.set("patientId", String(selectedReceptionDetail.patientId));
    }

    router.push(`/medical_support/record/create?${params.toString()}`);
  };

  const showInitialLoading = loading && list.length === 0;

  return (
    <Box
      sx={{
        px: 3,
        py: 3,
        maxWidth: 1380,
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
            xl: "320px minmax(0, 1fr)",
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
                    whiteSpace: { xs: "normal", sm: "nowrap" },
                  }}
                >
                  간호 기록 목록을 조회하고 상세 페이지로 이동하거나, 목록에서 바로 활성 상태를 변경할 수 있습니다.
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

                <Chip label={`총 ${visibleRecords.length}건`} size="small" />

                {includeInactive && inactiveCount > 0 ? (
                  <Chip
                    label={`비활성 ${inactiveCount}건`}
                    size="small"
                    variant="outlined"
                  />
                ) : null}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    dispatch(RecActions.fetchRecordsRequest());
                    setReceptionsLoading(true);
                    setReceptionsError(null);

                    void fetchReceptionQueueApi()
                      .then((queue) => {
                        setReceptions(queue);
                      })
                      .catch((requestError: unknown) => {
                        setReceptions([]);
                        setReceptionsError(
                          getErrorMessage(
                            requestError,
                            "접수 목록 조회에 실패했습니다."
                          )
                        );
                      })
                      .finally(() => {
                        setReceptionsLoading(false);
                      });
                  }}
                  disabled={loading || receptionsLoading}
                >
                  새로고침
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider />

          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ mb: 2 }}>
              <RecordSearch />
            </Box>

            {showInitialLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={28} />
              </Box>
            ) : null}

            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            {!showInitialLoading ? (
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
                  <Table
                    size="small"
                    stickyHeader
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      "& .MuiTableCell-root": {
                        px: 1.5,
                      },
                    }}
                  >
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
                            width: 120,
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
                            width: 120,
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
                            width: 140,
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
                            width: 190,
                          }}
                          align="center"
                        >
                          생성일시
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                            width: 100,
                          }}
                          align="center"
                        >
                          활성 여부
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                            조회된 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : null}

                      {paginatedList.map((record, index) => {
                        const inactive = isInactiveRecord(record);
                        const isPending =
                          pendingStatusRecordId === record.recordId && loading;

                        return (
                          <TableRow
                            key={record.recordId}
                            hover
                            sx={{
                              cursor: "pointer",
                              backgroundColor: inactive ? "#fcfcfc" : undefined,
                              "& td": {
                                py: 1.25,
                                color: inactive ? "text.secondary" : undefined,
                              },
                              "&:hover": {
                                backgroundColor: inactive ? "#f4f6f8" : "#f9fbff",
                              },
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
                              {formatDateTime(record.createdAt ?? record.recordedAt)}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={getStatusLabel(record.status)}
                                color={getStatusColor(record.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={visibleRecords.length}
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
            ) : null}
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
            {receptionsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={28} />
              </Box>
            ) : null}

            {!receptionsLoading && receptionsError ? (
              <Alert severity="error">{receptionsError}</Alert>
            ) : null}

            {!receptionsLoading && !receptionsError ? (
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
                        selectedReceptionId === reception.receptionId
                          ? "#f0f7ff"
                          : "rgba(255,255,255,0.9)",
                      borderColor:
                        selectedReceptionId === reception.receptionId
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

                {receptionList.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    sx={{ py: 4, textAlign: "center" }}
                  >
                    오늘 표시할 접수 환자가 없습니다.
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={isReceptionDialogOpen}
        onClose={() => {
          setIsReceptionDialogOpen(false);
          setReceptionDetailError(null);
          setReceptionDetailLoading(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>접수 환자 상세</DialogTitle>

        <DialogContent dividers>
          {receptionDetailLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : receptionDetailError ? (
            <Alert severity="error" sx={{ mb: 1 }}>
              {receptionDetailError}
            </Alert>
          ) : !selectedReceptionDetail ? (
            <Typography>표시할 접수 상세 정보가 없습니다.</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  접수번호
                </Typography>
                <Typography fontWeight={700}>
                  {selectedReceptionDetail.receptionNo ?? "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  환자명
                </Typography>
                <Typography fontWeight={700}>
                  {selectedReceptionDetail.patientName ?? "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  진료과
                </Typography>
                <Typography fontWeight={700}>
                  {selectedReceptionDetail.departmentName ?? "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  담당의
                </Typography>
                <Typography fontWeight={700}>
                  {selectedReceptionDetail.doctorName ?? "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  현재 상태
                </Typography>
                <Typography fontWeight={700}>
                  {getReceptionStatusLabel(selectedReceptionDetail.status)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {receptionDetailError && selectedReceptionId ? (
            <Button
              onClick={() =>
                void loadReceptionDetail(selectedReceptionId, { forceRefresh: true })
              }
              disabled={Boolean(inFlightReceptionId)}
            >
              다시 시도
            </Button>
          ) : null}
          <Button
            onClick={() => {
              setIsReceptionDialogOpen(false);
              setReceptionDetailError(null);
              setReceptionDetailLoading(false);
            }}
          >
            닫기
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateWithReception}
            disabled={
              !selectedReceptionDetail ||
              receptionDetailLoading ||
              Boolean(receptionDetailError)
            }
          >
            간호 기록 등록
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
