"use client";

import * as React from "react";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { fetchDepartmentsApi } from "@/lib/masterDataApi";
import { fetchReceptionsApi } from "@/lib/reception/receptionApi";
import type { Reception } from "@/features/Reception/ReceptionTypes";
import type { DepartmentOption } from "@/features/Reservations/ReservationTypes";

const REFRESH_MS = 8000;
const RECEPTION_API_BASE =
  process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283";
const RECEPTION_STATUS_EVENT_NAME = "reception-status-changed";
const NOTIFY_TARGET_STATUS = "IN_PROGRESS";
const DISPLAY_POLICY = {
  showCalledStatus: true,
} as const;

type ReceptionStatusNormalized = "WAITING" | "CALLED" | "IN_PROGRESS" | "DONE";
type ReceptionStatusChangedEvent = {
  receptionId?: number;
  patientName?: string | null;
  departmentId?: string | number | null;
  departmentName?: string | null;
  toStatus?: string | null;
  changedAt?: string | null;
};

const TEXT = {
  title: "병원 진료 대기 현황",
  subtitle: "실시간 접수 대기 디스플레이",
  unitPeople: "명",
  labelWaiting: "대기",
  labelInProgress: "진료중",
  statusWaiting: "대기",
  statusCalled: "호출",
  statusInProgress: "진료중",
  statusDone: "완료",
  noName: "이름없음",
  noPatient: "오늘 외래 접수 환자가 없습니다.",
  noDepartment:
    "표시할 진료과 데이터가 없습니다.",
  loading: "불러오는 중...",
  loadError: "접수 목록을 불러오지 못했습니다.",
} as const;

const normalizeStatus = (value?: string | null): ReceptionStatusNormalized => {
  const status = (value ?? "").trim().toUpperCase();
  if (status === "WAITING" || status === "대기") return "WAITING";
  if (status === "CALLED" || status === "호출") return "CALLED";
  if (status === "IN_PROGRESS" || status === "진료중") return "IN_PROGRESS";
  return "DONE";
};

const parseMillis = (value?: string | null) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const extractDateKeyFromDateTime = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const head = trimmed.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
  return null;
};

const extractDateKeyFromReceptionNo = (value?: string | null) => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})-/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const isTodayReception = (item: Reception, todayKey: string) => {
  const candidates = [
    extractDateKeyFromReceptionNo(item.receptionNo),
    extractDateKeyFromDateTime(item.arrivedAt),
    extractDateKeyFromDateTime(item.scheduledAt),
    extractDateKeyFromDateTime(item.createdAt),
  ];
  return candidates.some((dateKey) => dateKey === todayKey);
};

const isOutpatientVisit = (visitType?: string | null) => {
  const normalized = (visitType ?? "").trim().toUpperCase();
  return normalized === "OUTPATIENT" || normalized === "외래";
};

const maskPatientName = (name?: string | null) => {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return TEXT.noName;
  return trimmed;
};

const statusLabel = (status: ReceptionStatusNormalized) => {
  if (status === "WAITING") return TEXT.statusWaiting;
  if (status === "CALLED") return TEXT.statusCalled;
  if (status === "IN_PROGRESS") return TEXT.statusInProgress;
  return TEXT.statusDone;
};

const statusPriority = (status: ReceptionStatusNormalized) => {
  if (status === "IN_PROGRESS") return 0;
  if (status === "CALLED") return 1;
  if (status === "WAITING") return 2;
  return 3;
};

const getDepartmentName = (item: DepartmentOption) => (item.departmentName ?? "").trim();

