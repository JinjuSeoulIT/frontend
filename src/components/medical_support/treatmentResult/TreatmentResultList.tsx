"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import RefreshIcon from "@mui/icons-material/Refresh";
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
import {
  formatDateTime,
  safeValue,
} from "@/components/medical_support/common/ExamDisplay";
import TreatmentResultDetailDialog from "@/components/medical_support/treatmentResult/TreatmentResultDetailDialog";
import TreatmentResultSearch, {
  type TreatmentResultSearchCriteria,
} from "@/components/medical_support/treatmentResult/TreatmentResultSearch";
import {
  formatTreatmentResultProgressStatus,
  getTreatmentResultProgressStatusColor,
  getTreatmentResultProgressStatusSx,
  normalizeTreatmentResultActiveStatus,
  normalizeTreatmentResultProgressStatus,
} from "@/components/medical_support/treatmentResult/treatmentResultDisplay";
import { TreatmentResultActions } from "@/features/medical_support/treatmentResult/treatmentResultSlice";
import type {
  TreatmentResult,
  TreatmentResultSearchParams,
} from "@/features/medical_support/treatmentResult/treatmentResultType";
import type { AppDispatch, RootState } from "@/store/store";

const REQUESTED_STATUSES = ["REQUESTED", "WAITING"];
const IN_PROGRESS_STATUSES = ["IN_PROGRESS"];
const COMPLETED_STATUSES = ["COMPLETED"];

const summarizeDetail = (value?: string | null) => {
  if (!value) return "-";
  const trimmed = value.trim();
  return trimmed || "-";
};

const isInactiveResult = (item: Pick<TreatmentResult, "status">) =>
  normalizeTreatmentResultActiveStatus(item.status) === "INACTIVE";

const toTreatmentResultSearchParams = (
  criteria: TreatmentResultSearchCriteria
): TreatmentResultSearchParams => {
  if (criteria.searchType === "treatmentAt") {
    return {
      startDate: criteria.startDate,
      endDate: criteria.endDate,
    };
  }

  return {
    [criteria.searchType]: criteria.searchValue,
  };
};

