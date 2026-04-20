"use client";

import * as React from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { ExtensionQueryResult } from "@/lib/reception/receptionExtensionsApi";
import {
  fetchInpatientAdmissionAudit,
  fetchInpatientAdmissionDecision,
  fetchInpatientBedAssignmentHistory,
  fetchReceptionAudit,
  fetchReceptionCallHistory,
  fetchReceptionClosureReasons,
  fetchReceptionQualificationItems,
  fetchReceptionQualificationSnapshots,
  fetchReceptionSettlementSnapshots,
  fetchReceptionVisitClosure,
  fetchReceptionVisitClosureHistory,
  fetchReservationBookingRules,
  fetchReservationDoctorSchedules,
  fetchReservationStatusHistory,
  fetchReservationTimeSlots,
  fetchReservationToReceptionHistory,
} from "@/lib/reception/receptionExtensionsApi";

export type ExtensionScope = "reception" | "reservation" | "inpatient";

type Props = {
  scope: ExtensionScope;
  entityId: number | string | null | undefined;
};

type TableItem = {
  table: string;
  label: string;
  requiresId: boolean;
  load: (id: number) => Promise<ExtensionQueryResult<unknown>>;
};

type ResultMap = Record<string, ExtensionQueryResult<unknown>>;
type ViewMode = "ops" | "json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dataCount(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value == null) return 0;
  return 1;
}

function formatCellValue(value: unknown): string {
  if (value == null) return "-";
  if (typeof value === "string") return value || "-";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length ? `[${value.length}개]` : "[]";
  if (isRecord(value)) return "{...}";
  return String(value);
}

function shortText(value: unknown, max = 64): string {
  const text = formatCellValue(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function pickColumns(rows: Record<string, unknown>[]): string[] {
  const columns: string[] = [];
  for (const row of rows.slice(0, 5)) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) columns.push(key);
      if (columns.length >= 6) return columns;
    }
  }
  return columns;
}

const TABLES_BY_SCOPE: Record<ExtensionScope, TableItem[]> = {
  reception: [
    {
      table: "RECEPTION_QUALIFICATION_SNAP",
      label: "자격확인 스냅샷",
      requiresId: true,
      load: (id) => fetchReceptionQualificationSnapshots(id),
    },
    {
      table: "RECEPTION_QUALIFICATION_ITEM",
      label: "자격확인 항목",
      requiresId: true,
      load: (id) => fetchReceptionQualificationItems(id),
    },
    {
      table: "RECEPTION_CALL_HISTORY",
      label: "호출 이력",
      requiresId: true,
      load: (id) => fetchReceptionCallHistory(id),
    },
    {
      table: "RECEPTION_VISIT_CLOSURE",
      label: "접수 종료",
      requiresId: true,
      load: (id) => fetchReceptionVisitClosure(id),
    },
    {
      table: "RECEPTION_CLOSURE_REASON",
      label: "종료 사유 코드",
      requiresId: false,
      load: () => fetchReceptionClosureReasons(),
    },
    {
      table: "RECEPTION_VISIT_CLOSURE_HIS",
      label: "접수 종료 이력",
      requiresId: true,
      load: (id) => fetchReceptionVisitClosureHistory(id),
    },
    {
      table: "RECEPTION_SETTLEMENT_SNAPSHOT",
      label: "수납 스냅샷",
      requiresId: true,
      load: (id) => fetchReceptionSettlementSnapshots(id),
    },
    {
      table: "RECEPTION_AUDIT",
      label: "접수 감사 로그",
      requiresId: true,
      load: (id) => fetchReceptionAudit(id),
    },
  ],
  reservation: [
    {
      table: "RESERVATION_STATUS_HISTORY",
      label: "예약 상태 이력",
      requiresId: true,
      load: (id) => fetchReservationStatusHistory(id),
    },
    {
      table: "RESERVATION_DOCTOR_SCHEDULE",
      label: "의사 스케줄",
      requiresId: true,
      load: (id) => fetchReservationDoctorSchedules(id),
    },
    {
      table: "RESERVATION_TIME_SLOT",
      label: "예약 타임슬롯",
      requiresId: true,
      load: (id) => fetchReservationTimeSlots(id),
    },
    {
      table: "RESERVATION_BOOKING_RULE",
      label: "예약 규칙",
      requiresId: true,
      load: (id) => fetchReservationBookingRules(id),
    },
    {
      table: "RESERVATION_TO_RECEPTION_HIS",
      label: "예약-접수 전환 이력",
      requiresId: true,
      load: (id) => fetchReservationToReceptionHistory(id),
    },
  ],
  inpatient: [
    {
      table: "INPATIENT_ADMISSION_DECISION",
      label: "입원 결정",
      requiresId: true,
      load: (id) => fetchInpatientAdmissionDecision(id),
    },
    {
      table: "INPATIENT_BED_ASSIGNMENT_HIS",
      label: "병상 배정 이력",
      requiresId: true,
      load: (id) => fetchInpatientBedAssignmentHistory(id),
    },
    {
      table: "INPATIENT_ADMISSION_AUDIT",
      label: "입원 감사 로그",
      requiresId: true,
      load: (id) => fetchInpatientAdmissionAudit(id),
    },
  ],
};