export default function ReceptionDisplay() {
  const [list, setList] = React.useState<Reception[]>([]);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [now, setNow] = React.useState(() => new Date());
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [announcementText, setAnnouncementText] = React.useState<string | null>(null);
  const eventRefreshTimerRef = React.useRef<number | null>(null);
  const announcementTimerRef = React.useRef<number | null>(null);

  const showAnnouncement = React.useCallback((patientName: string, departmentName: string) => {
    const safePatientName = patientName.trim() || "환자";
    const safeDepartmentName = departmentName.trim() || "진료과";
    setAnnouncementText(`${safePatientName}님 ${safeDepartmentName}에 모시겠습니다`);
    if (announcementTimerRef.current != null) {
      window.clearTimeout(announcementTimerRef.current);
    }
    announcementTimerRef.current = window.setTimeout(() => {
      setAnnouncementText(null);
      announcementTimerRef.current = null;
    }, 5000);
  }, []);

  const loadDisplayData = React.useCallback(async () => {
    try {
      const [receptions, departmentList] = await Promise.all([
        fetchReceptionsApi(),
        fetchDepartmentsApi(),
      ]);
      setList(Array.isArray(receptions) ? receptions : []);
      setDepartments(Array.isArray(departmentList) ? departmentList : []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : TEXT.loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadDisplayData();
    const refreshTimer = window.setInterval(() => {
      void loadDisplayData();
    }, REFRESH_MS);
    const clockTimer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(refreshTimer);
      window.clearInterval(clockTimer);
    };
  }, [loadDisplayData]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const streamUrl = `${RECEPTION_API_BASE}/api/receptions/events/stream`;
    const eventSource = new EventSource(streamUrl);

    const scheduleRefresh = () => {
      if (eventRefreshTimerRef.current != null) return;
      eventRefreshTimerRef.current = window.setTimeout(() => {
        eventRefreshTimerRef.current = null;
        void loadDisplayData();
      }, 200);
    };

    const onStatusChanged = (rawEvent: Event) => {
      const event = rawEvent as MessageEvent<string>;
      try {
        const payload = JSON.parse(event.data) as ReceptionStatusChangedEvent;
        const nextStatus = (payload.toStatus ?? "").trim().toUpperCase();
        if (nextStatus !== NOTIFY_TARGET_STATUS) return;
        const patientName = payload.patientName?.trim() || "환자";
        let departmentName = payload.departmentName?.trim() || "";
        if (!departmentName && payload.receptionId != null) {
          const found = list.find((item) => item.receptionId === payload.receptionId);
          departmentName = found?.departmentName?.trim() || "";
        }
        if (!departmentName && payload.departmentId != null) {
          const found = departments.find(
            (item) => String(item.departmentId) === String(payload.departmentId)
          );
          departmentName = found?.departmentName?.trim() || "";
        }
        showAnnouncement(patientName, departmentName || "해당 진료과");
        scheduleRefresh();
      } catch {
        // ignore malformed event payload
      }
    };

    eventSource.addEventListener(RECEPTION_STATUS_EVENT_NAME, onStatusChanged as EventListener);

    return () => {
      eventSource.removeEventListener(
        RECEPTION_STATUS_EVENT_NAME,
        onStatusChanged as EventListener
      );
      eventSource.close();
      if (eventRefreshTimerRef.current != null) {
        window.clearTimeout(eventRefreshTimerRef.current);
        eventRefreshTimerRef.current = null;
      }
      if (announcementTimerRef.current != null) {
        window.clearTimeout(announcementTimerRef.current);
        announcementTimerRef.current = null;
      }
    };
  }, [departments, list, loadDisplayData, showAnnouncement]);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    onFullscreenChange();
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = React.useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // no-op
    }
  }, []);

  const todayOutpatientList = React.useMemo(() => {
    const todayKey = toLocalDateKey(now);
    return list.filter(
      (item) => isOutpatientVisit(item.visitType) && isTodayReception(item, todayKey)
    );
  }, [list, now]);

  const displayDepartments = React.useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();

    for (const item of departments) {
      const name = getDepartmentName(item);
      if (!name || seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }

    for (const reception of todayOutpatientList) {
      const name = (reception.departmentName ?? "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }

    return names;
  }, [departments, todayOutpatientList]);

  const receptionsByDepartment = React.useMemo(() => {
    const map = new Map<string, Reception[]>();
    for (const department of displayDepartments) {
      map.set(department, []);
    }

    for (const item of todayOutpatientList) {
      const departmentName = (item.departmentName ?? "").trim();
      if (!departmentName || !map.has(departmentName)) continue;
      const normalized = normalizeStatus(item.status);
      if (normalized === "DONE") continue;
      if (!DISPLAY_POLICY.showCalledStatus && normalized === "CALLED") continue;
      map.get(departmentName)?.push(item);
    }

    for (const [department, receptions] of map.entries()) {
      const sorted = [...receptions].sort((a, b) => {
        const statusDiff =
          statusPriority(normalizeStatus(a.status)) -
          statusPriority(normalizeStatus(b.status));
        if (statusDiff !== 0) return statusDiff;
        const createdDiff = parseMillis(a.createdAt) - parseMillis(b.createdAt);
        if (createdDiff !== 0) return createdDiff;
        return a.receptionId - b.receptionId;
      });
      map.set(department, sorted);
    }

    return map;
  }, [displayDepartments, todayOutpatientList]);

  const waitingCountByDepartment = React.useMemo(() => {
    const result = new Map<string, number>();
    for (const department of displayDepartments) {
      const receptions = receptionsByDepartment.get(department) ?? [];
      const waitingCount = receptions.filter(
        (item) => normalizeStatus(item.status) === "WAITING"
      ).length;
      result.set(department, waitingCount);
    }
    return result;
  }, [displayDepartments, receptionsByDepartment]);

  const inProgressCountByDepartment = React.useMemo(() => {
    const result = new Map<string, number>();
    for (const department of displayDepartments) {
      const receptions = receptionsByDepartment.get(department) ?? [];
      const inProgressCount = receptions.filter(
        (item) => normalizeStatus(item.status) === "IN_PROGRESS"
      ).length;
      result.set(department, inProgressCount);
    }
    return result;
  }, [displayDepartments, receptionsByDepartment]);

  const dateText = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(now.getDate()).padStart(2, "0")}`;
  const timeText = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const columnCount = Math.max(displayDepartments.length, 1);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        bgcolor: "#edf5ff",
        color: "#12233d",
        backgroundImage:
          "radial-gradient(circle at 8% 5%, rgba(59,130,246,0.2), transparent 34%), radial-gradient(circle at 90% 12%, rgba(45,212,191,0.14), transparent 30%)",
      }}
    >
      {announcementText && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
          }}
        >
          <Box
            sx={{
              minWidth: { xs: "92vw", md: 760 },
              maxWidth: 980,
              borderRadius: 3,
              px: { xs: 3, md: 5 },
              py: { xs: 2.4, md: 3.2 },
              bgcolor: "rgba(7, 35, 75, 0.9)",
              border: "2px solid rgba(143,176,224,0.9)",
              boxShadow: "0 24px 48px rgba(5,20,48,0.45)",
              textAlign: "center",
              animation: "displayMarqueePop 3.6s ease-in-out forwards",
              "@keyframes displayMarqueePop": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(22px) scale(0.96)",
                },
                "12%": {
                  opacity: 1,
                  transform: "translateY(0) scale(1)",
                },
                "85%": {
                  opacity: 1,
                  transform: "translateY(0) scale(1)",
                },
                "100%": {
                  opacity: 0,
                  transform: "translateY(-12px) scale(1.02)",
                },
              },
            }}
          >
            <Typography
              sx={{
                color: "#ecf4ff",
                fontWeight: 900,
                letterSpacing: 0.5,
                fontSize: { xs: 27, md: 42 },
                textShadow: "0 2px 14px rgba(47,140,255,0.45)",
              }}
            >
              {announcementText}
            </Typography>
          </Box>
        </Box>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 24, md: 34 }, fontWeight: 900, letterSpacing: 1 }}>
            {TEXT.title}
          </Typography>
          <Typography sx={{ color: "#3d5f8f", fontSize: { xs: 13, md: 16 } }}>
            {TEXT.subtitle}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography sx={{ fontSize: { xs: 16, md: 24 }, fontWeight: 700 }}>{dateText}</Typography>
          <Typography sx={{ fontSize: { xs: 22, md: 34 }, fontWeight: 900 }}>{timeText}</Typography>
          <Button
            size="small"
            onClick={toggleFullscreen}
            sx={{
              mt: 0.8,
              minWidth: 116,
              fontWeight: 800,
              borderRadius: 2,
              color: "#1f66cc",
              border: "1px solid rgba(31,102,204,0.35)",
              bgcolor: "rgba(255,255,255,0.88)",
              "&:hover": { bgcolor: "#ffffff" },
            }}
          >
            {isFullscreen ? "전체화면 해제" : "전체화면"}
          </Button>
        </Box>
      </Stack>

      {error && (
        <Card
          sx={{
            mb: 2,
            bgcolor: "rgba(239,68,68,0.16)",
            border: "1px solid rgba(248,113,113,0.55)",
          }}
        >
          <Box sx={{ p: 1.5 }}>
            <Typography sx={{ fontWeight: 700 }}>{error}</Typography>
          </Box>
        </Card>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columnCount}, minmax(320px, 1fr))`,
          gap: 2,
          alignItems: "stretch",
          overflowX: "auto",
          pb: 1,
        }}
      >
        {displayDepartments.map((department) => {
          const items = receptionsByDepartment.get(department) ?? [];
          const waiting = waitingCountByDepartment.get(department) ?? 0;
          const inProgress = inProgressCountByDepartment.get(department) ?? 0;

          return (
            <Box key={department} sx={{ minWidth: 0 }}>
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid rgba(143,176,224,0.55)",
                  bgcolor: "rgba(255,255,255,0.92)",
                  boxShadow: "0 12px 24px rgba(36,74,124,0.14)",
                }}
              >
                <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid rgba(143,176,224,0.35)" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#1f66cc" }}>
                      {department}
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ color: "#2f4f80", fontWeight: 800 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                        {TEXT.labelWaiting} {waiting}
                        {TEXT.unitPeople}
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                        {TEXT.labelInProgress} {inProgress}
                        {TEXT.unitPeople}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Stack spacing={0.7} sx={{ px: 2, py: 1.5, minHeight: 320 }}>
                  {items.map((item, idx) => {
                    const normalized = normalizeStatus(item.status);
                    return (
                      <Box
                        key={item.receptionId}
                        sx={{
                          p: 1.1,
                          borderRadius: 1,
                          bgcolor:
                            normalized === "CALLED"
                              ? "rgba(59,130,246,0.2)"
                              : normalized === "IN_PROGRESS"
                              ? "rgba(16,185,129,0.2)"
                              : "rgba(239,247,255,0.95)",
                          border: "1px solid rgba(143,176,224,0.45)",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ fontWeight: 800 }}>{idx + 1}</Typography>
                          <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                            {maskPatientName(item.patientName)}
                          </Typography>
                          <Typography sx={{ color: "#476da1", fontSize: 13 }}>
                            {statusLabel(normalized)}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  })}

                  {!loading && items.length === 0 && (
                    <Typography sx={{ color: "#5a7aaa", py: 2 }}>{TEXT.noPatient}</Typography>
                  )}
                  {loading && <Typography sx={{ color: "#5a7aaa", py: 2 }}>{TEXT.loading}</Typography>}
                </Stack>
              </Card>
            </Box>
          );
        })}
      </Box>

      {!loading && displayDepartments.length === 0 && (
        <Card
          sx={{
            mt: 1.5,
            border: "1px solid rgba(143,176,224,0.55)",
            bgcolor: "rgba(255,255,255,0.92)",
            boxShadow: "0 12px 24px rgba(36,74,124,0.14)",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography sx={{ color: "#476da1", fontWeight: 700 }}>{TEXT.noDepartment}</Typography>
          </Box>
        </Card>
      )}
    </Box>
  );
}