export function TreatmentResultListSection() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<TreatmentResult | null>(
    null
  );
  const { list: rows, selected, loading, detailLoading, error, detailError } =
    useSelector((state: RootState) => state.treatmentResults);

  React.useEffect(() => {
    dispatch(TreatmentResultActions.fetchTreatmentResultsRequest());
  }, [dispatch]);

  const baseRows = React.useMemo(
    () =>
      includeInactive ? rows : rows.filter((item) => !isInactiveResult(item)),
    [includeInactive, rows]
  );

  const visibleRows = baseRows;

  const requestedCount = React.useMemo(
    () =>
      visibleRows.filter((item) =>
        REQUESTED_STATUSES.includes(
          normalizeTreatmentResultProgressStatus(item.progressStatus)
        )
      ).length,
    [visibleRows]
  );

  const inProgressCount = React.useMemo(
    () =>
      visibleRows.filter((item) =>
        IN_PROGRESS_STATUSES.includes(
          normalizeTreatmentResultProgressStatus(item.progressStatus)
        )
      ).length,
    [visibleRows]
  );

  const completedCount = React.useMemo(
    () =>
      visibleRows.filter((item) =>
        COMPLETED_STATUSES.includes(
          normalizeTreatmentResultProgressStatus(item.progressStatus)
        )
      ).length,
    [visibleRows]
  );

  const inactiveCount = React.useMemo(
    () => visibleRows.filter((item) => isInactiveResult(item)).length,
    [visibleRows]
  );

  const maxPage = Math.max(0, Math.ceil(visibleRows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedRows = React.useMemo(
    () =>
      visibleRows.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, rowsPerPage, visibleRows]
  );

  const detailItem = React.useMemo(() => {
    if (!selectedRow) return selected;

    if (
      selected?.treatmentResultId &&
      selectedRow.treatmentResultId &&
      String(selected.treatmentResultId) === String(selectedRow.treatmentResultId)
    ) {
      return { ...selectedRow, ...selected };
    }

    return selectedRow;
  }, [selected, selectedRow]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleOpenDetail = (row: TreatmentResult) => {
    setSelectedRow(row);
    setIsDetailDialogOpen(true);

    if (row.treatmentResultId) {
      dispatch(
        TreatmentResultActions.fetchTreatmentResultRequest(
          String(row.treatmentResultId)
        )
      );
    }
  };

  const handleCloseDetail = () => {
    setIsDetailDialogOpen(false);
    setSelectedRow(null);
    dispatch(TreatmentResultActions.clearTreatmentResultSelection());
  };

  const handleSearch = (criteria: TreatmentResultSearchCriteria) => {
    dispatch(
      TreatmentResultActions.fetchTreatmentResultsRequest(
        toTreatmentResultSearchParams(criteria)
      )
    );
    setPage(0);
  };

  const handleResetSearch = () => {
    dispatch(TreatmentResultActions.fetchTreatmentResultsRequest());
    setPage(0);
  };

  return (
    <>
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
                진행 상태 기준으로 처치 결과를 확인하고, 필요하면 비활성 데이터도 함께
                조회할 수 있습니다.
              </Typography>
            </Box>

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
              <Chip label={`총 ${visibleRows.length}건`} size="small" />
              <Chip
                label={`요청 ${requestedCount}건`}
                size="small"
                color="warning"
                variant="outlined"
              />
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
              {includeInactive && inactiveCount > 0 ? (
                <Chip label={`비활성 ${inactiveCount}건`} size="small" variant="outlined" />
              ) : null}
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
            </Stack>
          </Box>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ mb: 2.5 }}>
            <TreatmentResultSearch
              loading={loading}
              onSearch={handleSearch}
              onReset={handleResetSearch}
            />
          </Box>

          {loading ? <CircularProgress /> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          {!loading && !error ? (
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
                <Table size="small" stickyHeader sx={{ minWidth: 1280 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">번호</TableCell>
                      <TableCell align="center">처치결과 ID</TableCell>
                      <TableCell align="center">환자명</TableCell>
                      <TableCell align="center">진료과</TableCell>
                      <TableCell align="center">간호사명</TableCell>
                      <TableCell align="center">처치일시</TableCell>
                      <TableCell align="center">진행상태</TableCell>
                      <TableCell align="left">처치내용</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          조회된 처치 결과가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : null}

                    {paginatedRows.map((row, index) => {
                      const inactive = isInactiveResult(row);

                      return (
                        <TableRow
                          key={
                            row.treatmentResultId
                              ? String(row.treatmentResultId)
                              : `${row.procedureResultId ?? "treatment"}-${index}`
                          }
                          hover
                          onClick={() => handleOpenDetail(row)}
                          sx={{
                            cursor: "pointer",
                            backgroundColor: inactive ? "#fcfcfc" : undefined,
                            "&:hover": {
                              backgroundColor: inactive ? "#f4f6f8" : "#f9fbff",
                            },
                            "& td": {
                              py: 1.25,
                              color: inactive ? "text.secondary" : undefined,
                            },
                          }}
                        >
                          <TableCell align="center">
                            {currentPage * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.procedureResultId)}
                          </TableCell>
                          <TableCell align="center">{safeValue(row.patientName)}</TableCell>
                          <TableCell align="center">
                            {safeValue(row.departmentName)}
                          </TableCell>
                          <TableCell align="center">{safeValue(row.nurseName)}</TableCell>
                          <TableCell align="center">
                            {formatDateTime(row.treatmentAt)}
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
                                label={formatTreatmentResultProgressStatus(
                                  row.progressStatus
                                )}
                                color={getTreatmentResultProgressStatusColor(
                                  row.progressStatus
                                )}
                                size="small"
                                sx={getTreatmentResultProgressStatusSx()}
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
                          <TableCell
                            align="left"
                            sx={{
                              maxWidth: 280,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {summarizeDetail(row.detail)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={visibleRows.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
                labelRowsPerPage="페이지당 행 수"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}`}
              />
            </Paper>
          ) : null}
        </CardContent>
      </Card>

      <TreatmentResultDetailDialog
        open={isDetailDialogOpen}
        item={detailItem}
        loading={detailLoading}
        error={detailError}
        onClose={handleCloseDetail}
      />
    </>
  );
}

export default function TreatmentResultList() {
  return (
    <Box sx={{ px: 3, py: 3, maxWidth: 1400, mx: "auto" }}>
      <TreatmentResultListSection />
    </Box>
  );
}
