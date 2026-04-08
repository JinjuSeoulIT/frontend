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
import MedicationRecordDetailDialog from "@/components/medical_support/medicationRecord/MedicationRecordDetailDialog";
import { formatDateTime, safeValue } from "@/components/medical_support/common/ExamDisplay";
import {
  formatMedicationDose,
  formatMedicationRecordStatus,
  getMedicationRecordStatusColor,
  getMedicationRecordStatusSx,
  normalizeMedicationRecordStatus,
} from "@/components/medical_support/medicationRecord/medicationRecordDisplay";
import { MedicationRecordActions } from "@/features/medical_support/medicationRecord/medicationRecordSlice";
import type { MedicationRecord } from "@/features/medical_support/medicationRecord/medicationRecordType";
import type { RootState, AppDispatch } from "@/store/store";

const REQUESTED_STATUSES = ["REQUESTED"];
const ACTIVE_STATUSES = ["ACTIVE", "IN_PROGRESS"];
const COMPLETED_STATUSES = ["COMPLETED"];

export function MedicationRecordListSection() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<MedicationRecord | null>(
    null
  );

  const { list: rows, selected, loading, detailLoading, error, detailError } =
    useSelector((state: RootState) => state.medicationRecords);

  React.useEffect(() => {
    dispatch(MedicationRecordActions.fetchMedicationRecordsRequest());
  }, [dispatch]);

  const requestedCount = React.useMemo(
    () =>
      rows.filter((item) =>
        REQUESTED_STATUSES.includes(normalizeMedicationRecordStatus(item.status))
      ).length,
    [rows]
  );

  const activeCount = React.useMemo(
    () =>
      rows.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeMedicationRecordStatus(item.status))
      ).length,
    [rows]
  );

  const completedCount = React.useMemo(
    () =>
      rows.filter((item) =>
        COMPLETED_STATUSES.includes(normalizeMedicationRecordStatus(item.status))
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
      selected?.medicationRecordId &&
      selectedRow.medicationRecordId &&
      String(selected.medicationRecordId) ===
        String(selectedRow.medicationRecordId)
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

  const handleOpenDetail = (row: MedicationRecord) => {
    setSelectedRow(row);
    setIsDetailDialogOpen(true);

    if (row.medicationRecordId) {
      dispatch(
        MedicationRecordActions.fetchMedicationRecordRequest(
          String(row.medicationRecordId)
        )
      );
    }
  };

  const handleCloseDetail = () => {
    setIsDetailDialogOpen(false);
    setSelectedRow(null);
    dispatch(MedicationRecordActions.clearMedicationRecordSelection());
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
                투약 기록 목록
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                투약 기록을 목록과 상세로 나누어 확인할 수 있습니다.
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
                label={`진행 중 ${activeCount}건`}
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
                  dispatch(MedicationRecordActions.fetchMedicationRecordsRequest())
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
                <Table size="small" stickyHeader sx={{ minWidth: 1080 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">번호</TableCell>
                      <TableCell align="center">투약기록 ID</TableCell>
                      <TableCell align="center">환자명</TableCell>
                      <TableCell align="center">진료과명</TableCell>
                      <TableCell align="center">투약일시</TableCell>
                      <TableCell align="center">투약량</TableCell>
                      <TableCell align="center">투약종류</TableCell>
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
                      <TableRow
                        key={
                          row.medicationRecordId
                            ? String(row.medicationRecordId)
                            : row.medicationId
                              ? String(row.medicationId)
                              : `medication-record-${index}`
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
                          {safeValue(row.medicationRecordId)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(row.patientName)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(row.departmentName)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDateTime(row.administeredAt)}
                        </TableCell>
                        <TableCell align="center">
                          {formatMedicationDose(row.doseNumber, row.doseUnit)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(row.doseKind)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={formatMedicationRecordStatus(row.status)}
                            color={getMedicationRecordStatusColor(row.status)}
                            size="small"
                            sx={getMedicationRecordStatusSx(row.status)}
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

      <MedicationRecordDetailDialog
        open={isDetailDialogOpen}
        item={detailItem}
        loading={detailLoading}
        error={detailError}
        onClose={handleCloseDetail}
      />
    </>
  );
}

export default function MedicationRecordList() {
  return (
    <MainLayout>
      <Box sx={{ px: 3, py: 3, maxWidth: 1600, mx: "auto" }}>
        <MedicationRecordListSection />
      </Box>
    </MainLayout>
  );
}
