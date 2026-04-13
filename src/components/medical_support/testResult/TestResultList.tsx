"use client";

import * as React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { ChipProps } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { TestResultActions } from "@/features/medical_support/testResult/testResultSlice";
import type {
  TestResult,
  TestResultSearchParams,
} from "@/features/medical_support/testResult/testResultType";
import {
  TEST_RESULT_STATUS_OPTIONS,
  TEST_RESULT_TYPE_OPTIONS,
} from "@/features/medical_support/testResult/testResultType";
import type { AppDispatch, RootState } from "@/store/store";

type TestResultSearchType =
  | "resultType"
  | "patientName"
  | "detailCode"
  | "departmentName"
  | "status"
  | "resultAt";

type TestResultSearchCriteria = {
  searchType: TestResultSearchType;
  searchValue: string;
  startDate: string;
  endDate: string;
};

type SearchControlsProps = {
  initialCriteria: TestResultSearchCriteria;
  loading?: boolean;
  onSearch: (criteria: TestResultSearchCriteria) => void;
  onReset: () => void;
};

const DEFAULT_SEARCH_TYPE: TestResultSearchType = "resultType";

const INITIAL_SEARCH_CRITERIA: TestResultSearchCriteria = {
  searchType: DEFAULT_SEARCH_TYPE,
  searchValue: "",
  startDate: "",
  endDate: "",
};

const LABELS = {
  title: "\uAC80\uC0AC \uACB0\uACFC \uBAA9\uB85D",
  subtitle:
    "\uAC80\uC0AC \uACB0\uACFC\uB97C \uAC80\uC0C9 \uC870\uAC74\uBCC4\uB85C \uC870\uD68C\uD569\uB2C8\uB2E4.",
  searchType: "\uAC80\uC0C9\uAD6C\uBD84",
  resultType: "\uAC80\uC0AC\uC885\uB958",
  resultTypeSelect: "\uAC80\uC0AC\uC885\uB958 \uC120\uD0DD",
  patientName: "\uD658\uC790\uBA85",
  patientNameInput: "\uD658\uC790\uBA85 \uC785\uB825",
  detailCode: "\uC0C1\uC138\uCF54\uB4DC",
  detailCodeInput: "\uC0C1\uC138\uCF54\uB4DC \uC785\uB825",
  departmentName: "\uC9C4\uB8CC\uACFC",
  departmentNameInput: "\uC9C4\uB8CC\uACFC \uC785\uB825",
  status: "\uC0C1\uD0DC",
  statusSelect: "\uC0C1\uD0DC \uC120\uD0DD",
  resultAt: "\uAC80\uC0AC\uC77C\uC2DC",
  startDate: "\uC2DC\uC791\uC77C",
  endDate: "\uC885\uB8CC\uC77C",
  select: "\uC120\uD0DD",
  search: "\uC870\uD68C",
  reset: "\uCD08\uAE30\uD654",
  includeInactive: "\uBE44\uD65C\uC131 \uD3EC\uD568",
  refresh: "\uC0C8\uB85C\uACE0\uCE68",
  total: "\uCD1D",
  active: "\uD65C\uC131",
  inactive: "\uBE44\uD65C\uC131",
  cases: "\uAC74",
  rowNumber: "\uBC88\uD638",
  resultId: "\uACB0\uACFC ID",
  examId: "\uAC80\uC0AC ID",
  testExecutionId: "\uAC80\uC0AC \uC218\uD589 ID",
  performer: "\uAC80\uC0AC\uC218\uD589\uC790\uBA85",
  resultManagerName: "\uAC80\uC0AC\uACB0\uACFC\uAD00\uB9AC\uC790\uBA85",
  summary: "\uACB0\uACFC \uC694\uC57D",
  createdAt: "\uC0DD\uC131\uC77C\uC2DC",
  rowsPerPage: "\uD398\uC774\uC9C0\uB2F9 \uD589",
  empty:
    "\uAC80\uC0C9 \uC870\uAC74\uC5D0 \uB9DE\uB294 \uAC80\uC0AC \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  loading: "\uC870\uD68C \uC911",
  inputRequired:
    "\uAC80\uC0C9\uAC12\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
  resultTypeRequired:
    "\uAC80\uC0AC\uC885\uB958\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.",
  statusRequired: "\uC0C1\uD0DC\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.",
  dateRequired:
    "\uC2DC\uC791\uC77C\uACFC \uC885\uB8CC\uC77C\uC744 \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
  dateOrder:
    "\uC2DC\uC791\uC77C\uC774 \uC885\uB8CC\uC77C\uBCF4\uB2E4 \uB2A6\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
} as const;