function parseId(entityId: number | string | null | undefined): number | null {
  if (typeof entityId === "number") return Number.isFinite(entityId) && entityId > 0 ? entityId : null;
  if (typeof entityId === "string") {
    const n = Number(entityId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function prettyJson(value: unknown): string {
  if (value == null) return "-";
  return JSON.stringify(value, null, 2);
}

function scopeTitle(scope: ExtensionScope): string {
  if (scope === "reservation") return "예약 확장 데이터";
  if (scope === "inpatient") return "입원 확장 데이터";
  return "접수 확장 데이터";
}

export default function ReceptionExtensionsPanel({ scope, entityId }: Props) {
  const tables = TABLES_BY_SCOPE[scope];
  const firstTable = tables[0]?.table ?? false;
  const numericId = React.useMemo(() => parseId(entityId), [entityId]);

  const [results, setResults] = React.useState<ResultMap>({});
  const [loadingTable, setLoadingTable] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>("ops");
  const [expandedTable, setExpandedTable] = React.useState<string | false>(firstTable);
  const [lastLoadedAt, setLastLoadedAt] = React.useState<Date | null>(null);

  const loadTable = React.useCallback(
    async (item: TableItem) => {
      if (item.requiresId && !numericId) {
        setResults((prev) => ({
          ...prev,
          [item.table]: {
            supported: true,
            data: null,
            message: "상세 ID가 없어 조회할 수 없습니다.",
          },
        }));
        return;
      }
      setLoadingTable(item.table);
      try {
        const result = await item.load(numericId ?? 0);
        setResults((prev) => ({ ...prev, [item.table]: result }));
        setLastLoadedAt(new Date());
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "조회 중 오류가 발생했습니다.";
        setResults((prev) => ({
          ...prev,
          [item.table]: {
            supported: true,
            data: null,
            message,
          },
        }));
      } finally {
        setLoadingTable((current) => (current === item.table ? null : current));
      }
    },
    [numericId]
  );

  const loadAll = React.useCallback(async () => {
    for (const item of tables) {
      // Keep sequential order to avoid burst traffic against the backend.
      await loadTable(item);
    }
  }, [loadTable, tables]);

  React.useEffect(() => {
    setResults({});
    setExpandedTable(firstTable);
    void loadAll();
  }, [firstTable, loadAll]);

  const summary = React.useMemo(() => {
    let ready = 0;
    let empty = 0;
    let warning = 0;
    let error = 0;
    let pending = 0;

    for (const item of tables) {
      const result = results[item.table];
      if (!result) {
        pending += 1;
        continue;
      }
      if (!result.supported) {
        warning += 1;
        continue;
      }
      if (result.message) {
        error += 1;
        continue;
      }
      const count = dataCount(result.data);
      if (count === 0) empty += 1;
      else ready += 1;
    }

    return { ready, empty, warning, error, pending };
  }, [results, tables]);

  const renderOperationsView = React.useCallback((data: unknown) => {
    if (data == null) {
      return (
        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
          저장된 데이터가 없습니다.
        </Typography>
      );
    }

    if (Array.isArray(data)) {
      if (!data.length) {
        return (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            조회 결과가 0건입니다.
          </Typography>
        );
      }

      const objectRows = data.filter(isRecord);
      if (objectRows.length === data.length) {
        const columns = pickColumns(objectRows);
        const visibleRows = objectRows.slice(0, 6);

        return (
          <Stack spacing={1}>
            <TableContainer sx={{ border: "1px solid #e3eaf6", borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f3f7ff" }}>
                    {columns.map((column) => (
                      <TableCell key={column} sx={{ fontWeight: 800, color: "#2b3e66" }}>
                        {column}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((row, index) => (
                    <TableRow key={`${index}-${columns[0] ?? "row"}`} hover>
                      {columns.map((column) => (
                        <TableCell key={`${index}-${column}`} sx={{ fontSize: 12.5 }}>
                          {shortText(row[column])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography sx={{ color: "#6b7b9a", fontSize: 12 }}>
              총 {data.length}건 중 {visibleRows.length}건 미리보기
            </Typography>
          </Stack>
        );
      }

      return (
        <Stack spacing={0.75}>
          {data.slice(0, 8).map((entry, index) => (
            <Typography key={`${index}-${String(entry)}`} sx={{ fontSize: 12.5 }}>
              {index + 1}. {shortText(entry)}
            </Typography>
          ))}
          {data.length > 8 && (
            <Typography sx={{ color: "#6b7b9a", fontSize: 12 }}>
              그 외 {data.length - 8}건은 원본 JSON 보기에서 확인할 수 있습니다.
            </Typography>
          )}
        </Stack>
      );
    }

    if (isRecord(data)) {
      const entries = Object.entries(data);
      return (
        <Stack spacing={0.75}>
          {entries.map(([key, value]) => (
            <Stack key={key} direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ color: "#6b7b9a", fontSize: 12.5 }}>{key}</Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, textAlign: "right" }}>
                {shortText(value)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      );
    }

    return <Typography sx={{ fontSize: 13 }}>{formatCellValue(data)}</Typography>;
  }, []);

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid #dbe5f5" }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography fontWeight={900}>{scopeTitle(scope)}</Typography>
              <Typography variant="body2" color="text.secondary">
                운영 화면에 맞춰 요약 정보를 먼저 보여주고, 필요 시 원본 JSON을 확인할 수 있습니다.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={viewMode}
                onChange={(_, value: ViewMode | null) => {
                  if (value) setViewMode(value);
                }}
              >
                <ToggleButton value="ops">운영 보기</ToggleButton>
                <ToggleButton value="json">원본 JSON</ToggleButton>
              </ToggleButtonGroup>
              <Button variant="outlined" onClick={loadAll} disabled={!!loadingTable}>
                {loadingTable ? "새로고침 중..." : "전체 새로고침"}
              </Button>
            </Stack>
          </Stack>

          <Alert severity="info">
            일부 엔드포인트가 아직 미구현이면 404가 표시될 수 있습니다. 이 경우 기본 접수/예약/입원 기능에는 영향이
            없습니다.
          </Alert>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" },
              gap: 1,
            }}
          >
            <Paper elevation={0} sx={{ p: 1.25, border: "1px solid #e5ecf8", borderRadius: 2, bgcolor: "#f7fbff" }}>
              <Typography sx={{ color: "#5e7194", fontSize: 12 }}>정상 데이터</Typography>
              <Typography fontWeight={900}>{summary.ready}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.25, border: "1px solid #e5ecf8", borderRadius: 2, bgcolor: "#fbfcff" }}>
              <Typography sx={{ color: "#5e7194", fontSize: 12 }}>빈 결과</Typography>
              <Typography fontWeight={900}>{summary.empty}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.25, border: "1px solid #e5ecf8", borderRadius: 2, bgcolor: "#fffbf2" }}>
              <Typography sx={{ color: "#8f6a00", fontSize: 12 }}>미지원/404</Typography>
              <Typography fontWeight={900}>{summary.warning}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.25, border: "1px solid #e5ecf8", borderRadius: 2, bgcolor: "#fff7f7" }}>
              <Typography sx={{ color: "#9c3842", fontSize: 12 }}>오류</Typography>
              <Typography fontWeight={900}>{summary.error}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.25, border: "1px solid #e5ecf8", borderRadius: 2, bgcolor: "#f8faff" }}>
              <Typography sx={{ color: "#5e7194", fontSize: 12 }}>미조회</Typography>
              <Typography fontWeight={900}>{summary.pending}</Typography>
            </Paper>
          </Box>

          <Typography sx={{ color: "#6b7b9a", fontSize: 12 }}>
            마지막 동기화: {lastLoadedAt ? lastLoadedAt.toLocaleString("ko-KR") : "-"}
          </Typography>

          {tables.map((item) => {
            const result = results[item.table];
            const isLoading = loadingTable === item.table;
            const itemData = result?.data;
            const count = dataCount(itemData);
            const statusLabel = !result
              ? "미조회"
              : !result.supported
                ? "미지원"
                : result.message
                  ? "오류"
                  : count > 0
                    ? "정상"
                    : "빈 결과";
            const statusColor = !result
              ? "default"
              : !result.supported
                ? "warning"
                : result.message
                  ? "error"
                  : count > 0
                    ? "success"
                    : "default";

            return (
              <Accordion
                key={item.table}
                expanded={expandedTable === item.table}
                onChange={(_, expanded) => setExpandedTable(expanded ? item.table : false)}
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e5ecf8",
                  bgcolor: "#fbfdff",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary component="div" expandIcon={<ExpandMoreRoundedIcon />}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1}
                  >
                    <Box>
                      <Typography fontWeight={900}>{item.table}</Typography>
                      <Typography sx={{ color: "#6b7b9a", fontSize: 12 }}>
                        {item.label} | {count}건
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={statusLabel} color={statusColor} variant="outlined" />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
                          event.stopPropagation();
                          void loadTable(item);
                        }}
                        onFocus={(event) => event.stopPropagation()}
                        disabled={isLoading}
                      >
                        {isLoading ? "조회 중..." : "조회"}
                      </Button>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Stack spacing={1}>
                    {isLoading && <LinearProgress sx={{ borderRadius: 999 }} />}

                    <Divider />

                    {!result ? (
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                        아직 조회하지 않았습니다.
                      </Typography>
                    ) : !result.supported ? (
                      <Alert severity="warning">{result.message ?? "백엔드 미지원"}</Alert>
                    ) : result.message ? (
                      <Alert severity="error">{result.message}</Alert>
                    ) : viewMode === "ops" ? (
                      renderOperationsView(result.data)
                    ) : (
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: "#0f172a",
                          color: "#e2e8f0",
                          fontSize: 12,
                          overflowX: "auto",
                          maxHeight: 320,
                        }}
                      >
                        {prettyJson(result.data)}
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
