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
import { safeValue } from "@/components/medical_support/common/ExamDisplay";
import TreatmentResultDetailDialog from "@/components/medical_support/treatmentResult/TreatmentResultDetailDialog";
import {
  formatTreatmentResultStatus,
  getTreatmentResultStatusColor,
  getTreatmentResultStatusSx,
  normalizeTreatmentResultStatus,
} from "@/components/medical_support/treatmentResult/treatmentResultDisplay";
import { TreatmentResultActions } from "@/features/medical_support/treatmentResult/treatmentResultSlice";
import type { TreatmentResult } from "@/features/medical_support/treatmentResult/treatmentResultType";
import type { RootState, AppDispatch } from "@/store/store";

const REQUESTED_STATUSES = ["REQUESTED"];
const ACTIVE_STATUSES = ["IN_PROGRESS"];
const DONE_STATUSES = ["COMPLETED"];

const summarizeDetail = (value?: string | null) => {
  if (!value) return "-";
  const trimmed = value.trim();
  if (!trimmed) return "-";
  return trimmed;
};

export function TreatmentResultListSection() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<TreatmentResult | null>(null);

  const { list: rows, selected, loading, detailLoading, error, detailError } =
    useSelector((state: RootState) => state.treatmentResults);

  React.useEffect(() => {
    dispatch(TreatmentResultActions.fetchTreatmentResultsRequest());
  }, [dispatch]);

  const requestedCount = React.useMemo(
    () =>
      rows.filter((item) =>
        REQUESTED_STATUSES.includes(normalizeTreatmentResultStatus(item.status))
      ).length,
    [rows]
  );

  const inProgressCount = React.useMemo(
    () =>
      rows.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeTreatmentResultStatus(item.status))
      ).length,
    [rows]
  );

  const completedCount = React.useMemo(
    () =>
      rows.filter((item) =>
        DONE_STATUSES.includes(normalizeTreatmentResultStatus(item.status))
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
                처치 결과를 목록과 상세로 나누어 확인할 수 있습니다.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Chip label={`총 ${rows.length}건`} size="small" />
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
                <Table size="small" stickyHeader sx={{ minWidth: 980 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">번호</TableCell>
                      <TableCell align="center">처치결과 ID</TableCell>
                      <TableCell align="center">환자명</TableCell>
                      <TableCell align="center">진료과</TableCell>
                      <TableCell align="center">상태</TableCell>
                      <TableCell align="left">처치내용</TableCell>
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
                          "&:hover": { backgroundColor: "#f9fbff" },
                          "& td": { py: 1.25 },
                        }}
                      >
                        <TableCell align="center">
                          {currentPage * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(row.treatmentResultId)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(row.patientName)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(row.departmentName)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={formatTreatmentResultStatus(row.status)}
                            color={getTreatmentResultStatusColor(row.status)}
                            size="small"
                            sx={getTreatmentResultStatusSx(row.status)}
                          />
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
    <MainLayout>
      <Box sx={{ px: 3, py: 3, maxWidth: 1400, mx: "auto" }}>
        <TreatmentResultListSection />
      </Box>
    </MainLayout>
  );
}
