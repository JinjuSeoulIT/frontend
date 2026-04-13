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
import RefreshIcon from "@mui/icons-material/Refresh";
import MedicationRecordDetailDialog from "@/components/medical_support/medicationRecord/MedicationRecordDetailDialog";
import MedicationSearch, {
  type MedicationSearchCriteria,
} from "@/components/medical_support/medicationRecord/MedicationSearch";
import { formatDateTime, safeValue } from "@/components/medical_support/common/ExamDisplay";
import {
  formatMedicationDose,
  formatMedicationRecordProgressStatus,
  getMedicationRecordProgressStatusColor,
  getMedicationRecordProgressStatusSx,
  normalizeMedicationRecordActiveStatus,
  normalizeMedicationRecordProgressStatus,
} from "@/components/medical_support/medicationRecord/medicationRecordDisplay";
import { MedicationRecordActions } from "@/features/medical_support/medicationRecord/medicationRecordSlice";
import type {
  MedicationRecord,
  MedicationRecordSearchParams,
} from "@/features/medical_support/medicationRecord/medicationRecordType";
import type { RootState, AppDispatch } from "@/store/store";

const REQUESTED_STATUSES = ["REQUESTED", "WAITING"];
const IN_PROGRESS_STATUSES = ["IN_PROGRESS"];
const COMPLETED_STATUSES = ["COMPLETED"];

const isInactiveRecord = (item: Pick<MedicationRecord, "status">) =>
  normalizeMedicationRecordActiveStatus(item.status) === "INACTIVE";

const toMedicationRecordSearchParams = (
  criteria: MedicationSearchCriteria
): MedicationRecordSearchParams => {
  if (criteria.searchType === "administeredAt") {
    return {
      startDate: criteria.startDate,
      endDate: criteria.endDate,
    };
  }

  return {
    [criteria.searchType]: criteria.searchValue,
  };
};

export function MedicationRecordListSection() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<MedicationRecord | null>(
    null
  );
  const { list: rows, selected, loading, detailLoading, error, detailError } =
    useSelector((state: RootState) => state.medicationRecords);

  React.useEffect(() => {
    dispatch(MedicationRecordActions.fetchMedicationRecordsRequest());
  }, [dispatch]);

  const baseRows = React.useMemo(
    () =>
      includeInactive ? rows : rows.filter((item) => !isInactiveRecord(item)),
    [includeInactive, rows]
  );

  const visibleRows = baseRows;

  const requestedCount = React.useMemo(
    () =>
      visibleRows.filter((item) =>
        REQUESTED_STATUSES.includes(
          normalizeMedicationRecordProgressStatus(item.progressStatus)
        )
      ).length,
    [visibleRows]
  );

  const inProgressCount = React.useMemo(
    () =>
      visibleRows.filter((item) =>
        IN_PROGRESS_STATUSES.includes(
          normalizeMedicationRecordProgressStatus(item.progressStatus)
        )
      ).length,
    [visibleRows]
  );

  const completedCount = React.useMemo(
    () =>
      visibleRows.filter((item) =>
        COMPLETED_STATUSES.includes(
          normalizeMedicationRecordProgressStatus(item.progressStatus)
        )
      ).length,
    [visibleRows]
  );

  const inactiveCount = React.useMemo(
    () => visibleRows.filter((item) => isInactiveRecord(item)).length,
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

  const handleSearch = (criteria: MedicationSearchCriteria) => {
    dispatch(
      MedicationRecordActions.fetchMedicationRecordsRequest(
        toMedicationRecordSearchParams(criteria)
      )
    );
    setPage(0);
  };

  const handleResetSearch = () => {
    dispatch(MedicationRecordActions.fetchMedicationRecordsRequest());
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
                투약 기록 목록
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                진행 상태 중심으로 투약 기록을 확인하고, 필요한 경우 비활성 데이터도 함께 볼 수 있습니다.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
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
                  dispatch(MedicationRecordActions.fetchMedicationRecordsRequest())
                }
              >
                새로고침
              </Button>
            </Stack>
          </Box>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ mb: 2.5 }}>
            <MedicationSearch
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
                <Table size="small" stickyHeader sx={{ minWidth: 1240 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">번호</TableCell>
                      <TableCell align="center">투약기록 ID</TableCell>
                      <TableCell align="center">환자명</TableCell>
                      <TableCell align="center">진료과</TableCell>
                      <TableCell align="center">간호사명</TableCell>
                      <TableCell align="center">투약일시</TableCell>
                      <TableCell align="center">투약량</TableCell>
                      <TableCell align="center">투약종류</TableCell>
                      <TableCell align="center">진행상태</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          조회된 투약 기록이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : null}

                    {paginatedRows.map((row, index) => {
                      const inactive = isInactiveRecord(row);

                      return (
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
                            {safeValue(row.medicationRecordId)}
                          </TableCell>
                          <TableCell align="center">{safeValue(row.patientName)}</TableCell>
                          <TableCell align="center">
                            {safeValue(row.departmentName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.nurseName)}
                          </TableCell>
                          <TableCell align="center">
                            {formatDateTime(row.administeredAt)}
                          </TableCell>
                          <TableCell align="center">
                            {formatMedicationDose(row.doseNumber, row.doseUnit)}
                          </TableCell>
                          <TableCell align="center">{safeValue(row.doseKind)}</TableCell>
                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.75}
                              justifyContent="center"
                              useFlexGap
                              flexWrap="wrap"
                            >
                              <Chip
                                label={formatMedicationRecordProgressStatus(
                                  row.progressStatus
                                )}
                                color={getMedicationRecordProgressStatusColor(
                                  row.progressStatus
                                )}
                                size="small"
                                sx={getMedicationRecordProgressStatusSx()}
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