const SEARCH_TYPE_OPTIONS: Array<{
  value: TestResultSearchType;
  label: string;
}> = [
  { value: "resultType", label: LABELS.resultType },
  { value: "patientName", label: LABELS.patientName },
  { value: "detailCode", label: LABELS.detailCode },
  { value: "departmentName", label: LABELS.departmentName },
  { value: "status", label: LABELS.status },
  { value: "resultAt", label: LABELS.resultAt },
];

const getInitialSearchCriteria = (
  resultTypeValue?: string | null
): TestResultSearchCriteria => {
  const normalizedResultType = resultTypeValue?.trim().toUpperCase() ?? "";
  const hasSupportedResultType = TEST_RESULT_TYPE_OPTIONS.some(
    (option) => option.value === normalizedResultType
  );

  if (!hasSupportedResultType) {
    return INITIAL_SEARCH_CRITERIA;
  }

  return {
    searchType: "resultType",
    searchValue: normalizedResultType,
    startDate: "",
    endDate: "",
  };
};

const TABLE_HEADERS = [
  LABELS.rowNumber,
  LABELS.resultType,
  LABELS.resultId,
  LABELS.examId,
  LABELS.testExecutionId,
  LABELS.detailCode,
  LABELS.patientName,
  LABELS.departmentName,
  LABELS.performer,
  LABELS.resultManagerName,
  LABELS.resultAt,
  LABELS.status,
  LABELS.summary,
  LABELS.createdAt,
];

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const text = String(value).trim();
  return text || "-";
};

const normalizeValue = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

const isInactiveStatus = (value?: string | null) =>
  normalizeValue(value) === "INACTIVE";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

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

const formatStatus = (value?: string | null) => {
  const normalized = normalizeValue(value);

  if (normalized === "ACTIVE") {
    return LABELS.active;
  }

  if (normalized === "INACTIVE") {
    return LABELS.inactive;
  }

  return safeValue(value);
};

const getStatusColor = (value?: string | null): ChipProps["color"] => {
  const normalized = normalizeValue(value);

  if (normalized === "ACTIVE") {
    return "success";
  }

  if (normalized === "INACTIVE") {
    return "default";
  }

  return "default";
};

const getResultTypeLabel = (item: TestResult) => {
  const displayName = item.resultTypeName?.trim();
  if (displayName) {
    return displayName;
  }

  const resultType = normalizeValue(item.resultType);
  const option = TEST_RESULT_TYPE_OPTIONS.find(
    (typeOption) => typeOption.value === resultType
  );

  return option?.label ?? safeValue(item.resultType);
};

const buildSearchParams = (
  criteria: TestResultSearchCriteria,
  includeInactive: boolean
): TestResultSearchParams | undefined => {
  const params: TestResultSearchParams = {};
  const normalizedValue = criteria.searchValue.trim();

  if (criteria.searchType === "resultAt") {
    if (criteria.startDate && criteria.endDate) {
      params.startDate = criteria.startDate;
      params.endDate = criteria.endDate;
    }
  } else if (normalizedValue) {
    params[criteria.searchType] = normalizedValue;
  }

  const searchesInactive =
    criteria.searchType === "status" && normalizedValue === "INACTIVE";
  if (includeInactive || searchesInactive) {
    params.includeInactive = true;
  }

  return Object.keys(params).length > 0 ? params : undefined;
};

