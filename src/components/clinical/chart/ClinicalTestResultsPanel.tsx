"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";
import type { TestResult } from "@/features/medical_support/testResult/testResultType";
import { TEST_RESULT_TYPE_OPTIONS } from "@/features/medical_support/testResult/testResultType";
import { fetchTestResultsApi } from "@/lib/medical_support/testResultApi";

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }
  const text = String(value).trim();
  return text || "-";
};

const normalizeValue = (value?: string | null) => value?.trim().toUpperCase() ?? "";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);
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
  const option = TEST_RESULT_TYPE_OPTIONS.find((typeOption) => typeOption.value === resultType);
  return option?.label ?? safeValue(item.resultType);
};

const formatProgressStatus = (value?: string | null) => {
  const normalized = normalizeValue(value);
  if (normalized === "COMPLETED") {
    return "결과작성완료";
  }
  return "결과작성중";
};

const getProgressStatusColor = (value?: string | null) =>
  normalizeValue(value) === "COMPLETED" ? "success" : "warning";

const isRevisedResult = (value?: boolean | null) => value === true;

const formatNameWithId = (name?: string | null, id?: string | number | null) => {
  const displayName = safeValue(name);
  const displayId = safeValue(id);
  if (displayName !== "-" && displayId !== "-") {
    return `${displayName} (${displayId})`;
  }
  return displayName !== "-" ? displayName : displayId;
};

function canOpenDetail(row: TestResult) {
  return Boolean(String(row.resultId ?? "").trim() && normalizeValue(row.resultType));
}

function detailPath(
  row: TestResult,
  returnCtx: { patientId: number; receptionId: number } | null
) {
  const resultId = String(row.resultId ?? "").trim();
  const resultType = normalizeValue(row.resultType);
  const q = new URLSearchParams();
  q.set("resultType", resultType);
  q.set("viewOnly", "1");
  if (returnCtx != null && Number.isFinite(returnCtx.patientId)) {
    q.set("returnPatientId", String(returnCtx.patientId));
    if (Number.isFinite(returnCtx.receptionId)) {
      q.set("returnReceptionId", String(returnCtx.receptionId));
    }
  }
  return `/medical_support/testResult/detail/${encodeURIComponent(resultId)}?${q.toString()}`;
}

export function ClinicalTestResultsPanel({
  open,
  patient,
  returnPatientId,
  returnReceptionId,
}: {
  open: boolean;
  patient: Patient | null | undefined;
  returnPatientId?: number | null;
  returnReceptionId?: number | null;
}) {
  const router = useRouter();
  const [rows, setRows] = React.useState<TestResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const name = patient?.name?.trim();
    if (!name) {
      setRows([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTestResultsApi({ patientName: name })
      .then((list) => {
        if (!cancelled) {
          setRows(list);
          setPage(0);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "조회 실패");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, patient?.name, patient?.patientId]);

  const maxPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);
  const paginatedRows = React.useMemo(
    () => rows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage),
    [rows, currentPage, rowsPerPage]
  );

  const returnCtx = React.useMemo(() => {
    if (returnPatientId == null || !Number.isFinite(Number(returnPatientId))) {
      return null;
    }
    const pid = Number(returnPatientId);
    const rid =
      returnReceptionId != null && Number.isFinite(Number(returnReceptionId))
        ? Number(returnReceptionId)
        : NaN;
    return {
      patientId: pid,
      receptionId: rid,
    };
  }, [returnPatientId, returnReceptionId]);

  const goDetail = React.useCallback(
    (row: TestResult) => {
      if (!canOpenDetail(row)) {
        return;
      }
      router.push(detailPath(row, returnCtx));
    },
    [router, returnCtx]
  );

  const onRowKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTableRowElement>, row: TestResult) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      goDetail(row);
    },
    [goDetail]
  );

  if (!patient?.name?.trim()) {
    return (
      <Alert severity="info" sx={{ mb: 0 }}>
        환자를 선택한 후 검사 결과를 조회할 수 있습니다.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 0 }}>
          {error}
        </Alert>
      ) : null}
      {!loading && !error ? (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              maxHeight: "min(56vh, 480px)",
            }}
          >
            <Table size="small" stickyHeader sx={{ minWidth: 1120 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    번호
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    결과 ID
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    검사유형
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    검사코드
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    환자명
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    진료과
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    검사수행자
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    결과등록일시
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", whiteSpace: "nowrap" }}>
                    진행상태
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">조회된 검사 결과가 없습니다.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
                {paginatedRows.map((row, index) => {
                  const openable = canOpenDetail(row);
                  return (
                    <TableRow
                      key={`${safeValue(row.resultType)}-${safeValue(row.resultId)}-${currentPage * rowsPerPage + index}`}
                      hover
                      role={openable ? "button" : undefined}
                      tabIndex={openable ? 0 : undefined}
                      onClick={openable ? () => goDetail(row) : undefined}
                      onKeyDown={openable ? (e) => onRowKeyDown(e, row) : undefined}
                      sx={{
                        cursor: openable ? "pointer" : "default",
                        "& td": { py: 1.25, whiteSpace: "nowrap" },
                      }}
                    >
                      <TableCell align="center">{currentPage * rowsPerPage + index + 1}</TableCell>
                      <TableCell align="center">{safeValue(row.resultId)}</TableCell>
                      <TableCell align="center">{getResultTypeLabel(row)}</TableCell>
                      <TableCell align="center">{safeValue(row.detailCode)}</TableCell>
                      <TableCell align="center">{safeValue(row.patientName)}</TableCell>
                      <TableCell align="center">{safeValue(row.departmentName)}</TableCell>
                      <TableCell align="center">
                        {formatNameWithId(row.performerName, row.performerId)}
                      </TableCell>
                      <TableCell align="center">{formatDateTime(row.resultAt)}</TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={0.75}
                          useFlexGap
                          flexWrap="wrap"
                          justifyContent="center"
                          sx={{ whiteSpace: "normal" }}
                        >
                          <Chip
                            label={formatProgressStatus(row.progressStatus)}
                            color={getProgressStatusColor(row.progressStatus)}
                            size="small"
                            variant="outlined"
                          />
                          {isRevisedResult(row.isRevised) ? (
                            <Chip label="수정됨" color="info" size="small" variant="outlined" />
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
            count={rows.length}
            page={currentPage}
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="페이지당 행"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}`}
          />
        </>
      ) : null}
    </Stack>
  );
}
