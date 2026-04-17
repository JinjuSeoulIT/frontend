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
import { TestExecutionActions } from "@/features/medical_support/testExecution/testExecutionSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import TestExecutionSearch, {
  type TestExecutionSearchCriteria,
} from "./TestExecutionSearch";

const ACTIVE_STATUSES = ["IN_PROGRESS"];
const DEFAULT_VISIBLE_STATUSES = ["WAITING", "IN_PROGRESS"] as const;

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

const normalizeActiveStatus = (value?: string | null) =>
  value?.trim().toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";

const isInactiveExecution = (value?: { status?: string | null } | null) =>
  normalizeActiveStatus(value?.status) === "INACTIVE";

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
): "default" | "info" | "success" | "warning" => {
  const normalized = normalizeStatus(status);

  if (normalized === "WAITING") return "warning";
  if (normalized === "COMPLETED") return "success";
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
  "검사유형",
  "검사코드",
  "환자명",
  "진료과",
  "검사수행 ID",
  "생성일시",
  "진행상태",
];

const INITIAL_SEARCH_CRITERIA: TestExecutionSearchCriteria = {
  searchType: "executionType",
  searchValue: "",
  startDate: "",
  endDate: "",
};

const normalizeText = (value?: string | number | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getDateOnlyValue = (value?: string | null) => {
  const normalized = value?.trim();
  if (!normalized) return "";

  const directMatch = normalized.match(/^\d{4}-\d{2}-\d{2}/);
  if (directMatch) {
    return directMatch[0];
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function TestExecutionList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<TestExecutionSearchCriteria>(
    INITIAL_SEARCH_CRITERIA
  );

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.testexecutions
  );

  useEffect(() => {
    dispatch(TestExecutionActions.fetchTestExecutionsRequest(undefined));
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    const hasExplicitProgressStatusSearch =
      searchCriteria.searchType === "progressStatus" &&
      Boolean(searchCriteria.searchValue.trim());

    return items.filter((item) => {
      const normalizedItemStatus = normalizeStatus(item.progressStatus);

      if (
        !hasExplicitProgressStatusSearch &&
        !DEFAULT_VISIBLE_STATUSES.includes(
          normalizedItemStatus as (typeof DEFAULT_VISIBLE_STATUSES)[number]
        )
      ) {
        return false;
      }

      if (!includeInactive && isInactiveExecution(item)) {
        return false;
      }

      if (searchCriteria.searchType === "createdAt") {
        if (!searchCriteria.startDate && !searchCriteria.endDate) {
          return true;
        }

        const createdDate = getDateOnlyValue(item.createdAt);
        if (!createdDate) {
          return false;
        }

        return (
          createdDate >= searchCriteria.startDate &&
          createdDate <= searchCriteria.endDate
        );
      }

      const normalizedValue = searchCriteria.searchValue.trim();
      if (!normalizedValue) {
        return true;
      }

      if (searchCriteria.searchType === "executionType") {
        return (
          String(item.executionType ?? "").trim().toUpperCase() === normalizedValue
        );
      }

      if (searchCriteria.searchType === "progressStatus") {
        return normalizedItemStatus === normalizedValue;
      }

      return normalizeText(item.patientName).includes(
        normalizedValue.toLowerCase()
      );
    });
  }, [includeInactive, items, searchCriteria]);

  const waitingCount = useMemo(
    () =>
      filteredItems.filter(
        (item) => normalizeStatus(item.progressStatus) === "WAITING"
      ).length,
    [filteredItems]
  );

  const inProgressCount = useMemo(
    () =>
      filteredItems.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeStatus(item.progressStatus))
      ).length,
    [filteredItems]
  );

  const inactiveCount = useMemo(
    () => filteredItems.filter((item) => isInactiveExecution(item)).length,
    [filteredItems]
  );

  const maxPage = Math.max(0, Math.ceil(filteredItems.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedItems = useMemo(
    () =>
      filteredItems.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, filteredItems, rowsPerPage]
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
                검사 시작 전 대기중이거나 검사중인 작업을 확인하는 업무 목록입니다.
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
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
              <Chip label={`총 ${filteredItems.length}건`} size="small" />
              <Chip
                label={`대기 ${waitingCount}건`}
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
              {includeInactive && inactiveCount > 0 ? (
                <Chip label={`비활성 ${inactiveCount}건`} size="small" variant="outlined" />
              ) : null}
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
            <TestExecutionSearch
              loading={loading}
              onSearch={(criteria) => {
                setSearchCriteria(criteria);
                setPage(0);
              }}
              onReset={() => {
                setSearchCriteria(INITIAL_SEARCH_CRITERIA);
                setPage(0);
              }}
            />
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
                <Table size="small" stickyHeader sx={{ minWidth: 1080 }}>
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
                    {filteredItems.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={TABLE_HEADERS.length}
                          align="center"
                          sx={{ py: 5 }}
                        >
                          검색 조건에 맞는 검사 수행 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}

                    {paginatedItems.map((item, index) => {
                      const inactive = isInactiveExecution(item);

                      return (
                        <TableRow
                          key={String(item.testExecutionId)}
                          hover
                          sx={{
                            cursor: "pointer",
                            backgroundColor: inactive ? "#fcfcfc" : undefined,
                            "& td": {
                              py: 1.25,
                              whiteSpace: "nowrap",
                              color: inactive ? "text.secondary" : undefined,
                            },
                            "&:hover": {
                              backgroundColor: inactive ? "#f4f6f8" : "#f9fbff",
                            },
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
                            {safeValue(item.executionType)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.detailCode)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.patientName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.departmentName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(item.testExecutionId)}
                          </TableCell>
                          <TableCell align="center">
                            {formatDateTime(item.createdAt)}
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 0.75,
                                flexWrap: "wrap",
                              }}
                            >
                              <Chip
                                label={formatProgressStatusLabel(item.progressStatus)}
                                color={getStatusColor(item.progressStatus)}
                                size="small"
                                sx={getStatusSx(item.progressStatus)}
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
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredItems.length}
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
