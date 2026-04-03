"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  Stack,
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
  const numericId = React.useMemo(() => parseId(entityId), [entityId]);

  const [results, setResults] = React.useState<ResultMap>({});
  const [loadingTable, setLoadingTable] = React.useState<string | null>(null);

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
      const result = await item.load(numericId ?? 0);
      setResults((prev) => ({ ...prev, [item.table]: result }));
      setLoadingTable(null);
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
    void loadAll();
  }, [loadAll, scope, numericId]);

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid #dbe5f5" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography fontWeight={900}>{scopeTitle(scope)}</Typography>
              <Typography variant="body2" color="text.secondary">
                연동된 확장 테이블 데이터를 바로 확인할 수 있습니다.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={loadAll} disabled={!!loadingTable}>
              전체 새로고침
            </Button>
          </Stack>

          <Alert severity="info">
            일부 엔드포인트가 아직 미구현이면 404가 표시될 수 있습니다. 이 경우 기본 접수/예약/입원 기능에는 영향이
            없습니다.
          </Alert>

          {tables.map((item) => {
            const result = results[item.table];
            const isLoading = loadingTable === item.table;
            const itemData = result?.data;
            const count = Array.isArray(itemData) ? itemData.length : itemData ? 1 : 0;

            return (
              <Paper
                key={item.table}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid #e5ecf8",
                  bgcolor: "#fbfdff",
                }}
              >
                <Stack spacing={1}>
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
                    <Button size="small" variant="outlined" onClick={() => loadTable(item)} disabled={isLoading}>
                      {isLoading ? "조회 중..." : "조회"}
                    </Button>
                  </Stack>

                  <Divider />

                  {!result ? (
                    <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                      아직 조회하지 않았습니다.
                    </Typography>
                  ) : !result.supported ? (
                    <Alert severity="warning">{result.message ?? "백엔드 미지원"}</Alert>
                  ) : result.message ? (
                    <Alert severity="error">{result.message}</Alert>
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
                        maxHeight: 260,
                      }}
                    >
                      {prettyJson(result.data)}
                    </Box>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