function TestResultSearchControls({
  initialCriteria,
  loading = false,
  onSearch,
  onReset,
}: SearchControlsProps) {
  const [criteria, setCriteria] = React.useState<TestResultSearchCriteria>(
    initialCriteria
  );
  const [searchError, setSearchError] = React.useState("");

  const resetSearchFields = (nextSearchType: TestResultSearchType) => {
    setCriteria({
      searchType: nextSearchType,
      searchValue: "",
      startDate: "",
      endDate: "",
    });
    setSearchError("");
  };

  const updateCriteria = (partial: Partial<TestResultSearchCriteria>) => {
    setCriteria((current) => ({ ...current, ...partial }));
    setSearchError("");
  };

  const handleSearch = () => {
    setSearchError("");

    if (criteria.searchType === "resultAt") {
      if (!criteria.startDate || !criteria.endDate) {
        setSearchError(LABELS.dateRequired);
        return;
      }

      if (criteria.startDate > criteria.endDate) {
        setSearchError(LABELS.dateOrder);
        return;
      }

      onSearch({
        ...criteria,
        searchValue: "",
      });
      return;
    }

    const normalizedValue = criteria.searchValue.trim();
    if (!normalizedValue) {
      if (criteria.searchType === "resultType") {
        setSearchError(LABELS.resultTypeRequired);
      } else if (criteria.searchType === "status") {
        setSearchError(LABELS.statusRequired);
      } else {
        setSearchError(LABELS.inputRequired);
      }
      return;
    }

    onSearch({
      ...criteria,
      searchValue: normalizedValue,
      startDate: "",
      endDate: "",
    });
  };

  const handleReset = () => {
    setCriteria(INITIAL_SEARCH_CRITERIA);
    setSearchError("");
    onReset();
  };

  const textLabel =
    criteria.searchType === "patientName"
      ? LABELS.patientNameInput
      : criteria.searchType === "detailCode"
        ? LABELS.detailCodeInput
        : LABELS.departmentNameInput;

  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="test-result-search-type-label">
            {LABELS.searchType}
          </InputLabel>
          <Select
            labelId="test-result-search-type-label"
            label={LABELS.searchType}
            value={criteria.searchType}
            onChange={(event) =>
              resetSearchFields(event.target.value as TestResultSearchType)
            }
          >
            {SEARCH_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {criteria.searchType === "resultAt" ? (
          <>
            <TextField
              size="small"
              type="date"
              label={LABELS.startDate}
              value={criteria.startDate}
              onChange={(event) =>
                updateCriteria({ startDate: event.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label={LABELS.endDate}
              value={criteria.endDate}
              onChange={(event) =>
                updateCriteria({ endDate: event.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </>
        ) : criteria.searchType === "resultType" ? (
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="test-result-type-label">
              {LABELS.resultTypeSelect}
            </InputLabel>
            <Select
              labelId="test-result-type-label"
              label={LABELS.resultTypeSelect}
              value={criteria.searchValue}
              onChange={(event) =>
                updateCriteria({ searchValue: String(event.target.value) })
              }
            >
              <MenuItem value="">{LABELS.select}</MenuItem>
              {TEST_RESULT_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label} ({option.value})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : criteria.searchType === "status" ? (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="test-result-status-label">
              {LABELS.statusSelect}
            </InputLabel>
            <Select
              labelId="test-result-status-label"
              label={LABELS.statusSelect}
              value={criteria.searchValue}
              onChange={(event) =>
                updateCriteria({ searchValue: String(event.target.value) })
              }
            >
              <MenuItem value="">{LABELS.select}</MenuItem>
              {TEST_RESULT_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            size="small"
            label={textLabel}
            value={criteria.searchValue}
            onChange={(event) =>
              updateCriteria({ searchValue: event.target.value })
            }
          />
        )}

        <Button
          variant="outlined"
          size="small"
          onClick={handleSearch}
          disabled={loading}
        >
          {LABELS.search}
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={handleReset}
          disabled={loading}
        >
          {LABELS.reset}
        </Button>
      </Box>

      {searchError ? <Alert severity="error">{searchError}</Alert> : null}
    </Stack>
  );
}

export default function TestResultList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryInitialSearchCriteria = React.useMemo(
    () => getInitialSearchCriteria(searchParams.get("resultType")),
    [searchParams]
  );
  const queryInitialIncludeInactive = React.useMemo(
    () => searchParams.get("includeInactive") === "true",
    [searchParams]
  );
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [includeInactive, setIncludeInactive] = React.useState(
    queryInitialIncludeInactive
  );
  const [searchCriteria, setSearchCriteria] =
    React.useState<TestResultSearchCriteria>(() => queryInitialSearchCriteria);
  const initialSearchCriteriaRef = React.useRef(queryInitialSearchCriteria);
  const initialIncludeInactiveRef = React.useRef(queryInitialIncludeInactive);

  const { list: rows, loading, error } = useSelector(
    (state: RootState) => state.testResults
  );

  const fetchRows = React.useCallback(
    (criteria: TestResultSearchCriteria, nextIncludeInactive: boolean) => {
      dispatch(
        TestResultActions.fetchTestResultsRequest(
          buildSearchParams(criteria, nextIncludeInactive)
        )
      );
    },
    [dispatch]
  );

  React.useEffect(() => {
    fetchRows(
      initialSearchCriteriaRef.current,
      initialIncludeInactiveRef.current
    );
  }, [fetchRows]);

  const activeCount = React.useMemo(
    () => rows.filter((row) => !isInactiveStatus(row.status)).length,
    [rows]
  );
  const inactiveCount = React.useMemo(
    () => rows.filter((row) => isInactiveStatus(row.status)).length,
    [rows]
  );
  const isSpecimenResultView =
    searchCriteria.searchType === "resultType" &&
    normalizeValue(searchCriteria.searchValue) === "SPECIMEN";
  const isImagingResultView =
    searchCriteria.searchType === "resultType" &&
    normalizeValue(searchCriteria.searchValue) === "IMAGING";
  const isEndoscopyResultView =
    searchCriteria.searchType === "resultType" &&
    normalizeValue(searchCriteria.searchValue) === "ENDOSCOPY";
  const isPathologyResultView =
    searchCriteria.searchType === "resultType" &&
    normalizeValue(searchCriteria.searchValue) === "PATHOLOGY";
  const isPhysiologicalResultView =
    searchCriteria.searchType === "resultType" &&
    normalizeValue(searchCriteria.searchValue) === "PHYSIOLOGICAL";
  const hideSummaryColumn =
    isSpecimenResultView ||
    isImagingResultView ||
    isEndoscopyResultView ||
    isPathologyResultView ||
    isPhysiologicalResultView;
  const tableHeaders = React.useMemo(
    () =>
      TABLE_HEADERS.filter((header) => {
        if (isSpecimenResultView && header === LABELS.resultAt) {
          return false;
        }

        if (hideSummaryColumn && header === LABELS.summary) {
          return false;
        }

        return true;
      }),
    [hideSummaryColumn, isSpecimenResultView]
  );
  const tableMinWidth = isSpecimenResultView
    ? 1300
    : hideSummaryColumn
      ? 1420
      : 1540;

  const inactiveStatusSearch =
    searchCriteria.searchType === "status" &&
    searchCriteria.searchValue === "INACTIVE";
  const includeInactiveChecked = includeInactive || inactiveStatusSearch;

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

  const handleSearch = (criteria: TestResultSearchCriteria) => {
    const shouldForceInactive =
      criteria.searchType === "status" && criteria.searchValue === "INACTIVE";

    setSearchCriteria(criteria);
    if (shouldForceInactive) {
      setIncludeInactive(true);
    }
    setPage(0);
    fetchRows(criteria, includeInactive || shouldForceInactive);
  };

  const handleResetSearch = () => {
    setSearchCriteria(INITIAL_SEARCH_CRITERIA);
    setPage(0);
    fetchRows(INITIAL_SEARCH_CRITERIA, includeInactive);
  };

  const handleRefresh = () => {
    fetchRows(searchCriteria, includeInactiveChecked);
  };

  const handleIncludeInactiveChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextIncludeInactive = event.target.checked;
    setIncludeInactive(nextIncludeInactive);
    setPage(0);
    fetchRows(searchCriteria, nextIncludeInactive);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const navigateToDetail = React.useCallback(
    (row: TestResult) => {
      const resultId = String(row.resultId ?? "").trim();
      const resultType = normalizeValue(row.resultType);

      if (!resultId || !resultType) {
        return;
      }

      router.push(
        `/medical_support/testResult/detail/${encodeURIComponent(
          resultId
        )}?resultType=${encodeURIComponent(resultType)}`
      );
    },
    [router]
  );

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    row: TestResult
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    navigateToDetail(row);
  };

  return (
    <Box sx={{ px: 3, py: 3, maxWidth: 1500, mx: "auto" }}>
      <Card
        elevation={2}
        sx={{
          borderRadius: 1,
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
                {LABELS.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {LABELS.subtitle}
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
                    checked={includeInactiveChecked}
                    disabled={inactiveStatusSearch || loading}
                    onChange={handleIncludeInactiveChange}
                  />
                }
                label={LABELS.includeInactive}
                sx={{ mr: 0.5 }}
              />
              <Chip label={`${LABELS.total} ${rows.length}${LABELS.cases}`} size="small" />
              <Chip
                label={`${LABELS.active} ${activeCount}${LABELS.cases}`}
                size="small"
                color="success"
                variant="outlined"
              />
              {includeInactiveChecked ? (
                <Chip
                  label={`${LABELS.inactive} ${inactiveCount}${LABELS.cases}`}
                  size="small"
                  variant="outlined"
                />
              ) : null}
              {loading ? <Chip label={LABELS.loading} size="small" /> : null}
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                {LABELS.refresh}
              </Button>
            </Stack>
          </Box>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ mb: 2.5 }}>
            <TestResultSearchControls
              initialCriteria={queryInitialSearchCriteria}
              loading={loading}
              onSearch={handleSearch}
              onReset={handleResetSearch}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {!loading && !error ? (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
                overflow: "hidden",
              }}
            >
              <TableContainer>
                <Table
                  size="small"
                  stickyHeader
                  sx={{ minWidth: tableMinWidth }}
                >
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((header) => (
                        <TableCell
                          key={header}
                          align="center"
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={tableHeaders.length}
                          align="center"
                          sx={{ py: 5 }}
                        >
                          {LABELS.empty}
                        </TableCell>
                      </TableRow>
                    ) : null}

                    {paginatedRows.map((row, index) => {
                      const inactive = isInactiveStatus(row.status);
                      const specimenRow =
                        normalizeValue(row.resultType) === "SPECIMEN";
                      const imagingRow =
                        normalizeValue(row.resultType) === "IMAGING";
                      const endoscopyRow =
                        normalizeValue(row.resultType) === "ENDOSCOPY";
                      const pathologyRow =
                        normalizeValue(row.resultType) === "PATHOLOGY";
                      const physiologicalRow =
                        normalizeValue(row.resultType) === "PHYSIOLOGICAL";
                      const canOpenDetail = Boolean(
                        String(row.resultId ?? "").trim() &&
                          normalizeValue(row.resultType)
                      );

                      return (
                        <TableRow
                          key={`${safeValue(row.resultType)}-${safeValue(
                            row.resultId
                          )}-${currentPage * rowsPerPage + index}`}
                          hover
                          role={canOpenDetail ? "button" : undefined}
                          tabIndex={canOpenDetail ? 0 : undefined}
                          onClick={
                            canOpenDetail ? () => navigateToDetail(row) : undefined
                          }
                          onKeyDown={
                            canOpenDetail
                              ? (event) => handleRowKeyDown(event, row)
                              : undefined
                          }
                          sx={{
                            cursor: canOpenDetail ? "pointer" : "default",
                            backgroundColor: inactive ? "#fcfcfc" : undefined,
                            "&:hover": {
                              backgroundColor: inactive ? "#f4f6f8" : "#f9fbff",
                            },
                            "& td": {
                              py: 1.25,
                              whiteSpace: "nowrap",
                              color: inactive ? "text.secondary" : undefined,
                            },
                          }}
                        >
                          <TableCell align="center">
                            {currentPage * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell align="center">
                            {getResultTypeLabel(row)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.resultId)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.examId)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.testExecutionId)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.detailCode)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.patientName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.departmentName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.performerName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.resultManagerName)}
                          </TableCell>
                          {!isSpecimenResultView ? (
                            <TableCell align="center">
                              {specimenRow ? "-" : formatDateTime(row.resultAt)}
                            </TableCell>
                          ) : null}
                          <TableCell align="center">
                            <Chip
                              label={formatStatus(row.status)}
                              color={getStatusColor(row.status)}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                ...(inactive
                                  ? {
                                      backgroundColor: "#eeeeee",
                                      color: "#757575",
                                    }
                                  : {}),
                              }}
                            />
                          </TableCell>
                          {!hideSummaryColumn ? (
                            <TableCell
                              align="left"
                              sx={{
                                maxWidth: 320,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {specimenRow ||
                              imagingRow ||
                              endoscopyRow ||
                              pathologyRow ||
                              physiologicalRow
                                ? "-"
                                : safeValue(row.summary)}
                            </TableCell>
                          ) : null}
                          <TableCell align="center">
                            {formatDateTime(row.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                labelRowsPerPage={LABELS.rowsPerPage}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} / ${LABELS.total} ${count}`
                }
              />
            </Paper>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}
