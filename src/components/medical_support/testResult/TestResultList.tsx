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
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ListSearchBar, {
  useListSearchCriteria,
  type ListSearchFieldConfig,
} from "@/components/medical_support/common/ListSearchBar";
import { TestResultActions } from "@/features/medical_support/testResult/testResultSlice";
import type {
  TestResult,
  TestResultSearchParams,
} from "@/features/medical_support/testResult/testResultType";
import { TEST_RESULT_TYPE_OPTIONS } from "@/features/medical_support/testResult/testResultType";
import { toDateOnlySearchParam } from "@/lib/medical_support/searchParams";
import type { AppDispatch, RootState } from "@/store/store";

const getTrimmedValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const LABELS = {
  title: "\uAC80\uC0AC \uACB0\uACFC \uBAA9\uB85D",
  subtitle:
    "\uD1B5\uD569 \uAC80\uC0AC \uACB0\uACFC\uB97C \uBAA9\uB85D\uC73C\uB85C \uD655\uC778\uD558\uACE0 \uC0C1\uC138 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.",
  resultType: "\uAC80\uC0AC\uC720\uD615",
  resultId: "\uACB0\uACFC ID",
  detailCode: "\uAC80\uC0AC\uCF54\uB4DC",
  patientName: "\uD658\uC790\uBA85",
  departmentName: "\uC9C4\uB8CC\uACFC",
  performer: "\uAC80\uC0AC\uC218\uD589\uC790",
  status: "\uC0C1\uD0DC",
  progressStatus: "\uC9C4\uD589\uC0C1\uD0DC",
  resultAt: "\uACB0\uACFC\uB4F1\uB85D\uC77C\uC2DC",
  includeInactive: "\uBE44\uD65C\uC131 \uD3EC\uD568",
  refresh: "\uC0C8\uB85C\uACE0\uCE68",
  total: "\uCD1D",
  active: "\uD65C\uC131",
  inactive: "\uBE44\uD65C\uC131",
  cases: "\uAC74",
  rowNumber: "\uBC88\uD638",
  rowsPerPage: "\uD398\uC774\uC9C0\uB2F9 \uD589",
  empty: "\uC870\uD68C\uB41C \uAC80\uC0AC \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  loading: "\uC870\uD68C \uC911",
} as const;

const getInitialResultType = (resultTypeValue?: string | null) => {
  const normalizedResultType = resultTypeValue?.trim().toUpperCase() ?? "";
  const hasSupportedResultType = TEST_RESULT_TYPE_OPTIONS.some(
    (option) => option.value === normalizedResultType
  );

  return hasSupportedResultType ? normalizedResultType : "";
};

