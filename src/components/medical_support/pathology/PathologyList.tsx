"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ListSearchBar, {
  EXAM_PROGRESS_STATUS_FILTER_OPTIONS,
  buildDistinctSelectOptions,
  useListSearchCriteria,
  type ListSearchFieldConfig,
} from "@/components/medical_support/common/ListSearchBar";
import {
  formatProgressStatus,
  getProgressStatusColor,
  normalizeActiveStatus,
  normalizeProgressStatus,
  safeValue,
} from "@/components/medical_support/common/ExamDisplay";
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
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PathologyActions } from "@/features/medical_support/pathology/pathologySlice";
import type { PathologySearchParams } from "@/features/medical_support/pathology/pathologyType";
import { toDateOnlySearchParam } from "@/lib/medical_support/searchParams";
import type { RootState, AppDispatch } from "@/store/store";

const getTrimmedValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export default function PathologyList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const initialSearchCriteria = React.useMemo(
    () => ({
      patientName: "",
      departmentName: "",
      tissueStatus: "",
      progressStatus: "",
      startDate: null,
      endDate: null,
    }),
    []
  );
  const [appliedSearchParams, setAppliedSearchParams] = React.useState<
    PathologySearchParams | undefined
  >(undefined);

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.pathologies
  );
  const {
    criteria,
    selectedFieldKey,
    setCriterion,
    selectField,
    resetCriteria,
  } = useListSearchCriteria("patientName", initialSearchCriteria);

  React.useEffect(() => {
    dispatch(PathologyActions.fetchPathologiesRequest());
  }, [dispatch]);

  const nonCancelledItems = React.useMemo(
    () =>
      items.filter(
        (item) => normalizeProgressStatus(item.progressStatus) !== "CANCELLED"
      ),
    [items]
  );

  const visibleItems = React.useMemo(
    () =>
      includeInactive
        ? nonCancelledItems
        : nonCancelledItems.filter(
            (item) => normalizeActiveStatus(item.status) !== "INACTIVE"
          ),
    [includeInactive, nonCancelledItems]
  );

  const cancelledCount = React.useMemo(
    () =>
      items.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "CANCELLED"
      ).length,
    [items]
  );

  const waitingCount = React.useMemo(
    () =>
      visibleItems.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "WAITING"
      ).length,
    [visibleItems]
  );

  const inProgressCount = React.useMemo(
    () =>
      visibleItems.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "IN_PROGRESS"
      ).length,
    [visibleItems]
  );

  const completedCount = React.useMemo(
    () =>
      visibleItems.filter(
        (item) => normalizeProgressStatus(item.progressStatus) === "COMPLETED"
      ).length,
    [visibleItems]
  );

  const inactiveCount = React.useMemo(
    () =>
      visibleItems.filter(
        (item) => normalizeActiveStatus(item.status) === "INACTIVE"
      ).length,
    [visibleItems]
  );

  const maxPage = Math.max(0, Math.ceil(visibleItems.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedItems = React.useMemo(
    () =>
      visibleItems.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, visibleItems, rowsPerPage]
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

  const tissueStatusOptions = React.useMemo(
    () => buildDistinctSelectOptions(items.map((item) => item.tissueStatus)),
    [items]
  );

  const searchFields = React.useMemo<ListSearchFieldConfig[]>(
    () => [
      {
        key: "patientName",
        label: "환자명",
        type: "text",
      },
      {
        key: "departmentName",
        label: "진료과",
        type: "select",
        optionsSource: "departments",
      },
      {
        key: "tissueStatus",
        label: "조직 상태",
        type: "select",
        options: tissueStatusOptions,
      },
      {
        key: "progressStatus",
        label: "진행상태",
        type: "select",
        options: EXAM_PROGRESS_STATUS_FILTER_OPTIONS,
      },
      {
        key: "collectedAtRange",
        label: "채취일시",
        type: "dateTimeRange",
        startKey: "startDate",
        endKey: "endDate",
        startLabel: "시작일",
        endLabel: "종료일",
      },
    ],
    [tissueStatusOptions]
  );

  const handleRefresh = () => {
    dispatch(PathologyActions.fetchPathologiesRequest(appliedSearchParams));
  };

  const buildSearchParams = React.useCallback((): PathologySearchParams | undefined => {
    const nextSearchParams: PathologySearchParams = {};

    switch (selectedFieldKey) {
      case "patientName": {
        const patientName = getTrimmedValue(criteria.patientName);
        if (patientName) {
          nextSearchParams.patientName = patientName;
        }
        break;
      }
      case "departmentName": {
        const departmentName = getTrimmedValue(criteria.departmentName);
        if (departmentName) {
          nextSearchParams.departmentName = departmentName;
        }
        break;
      }
      case "tissueStatus": {
        const tissueStatus = getTrimmedValue(criteria.tissueStatus);
        if (tissueStatus) {
          nextSearchParams.tissueStatus = tissueStatus;
        }
        break;
      }
      case "progressStatus": {
        const progressStatus = getTrimmedValue(criteria.progressStatus);
        if (progressStatus) {
          nextSearchParams.progressStatus = progressStatus;
        }
        break;
      }
      case "collectedAtRange": {
        const startDate = toDateOnlySearchParam(criteria.startDate);
        const endDate = toDateOnlySearchParam(criteria.endDate);
        if (startDate && endDate) {
          nextSearchParams.startDate = startDate;
          nextSearchParams.endDate = endDate;
        }
        break;
      }
      default:
        break;
    }

    return Object.keys(nextSearchParams).length > 0 ? nextSearchParams : undefined;
  }, [criteria, selectedFieldKey]);

  const handleSearch = () => {
    const nextSearchParams = buildSearchParams();
    setAppliedSearchParams(nextSearchParams);
    setPage(0);
    dispatch(PathologyActions.fetchPathologiesRequest(nextSearchParams));
  };

  const handleResetSearch = () => {
    resetCriteria();
    setAppliedSearchParams(undefined);
    setIncludeInactive(false);
    setPage(0);
    dispatch(PathologyActions.fetchPathologiesRequest());
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
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="center"
            >
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  병리 검사 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  병리 검사 목록을 조회하고 항목을 선택하면 수정 화면으로 바로 이동합니다.
                </Typography>
              </Stack>

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
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  새로고침
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip label={`전체 ${visibleItems.length}`} color="primary" />
          <Chip label={`대기 ${waitingCount}`} color="warning" variant="outlined" />
          <Chip
            label={`진행 중 ${inProgressCount}`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`완료 ${completedCount}`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`취소 ${cancelledCount}`}
            color="error"
            variant="outlined"
          />
          {loading && <Chip label="불러오는 중" variant="outlined" />}
          {error && <Chip label={`오류: ${error}`} color="error" />}
          {includeInactive && inactiveCount > 0 ? (
            <Chip label={`비활성 ${inactiveCount}`} variant="outlined" />
          ) : null}
        </Stack>

        <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
          <CardContent sx={{ p: 2.5 }}>
            <ListSearchBar
              fields={searchFields}
              selectedFieldKey={selectedFieldKey}
              criteria={criteria}
              onSelectedFieldKeyChange={selectField}
              onCriteriaChange={setCriterion}
              onSearch={handleSearch}
              onReset={handleResetSearch}
              loading={loading}
            />

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ScienceOutlinedIcon sx={{ color: "var(--brand)" }} />
                <Typography fontWeight={800}>병리 검사 목록</Typography>
              </Stack>
              <Chip label={`표시 ${visibleItems.length}`} size="small" />
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
                <TableContainer>
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
                        <TableCell align="center">환자명</TableCell>
                        <TableCell align="center">진료과</TableCell>
                        <TableCell align="center">검사코드</TableCell>
                        <TableCell align="center">조직 상태</TableCell>
                        <TableCell align="center">채취 일시</TableCell>
                        <TableCell align="center">진행상태</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                            표시할 병리 검사 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}

                      {paginatedItems.map((item, index) => {
                        const inactive =
                          normalizeActiveStatus(item.status) === "INACTIVE";

                        return (
                          <TableRow
                            key={String(item.pathologyExamId)}
                            hover
                            onClick={() =>
                              router.push(
                                `/medical_support/pathology/edit/${item.pathologyExamId}`
                              )
                            }
                            sx={{
                              cursor: "pointer",
                              backgroundColor: inactive ? "#fcfcfc" : undefined,
                              "&:hover": {
                                backgroundColor: inactive ? "#f4f6f8" : "#f9fbff",
                              },
                              "& td": {
                                color: inactive ? "text.secondary" : undefined,
                              },
                            }}
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
                              {safeValue(item.detailCode)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.tissueStatus)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.collectedAt)}
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
                                  label={formatProgressStatus(item.progressStatus)}
                                  color={getProgressStatusColor(item.progressStatus)}
                                  size="small"
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
                  count={visibleItems.length}
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
      </Stack>
    </MainLayout>
  );
}