const TABLE_HEADERS = [
  LABELS.rowNumber,
  LABELS.resultType,
  LABELS.resultId,
  LABELS.detailCode,
  LABELS.patientName,
  LABELS.departmentName,
  LABELS.performer,
  LABELS.progressStatus,
  LABELS.resultAt,
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

const formatProgressStatus = (value?: string | null) => {
  const normalized = normalizeValue(value);
  if (normalized === "COMPLETED") {
    return "\uACB0\uACFC\uC791\uC131\uC644\uB8CC";
  }
  return "\uACB0\uACFC\uC791\uC131\uC911";
};

const getProgressStatusColor = (value?: string | null) =>
  normalizeValue(value) === "COMPLETED" ? "success" : "warning";

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

const formatNameWithId = (
  name?: string | null,
  id?: string | number | null
) => {
  const displayName = safeValue(name);
  const displayId = safeValue(id);

  if (displayName !== "-" && displayId !== "-") {
    return `${displayName} (${displayId})`;
  }

  return displayName !== "-" ? displayName : displayId;
};

export default function TestResultList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryInitialResultType = React.useMemo(
    () => getInitialResultType(searchParams.get("resultType")),
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
  const initialSearchCriteria = React.useMemo(
    () => ({
      resultType: queryInitialResultType,
      resultId: "",
      patientName: "",
      departmentName: "",
      startDate: null,
      endDate: null,
    }),
    [queryInitialResultType]
  );
  const [appliedSearchParams, setAppliedSearchParams] = React.useState<
    TestResultSearchParams | undefined
  >(undefined);

  const { list: rows, loading, error } = useSelector(
    (state: RootState) => state.testResults
  );
  const {
    criteria,
    selectedFieldKey,
    setCriterion,
    selectField,
    resetCriteria,
  } = useListSearchCriteria("resultType", initialSearchCriteria);

  const baseSearchParams = React.useMemo<TestResultSearchParams | undefined>(() => {
    if (!queryInitialResultType) {
      return undefined;
    }

    return {
      resultType: queryInitialResultType,
    };
  }, [queryInitialResultType]);

  const fetchRows = React.useCallback(
    (
      nextIncludeInactive: boolean,
      nextSearchParams?: TestResultSearchParams
    ) => {
      const requestParams = {
        ...(nextSearchParams ?? baseSearchParams ?? {}),
        ...(nextIncludeInactive ? { includeInactive: true } : {}),
      };

      dispatch(
        TestResultActions.fetchTestResultsRequest(
          Object.keys(requestParams).length > 0 ? requestParams : undefined
        )
      );
    },
    [baseSearchParams, dispatch]
  );

  React.useEffect(() => {
    setIncludeInactive(queryInitialIncludeInactive);
  }, [queryInitialIncludeInactive]);

  React.useEffect(() => {
    setAppliedSearchParams(baseSearchParams);
    setPage(0);
    fetchRows(queryInitialIncludeInactive, baseSearchParams);
  }, [baseSearchParams, fetchRows, queryInitialIncludeInactive]);

  const activeCount = React.useMemo(
    () => rows.filter((row) => !isInactiveStatus(row.status)).length,
    [rows]
  );
  const inactiveCount = React.useMemo(
    () => rows.filter((row) => isInactiveStatus(row.status)).length,
    [rows]
  );
  const includeInactiveChecked = includeInactive;

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

  const searchFields = React.useMemo<ListSearchFieldConfig[]>(
    () => [
      {
        key: "resultType",
        label: "검사유형",
        type: "select",
        options: TEST_RESULT_TYPE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      },
      {
        key: "resultId",
        label: "결과 ID",
        type: "text",
      },
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
        key: "resultAtRange",
        label: "결과등록일시",
        type: "dateTimeRange",
        startKey: "startDate",
        endKey: "endDate",
        startLabel: "시작일",
        endLabel: "종료일",
      },
    ],
    []
  );

  const handleRefresh = () => {
    fetchRows(includeInactiveChecked, appliedSearchParams);
  };

  const buildSearchParams = React.useCallback((): TestResultSearchParams | undefined => {
    const nextSearchParams: TestResultSearchParams = {};
    const resultType = getTrimmedValue(criteria.resultType) || queryInitialResultType;

    if (resultType) {
      nextSearchParams.resultType = resultType;
    }

    switch (selectedFieldKey) {
      case "resultType": {
        if (resultType) {
          nextSearchParams.resultType = resultType;
        }
        break;
      }
      case "resultId": {
        const resultId = getTrimmedValue(criteria.resultId);
        if (resultId) {
          nextSearchParams.resultId = resultId;
        }
        break;
      }
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
      case "resultAtRange": {
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
  }, [criteria, queryInitialResultType, selectedFieldKey]);

  const handleSearch = () => {
    const nextSearchParams = buildSearchParams();
    setAppliedSearchParams(nextSearchParams);
    setPage(0);
    fetchRows(includeInactiveChecked, nextSearchParams);
  };

  const handleIncludeInactiveChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextIncludeInactive = event.target.checked;
    setIncludeInactive(nextIncludeInactive);
    setPage(0);
    fetchRows(nextIncludeInactive, appliedSearchParams);
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

  const handleResetSearch = () => {
    resetCriteria();
    setAppliedSearchParams(baseSearchParams);
    setIncludeInactive(queryInitialIncludeInactive);
    setPage(0);
    fetchRows(queryInitialIncludeInactive, baseSearchParams);
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
                    disabled={loading}
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
                  sx={{ minWidth: 1120 }}
                >
                  <TableHead>
                    <TableRow>
                      {TABLE_HEADERS.map((header) => (
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
                          colSpan={TABLE_HEADERS.length}
                          align="center"
                          sx={{ py: 5 }}
                        >
                          {LABELS.empty}
                        </TableCell>
                      </TableRow>
                    ) : null}

                    {paginatedRows.map((row, index) => {
                      const inactive = isInactiveStatus(row.status);
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
                            {safeValue(row.detailCode)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.patientName)}
                          </TableCell>
                          <TableCell align="center">
                            {safeValue(row.departmentName)}
                          </TableCell>
                          <TableCell align="center">
                            {formatNameWithId(row.performerName, row.performerId)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={formatProgressStatus(row.progressStatus)}
                              color={getProgressStatusColor(row.progressStatus)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {formatDateTime(row.resultAt)}
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
