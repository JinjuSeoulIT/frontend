"use client";

import * as React from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Reception/ReceptionSlice";
import type {
  Reception,
  ReceptionSearchPayload,
} from "@/features/Reception/ReceptionTypes";
import type { DepartmentOption, DoctorOption } from "@/features/Reservations/ReservationTypes";
import { formatDepartmentName } from "@/lib/common/departmentLabel";
import type { Patient } from "@/features/patients/patientTypes";
import { fetchDepartmentsApi, fetchDoctorsApi } from "@/lib/masterDataApi";
import { fetchReservationsApi, updateReservationApi } from "@/lib/reception/reservationAdminApi";
import { fetchPatientsApi } from "@/lib/reception/patientApi";
import {
  cancelReceptionApi,
  createReceptionApi,
  fetchReceptionsApi,
} from "@/lib/reception/receptionApi";

const visitTypeLabel = (value?: string | null) => {
  switch (value) {
    case "OUTPATIENT":
      return "외래";
    case "EMERGENCY":
      return "응급";
    case "INPATIENT":
      return "입원";
    default:
      return value ?? "-";
  }
};

const ITEMS_PER_PAGE = 10;
const PATIENT_LIST_ITEMS_PER_PAGE = 8;
const RECEPTION_LIST_REFRESH_INTERVAL_MS = 10000;
const RECEPTION_API_BASE =
  process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283";
const RECEPTION_STATUS_EVENT_NAME = "reception-status-changed";
const NOTIFY_TARGET_STATUS = "IN_PROGRESS";
const MAX_PROCESSED_EVENT_KEYS = 200;

type ReceptionStatusChangedEvent = {
  receptionId?: number;
  patientName?: string | null;
  toStatus?: string | null;
  changedAt?: string | null;
};

type StatusFilterKey =
  | "ALL"
  | "WAITING"
  | "CALLED"
  | "IN_PROGRESS"
  | "TREATMENT_COMPLETED"
  | "PAYMENT_COMPLETED";

const STATUS_FILTER_ITEMS: Array<{ key: StatusFilterKey; label: string }> = [
  { key: "ALL", label: "전체" },
  { key: "WAITING", label: "대기" },
  { key: "CALLED", label: "호출" },
  { key: "IN_PROGRESS", label: "진료중" },
  { key: "TREATMENT_COMPLETED", label: "진료완료" },
  { key: "PAYMENT_COMPLETED", label: "수납완료" },
];

const statusLabel = (value?: string | null) => {
  switch (normalizeStatus(value)) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "IN_PROGRESS":
      return "진료중";
    case "TREATMENT_COMPLETED":
      return "진료완료";
    case "PAYMENT_IN_PROGRESS":
      return "수납중";
    case "PAYMENT_COMPLETED":
      return "수납완료";
    case "COMPLETED":
      return "수납완료";
    case "PAYMENT_WAIT":
      return "수납중";
    case "ON_HOLD":
      return "보류";
    case "CANCELED":
    case "CANCELLED":
      return "취소";
    case "INACTIVE":
      return "비활성";
    default:
      return value ?? "-";
  }
};

const normalizeStatus = (value?: string | null) => {
  if (!value) return value;
  const trimmed = value.trim();
  switch (trimmed) {
    case "대기":
      return "WAITING";
    case "호출":
      return "CALLED";
    case "진료중":
      return "IN_PROGRESS";
    case "진료완료":
      return "TREATMENT_COMPLETED";
    case "수납중":
    case "수납대기":
      return "TREATMENT_COMPLETED";
    case "수납완료":
      return "COMPLETED";
    case "PAYMENT_IN_PROGRESS":
    case "PAYMENT_WAIT":
      return "TREATMENT_COMPLETED";
    case "PAYMENT_COMPLETED":
      return "COMPLETED";
    case "완료":
      return "COMPLETED";
    case "보류":
      return "ON_HOLD";
    case "취소":
    case "CANCELLED":
      return "CANCELED";
    case "비활성":
      return "INACTIVE";
    default:
      return trimmed;
  }
};

const matchesStatusFilter = (
  status: string | null | undefined,
  filter: StatusFilterKey
) => {
  const normalized = normalizeStatus(status);

  if (filter === "ALL") {
    return (
      normalized === "WAITING" ||
      normalized === "CALLED" ||
      normalized === "IN_PROGRESS" ||
      normalized === "TREATMENT_COMPLETED" ||
      normalized === "COMPLETED"
    );
  }
  if (filter === "TREATMENT_COMPLETED") {
    return normalized === "TREATMENT_COMPLETED";
  }
  if (filter === "PAYMENT_COMPLETED") {
    return normalized === "COMPLETED";
  }
  return normalized === filter;
};

const statusChipSx = (value?: string | null) => {
  switch (normalizeStatus(value)) {
    case "WAITING":
      return {
        color: "#ffffff",
        bgcolor: "#1f5fb8",
      };
    case "IN_PROGRESS":
      return {
        color: "#ffffff",
        bgcolor: "#2e7d32",
      };
    case "CALLED":
      return {
        color: "#ffffff",
        bgcolor: "#8e24aa",
      };
    case "COMPLETED":
      return {
        color: "#ffffff",
        bgcolor: "#455a64",
      };
    case "TREATMENT_COMPLETED":
      return {
        color: "#ffffff",
        bgcolor: "#ef6c00",
      };
    case "ON_HOLD":
      return {
        color: "#ffffff",
        bgcolor: "#6d4c41",
      };
    case "CANCELED":
      return {
        color: "#ffffff",
        bgcolor: "#c62828",
      };
    case "INACTIVE":
      return {
        color: "#ffffff",
        bgcolor: "#607d8b",
      };
    default:
      return {
        color: "#ffffff",
        bgcolor: "#546e7a",
      };
  }
};

const genderLabel = (value?: string | null) => {
  if (!value) return "-";
  if (value === "M") return "남";
  if (value === "F") return "여";
  return value;
};

const resolveErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
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

const parseDateTimeToMillis = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const parsed = Date.parse(normalized);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const toLocalTimeValue = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const normalizeReservationStatus = (value?: string | null) => {
  if (!value) return value;
  const trimmed = value.trim();
  switch (trimmed) {
    case "예약":
      return "RESERVED";
    case "완료":
      return "COMPLETED";
    case "취소":
      return "CANCELED";
    case "비활성":
      return "INACTIVE";
    default:
      return trimmed;
  }
};

const isClosedReceptionStatus = (value?: string | null) => {
  const normalized = normalizeStatus(value);
  return normalized === "CANCELED" || normalized === "INACTIVE";
};

const extractDateKeyFromReceptionNo = (value?: string | null) => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})-/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const isTodayReception = (item: Reception, todayKey: string) => {
  const candidates = [
    // 접수 생성 기준 날짜만 사용하고, 수정일(updatedAt)은 제외한다.
    // updatedAt을 포함하면 과거 접수도 오늘 수정 시 오늘 목록으로 재노출될 수 있다.
    extractDateKeyFromReceptionNo(item.receptionNo),
    extractDateKeyFromDateTime(item.arrivedAt),
    extractDateKeyFromDateTime(item.scheduledAt),
    extractDateKeyFromDateTime(item.createdAt),
  ];
  return candidates.some((dateKey) => dateKey === todayKey);
};

const resolvePatientDisplayName = (
  item: Reception,
  patientNameById: Record<number, string>
) => {
  const fromMap = item.patientId ? patientNameById[item.patientId] : "";
  const fromReception = item.patientName?.trim() ?? "";
  if (fromMap) return fromMap;
  if (fromReception) return fromReception;
  if (item.patientId) return `환자 ${item.patientId}`;
  return "환자";
};

const resolveOutpatientDepartmentName = (
  item: Reception,
  departments: DepartmentOption[]
) => {
  const byId =
    item.departmentId != null
      ? departments.find((department) => String(department.departmentId) === String(item.departmentId))
          ?.departmentName
      : undefined;
  if (byId) return byId;
  return formatDepartmentName(item.departmentName, item.departmentId);
};

const resolveOutpatientDoctorName = (item: Reception, doctors: DoctorOption[]) => {
  const byId =
    item.doctorId != null
      ? doctors.find((doctor) => doctor.doctorId === item.doctorId)?.doctorName
      : undefined;
  if (byId) return byId;
  return item.doctorName?.trim() || "";
};

const compareReceptionsByLatest = (a: Reception, b: Reception) => {
  const aCreatedAt = parseDateTimeToMillis(a.createdAt);
  const bCreatedAt = parseDateTimeToMillis(b.createdAt);
  if (aCreatedAt !== bCreatedAt) {
    if (aCreatedAt == null) return 1;
    if (bCreatedAt == null) return -1;
    return bCreatedAt - aCreatedAt;
  }

  const aArrivedAt = parseDateTimeToMillis(a.arrivedAt);
  const bArrivedAt = parseDateTimeToMillis(b.arrivedAt);
  if (aArrivedAt !== bArrivedAt) {
    if (aArrivedAt == null) return 1;
    if (bArrivedAt == null) return -1;
    return bArrivedAt - aArrivedAt;
  }

  return b.receptionId - a.receptionId;
};

type ReceptionListProps = {
  initialSearchType?: ReceptionSearchPayload["type"];
  initialKeyword?: string;
  autoSearch?: boolean;
};

export default function ReceptionList({
  initialSearchType = "patientName",
  initialKeyword = "",
  autoSearch = false,
}: ReceptionListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.receptions
  );

  const [keyword, setKeyword] = React.useState(initialKeyword);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [doctors, setDoctors] = React.useState<DoctorOption[]>([]);
  const [masterDataLoading, setMasterDataLoading] = React.useState(false);
  const [masterDataError, setMasterDataError] = React.useState<string | null>(null);
  const [patientSuggestions, setPatientSuggestions] = React.useState<Patient[]>([]);
  const [openSuggestion, setOpenSuggestion] = React.useState(false);
  const [patientSearchResultCount, setPatientSearchResultCount] = React.useState<number | null>(null);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [patientListModalOpen, setPatientListModalOpen] = React.useState(false);
  const [patientListKeyword, setPatientListKeyword] = React.useState("");
  const [patientListPage, setPatientListPage] = React.useState(1);
  const [patientCatalog, setPatientCatalog] = React.useState<Patient[]>([]);
  const [patientCatalogLoading, setPatientCatalogLoading] = React.useState(false);
  const [patientCatalogError, setPatientCatalogError] = React.useState<string | null>(null);
  const [createTargetPatient, setCreateTargetPatient] = React.useState<{
    patientId: number | null;
    patientName: string;
  }>({
    patientId: null,
    patientName: "",
  });
  const [createModalForm, setCreateModalForm] = React.useState<{
    departmentId: string;
    doctorId: number | null;
    arrivedTime: string;
    note: string;
  }>({
    departmentId: "",
    doctorId: null,
    arrivedTime: toLocalTimeValue(new Date()),
    note: "",
  });
  const [patientNameById, setPatientNameById] = React.useState<Record<number, string>>({});
  const [todayKey, setTodayKey] = React.useState(() => toLocalDateKey(new Date()));
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterKey>("ALL");
  const [page, setPage] = React.useState(1);
  const [notificationQueue, setNotificationQueue] = React.useState<string[]>([]);
  const syncingReservationRef = React.useRef(false);
  const processedEventKeysRef = React.useRef<string[]>([]);

  const activeNotification = notificationQueue[0] ?? null;

  const closeNotification = React.useCallback(() => {
    setNotificationQueue((prev) => prev.slice(1));
  }, []);

  const syncTodayReservationsToWaitingReceptions = React.useCallback(async () => {
    if (syncingReservationRef.current) return;
    syncingReservationRef.current = true;
    // 예약을 오늘 접수로 자동 전환하는 함수

    try {
    const [reservations, receptions] = await Promise.all([
      fetchReservationsApi(),
      fetchReceptionsApi(),
    ]);
    const today = toLocalDateKey(new Date());
    const receptionsToday = receptions.filter((item) => isTodayReception(item, today));
    const linkedReservationIds = new Set(
      receptionsToday
        .map((item) => item.reservationId)
        .filter((value): value is number => typeof value === "number")
    );
    const completeReservation = async (reservation: (typeof reservations)[number]) => {
      await updateReservationApi(String(reservation.reservationId), {
        reservationNo: reservation.reservationNo,
        patientId: reservation.patientId,
        patientName: reservation.patientName ?? null,
        departmentId: reservation.departmentId,
        departmentName: reservation.departmentName ?? null,
        doctorId: reservation.doctorId ?? null,
        doctorName: reservation.doctorName ?? null,
        reservedAt: reservation.reservedAt,
        status: "COMPLETED",
        note: reservation.note ?? "예약 당일 자동 접수 연계 완료",
      });
    };
    const activeReceptionsByReservation = new Map<number, Reception[]>();
    for (const item of receptionsToday) {
      if (typeof item.reservationId !== "number") continue;
      if (isClosedReceptionStatus(item.status)) continue;
      const current = activeReceptionsByReservation.get(item.reservationId) ?? [];
      current.push(item);
      activeReceptionsByReservation.set(item.reservationId, current);
    }

    for (const group of activeReceptionsByReservation.values()) {
      if (group.length <= 1) continue;
      const keeper = [...group].sort((a, b) => a.receptionId - b.receptionId)[0];

      for (const item of group) {
        if (item.receptionId === keeper.receptionId) continue;
        await cancelReceptionApi(
          String(item.receptionId),
          "예약 자동연계 중복 데이터 자동 정리"
        );
      }
    }

    const alreadyLinkedTargets = reservations
      .filter((item) => normalizeReservationStatus(item.status) === "RESERVED")
      .filter((item) => extractDateKeyFromDateTime(item.reservedAt) === today)
      .filter((item) => linkedReservationIds.has(item.reservationId));

    for (const reservation of alreadyLinkedTargets) {
      await completeReservation(reservation);
    }

    const targets = reservations
      .filter((item) => normalizeReservationStatus(item.status) === "RESERVED")
      .filter((item) => extractDateKeyFromDateTime(item.reservedAt) === today)
      .filter((item) => !linkedReservationIds.has(item.reservationId))
      .sort((a, b) => a.reservationId - b.reservationId);

    if (targets.length === 0) return;

    for (const reservation of targets) {
      if (linkedReservationIds.has(reservation.reservationId)) {
        await completeReservation(reservation);
        continue;
      }

      await createReceptionApi({
        receptionNo: "",
        patientId: reservation.patientId,
        patientName: reservation.patientName ?? null,
        visitType: "OUTPATIENT",
        departmentId: reservation.departmentId,
        departmentName: reservation.departmentName ?? null,
        doctorId: reservation.doctorId ?? null,
        doctorName: reservation.doctorName ?? null,
        reservationId: reservation.reservationId,
        scheduledAt: reservation.reservedAt,
        arrivedAt: null,
        status: "WAITING",
        note: reservation.note ?? "예약 당일 자동 접수 생성",
      });
      linkedReservationIds.add(reservation.reservationId);

      await completeReservation(reservation);
    }
    } finally {
      syncingReservationRef.current = false;
    }
  }, []);
  const isCanceledView = initialSearchType === "status" && initialKeyword === "CANCELED";
  const todayList = React.useMemo(() => {
    const baseList = (isCanceledView
      ? list
      : list.filter((p) => normalizeStatus(p.status) !== "CANCELED")
    ).filter((p) => isTodayReception(p, todayKey));
    return [...baseList].sort(compareReceptionsByLatest);
  }, [isCanceledView, list, todayKey]);

  const statusCounts = React.useMemo(() => {
    return STATUS_FILTER_ITEMS.reduce<Record<StatusFilterKey, number>>(
      (acc, item) => {
        acc[item.key] = todayList.filter((reception) =>
          matchesStatusFilter(reception.status, item.key)
        ).length;
        return acc;
      },
      {
        ALL: 0,
        WAITING: 0,
        CALLED: 0,
        IN_PROGRESS: 0,
        TREATMENT_COMPLETED: 0,
        PAYMENT_COMPLETED: 0,
      }
    );
  }, [todayList]);

  const filteredList = React.useMemo(() => {
    return todayList.filter((reception) =>
      matchesStatusFilter(reception.status, statusFilter)
    );
  }, [todayList, statusFilter]);

  const refreshReceptionsByCurrentMode = React.useCallback(() => {
    const trimmedKeyword = initialKeyword.trim();
    if (autoSearch && trimmedKeyword) {
      dispatch(
        receptionActions.searchReceptionsRequest({
          type: initialSearchType,
          keyword: trimmedKeyword,
        })
      );
      return;
    }
    dispatch(receptionActions.fetchReceptionsRequest());
  }, [dispatch, autoSearch, initialKeyword, initialSearchType]);

  React.useEffect(() => {
    const initialize = async () => {
      if (autoSearch && initialKeyword.trim()) {
        refreshReceptionsByCurrentMode();
        return;
      }
      try {
        await syncTodayReservationsToWaitingReceptions();
      } catch (err: unknown) {
        dispatch(
          receptionActions.fetchReceptionsFailure(
            resolveErrorMessage(err, "예약 당일 자동 접수 생성 실패")
          )
        );
      }
      refreshReceptionsByCurrentMode();
    };

    void initialize();
  }, [
    dispatch,
    autoSearch,
    initialKeyword,
    initialSearchType,
    refreshReceptionsByCurrentMode,
    syncTodayReservationsToWaitingReceptions,
  ]);

  React.useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1
    );
    const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());

    const timer = window.setTimeout(() => {
      const runAtMidnight = async () => {
        setTodayKey(toLocalDateKey(new Date()));
        try {
          await syncTodayReservationsToWaitingReceptions();
        } catch (err: unknown) {
          dispatch(
            receptionActions.fetchReceptionsFailure(
              resolveErrorMessage(err, "예약 당일 자동 접수 생성 실패")
            )
          );
        }
        refreshReceptionsByCurrentMode();
      };
      void runAtMidnight();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    todayKey,
    dispatch,
    refreshReceptionsByCurrentMode,
    syncTodayReservationsToWaitingReceptions,
  ]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      refreshReceptionsByCurrentMode();
    }, RECEPTION_LIST_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [refreshReceptionsByCurrentMode]);
 // 10초마다 목록 재조회
  React.useEffect(() => {
    let active = true;

    const loadMasterData = async () => {
      try {
        setMasterDataLoading(true);
        setMasterDataError(null);
        const [departmentList, doctorList] = await Promise.all([
          fetchDepartmentsApi(),
          fetchDoctorsApi(),
        ]);
        if (!active) return;
        setDepartments(departmentList);
        setDoctors(doctorList);
      } catch (err: unknown) {
        if (!active) return;
        setMasterDataError(resolveErrorMessage(err, "진료과/의사 목록 조회 실패"));
      } finally {
        if (!active) return;
        setMasterDataLoading(false);
      }
    };

    void loadMasterData();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const streamUrl = `${RECEPTION_API_BASE}/api/receptions/events/stream`;
    const eventSource = new EventSource(streamUrl);

    const onStatusChanged = (rawEvent: Event) => {
      const event = rawEvent as MessageEvent<string>;
      try {
        const payload = JSON.parse(event.data) as ReceptionStatusChangedEvent;
        const nextStatus = (payload.toStatus ?? "").trim().toUpperCase();
        if (nextStatus !== NOTIFY_TARGET_STATUS) return;

        const eventKey = `${payload.receptionId ?? "unknown"}:${nextStatus}:${payload.changedAt ?? "unknown"}`;
        if (processedEventKeysRef.current.includes(eventKey)) return;

        processedEventKeysRef.current.push(eventKey);
        if (processedEventKeysRef.current.length > MAX_PROCESSED_EVENT_KEYS) {
          processedEventKeysRef.current.splice(
            0,
            processedEventKeysRef.current.length - MAX_PROCESSED_EVENT_KEYS
          );
        }

        const patientName = payload.patientName?.trim() || "환자";
        setNotificationQueue((prev) => [...prev, `${patientName}님이 진료중입니다`]);
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
    };
  }, []);

  React.useEffect(() => {
    let active = true;

    const loadPatients = async () => {
      try {
        setPatientCatalogLoading(true);
        setPatientCatalogError(null);
        const patients = await fetchPatientsApi();
        if (!active) return;
        setPatientCatalog(patients);
      } catch (err: unknown) {
        if (!active) return;
        const message =
          err instanceof Error && err.message ? err.message : "환자 목록 조회 실패";
        setPatientCatalogError(message);
      } finally {
        if (!active) return;
        setPatientCatalogLoading(false);
      }
    };

    void loadPatients();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    const byId = patientCatalog.reduce<Record<number, string>>((acc, item) => {
      if (item.patientId && item.name?.trim()) {
        acc[item.patientId] = item.name.trim();
      }
      return acc;
    }, {});
    setPatientNameById(byId);
  }, [patientCatalog]);

  React.useEffect(() => {
    if (!createModalOpen) return;
    const defaultDepartmentId = departments[0]?.departmentId ?? "";
    const defaultDoctorId =
      doctors.find((doctor) => String(doctor.departmentId ?? "") === String(defaultDepartmentId))?.doctorId ??
      null;
    setCreateModalForm({
      departmentId: defaultDepartmentId,
      doctorId: defaultDoctorId,
      arrivedTime: toLocalTimeValue(new Date()),
      note: "",
    });
  }, [createModalOpen, departments, doctors]);

  const openCreateWithPatient = React.useCallback((patient: Patient, nextKeyword?: string) => {
    if (!patient.patientId) return;
    const name = (nextKeyword ?? patient.name ?? "").trim();
    setKeyword(name);
    setPatientSuggestions([]);
    setOpenSuggestion(false);
    setPatientSearchResultCount(1);
    setCreateTargetPatient({
      patientId: patient.patientId,
      patientName: name,
    });
    setCreateModalOpen(true);
  }, []);

  const onOpenPatientListModal = () => {
    setPatientListKeyword("");
    setPatientListPage(1);
    setPatientCatalogError(null);
    setPatientListModalOpen(true);
  };

  const onClosePatientListModal = () => {
    setPatientListModalOpen(false);
  };

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) return alert("검색어는 필수입니다.");
    if (patientCatalogLoading) return;
    const normalized = kw.toLowerCase();
    const patients = patientCatalog.filter((patient) => {
      const name = (patient.name ?? "").toLowerCase();
      const patientId = String(patient.patientId ?? "");
      return name.includes(normalized) || patientId.includes(normalized);
    });

    setPatientSearchResultCount(patients.length);

    if (patients.length === 0) {
      setPatientSuggestions([]);
      setOpenSuggestion(false);
      setCreateTargetPatient({
        patientId: null,
        patientName: kw,
      });
      setCreateModalOpen(true);
      return;
    }

    if (patients.length === 1 && patients[0]?.patientId) {
      const single = patients[0];
      const nextKeyword = single.name?.trim() ?? kw;
      openCreateWithPatient(single, nextKeyword);
      return;
    }

    const suggestions = patients.slice(0, 8);
    setPatientSuggestions(suggestions);
    setOpenSuggestion(suggestions.length > 0);
  };

  const onReset = () => {
    setKeyword("");
    setPatientSuggestions([]);
    setOpenSuggestion(false);
    setPatientSearchResultCount(null);
  };

  const onSelect = (p: Reception) => {
    dispatch(receptionActions.fetchReceptionSuccess(p));
    dispatch(receptionActions.fetchReceptionRequest({ receptionId: String(p.receptionId) }));
  };

  const onCancel = (receptionId: string) => {
    if (!confirm("접수를 취소 처리하시겠습니까?")) return;
    dispatch(receptionActions.cancelReceptionRequest({ receptionId }));
  };

  React.useEffect(() => {
    const kw = keyword.trim();
    if (!kw) {
      setPatientSuggestions([]);
      setOpenSuggestion(false);
      return;
    }

    const normalized = kw.toLowerCase();
    const timer = setTimeout(() => {
      const byName = patientCatalog.filter((patient) => {
        const name = (patient.name ?? "").toLowerCase();
        const patientId = String(patient.patientId ?? "");
        return name.includes(normalized) || patientId.includes(normalized);
      });
      setPatientSuggestions(byName.slice(0, 8));
      setOpenSuggestion(byName.length > 0);
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [keyword, patientCatalog]);

  const onPickPatientSuggestion = (patient: Patient) => {
    const nextKeyword = patient.name?.trim() ?? "";
    openCreateWithPatient(patient, nextKeyword);
  };

  React.useEffect(() => {
    if (!patientListModalOpen) return;
    if (patientCatalog.length > 0) return;
    let active = true;

    const loadPatients = async () => {
      try {
        setPatientCatalogLoading(true);
        setPatientCatalogError(null);
        const patients = await fetchPatientsApi();
        if (!active) return;
        setPatientCatalog(patients);
      } catch (err: unknown) {
        if (!active) return;
        const message =
          err instanceof Error && err.message ? err.message : "환자 목록 조회 실패";
        setPatientCatalogError(message);
      } finally {
        if (!active) return;
        setPatientCatalogLoading(false);
      }
    };

    void loadPatients();
    return () => {
      active = false;
    };
  }, [patientListModalOpen, patientCatalog.length]);

  const filteredPatientCatalog = React.useMemo(() => {
    const kw = patientListKeyword.trim().toLowerCase();
    if (!kw) return patientCatalog;
    return patientCatalog.filter((patient) => {
      const fields = [
        patient.name,
        patient.patientNo,
        patient.phone,
        patient.birthDate,
        patient.patientId ? String(patient.patientId) : "",
      ];
      return fields.some((value) => (value ?? "").toLowerCase().includes(kw));
    });
  }, [patientCatalog, patientListKeyword]);

  const patientListTotalPages = Math.max(
    1,
    Math.ceil(filteredPatientCatalog.length / PATIENT_LIST_ITEMS_PER_PAGE)
  );
  const pagedPatientCatalog = React.useMemo(() => {
    const start = (patientListPage - 1) * PATIENT_LIST_ITEMS_PER_PAGE;
    return filteredPatientCatalog.slice(start, start + PATIENT_LIST_ITEMS_PER_PAGE);
  }, [filteredPatientCatalog, patientListPage]);

  React.useEffect(() => {
    setPatientListPage((prev) => Math.min(prev, patientListTotalPages));
  }, [patientListTotalPages]);

  const onSelectPatientFromListModal = (patient: Patient) => {
    onClosePatientListModal();
    openCreateWithPatient(patient);
  };

  const doctorsForSelectedDepartment = React.useMemo(() => {
    if (!createModalForm.departmentId) return doctors;
    return doctors.filter(
      (doctor) => String(doctor.departmentId ?? "") === String(createModalForm.departmentId)
    );
  }, [createModalForm.departmentId, doctors]);

  const onCreateModalSubmit = () => {
    const patientName = createTargetPatient.patientName.trim();
    if (!patientName) {
      alert("환자 이름을 입력해주세요.");
      return;
    }

    const department = departments.find(
      (item) => String(item.departmentId) === String(createModalForm.departmentId)
    );
    if (!department) return;

    const doctor =
      doctors.find((item) => item.doctorId === createModalForm.doctorId) ??
      doctors.find((item) => String(item.departmentId ?? "") === String(department.departmentId)) ??
      null;
    const arrivedTime = createModalForm.arrivedTime || "00:00";
    const arrivedAt = `${todayKey}T${arrivedTime}`;

    dispatch(
      receptionActions.createReceptionRequest({
        receptionNo: "",
        patientId: createTargetPatient.patientId ?? null,
        patientName,
        visitType: "OUTPATIENT",
        departmentId: department.departmentId,
        departmentName: null,
        doctorId: doctor?.doctorId ?? null,
        doctorName: null,
        scheduledAt: null,
        arrivedAt,
        status: "WAITING",
        note: createModalForm.note.trim() ? createModalForm.note.trim() : null,
      })
    );

    setPage(1);
    setCreateModalOpen(false);
    setPatientSuggestions([]);
    setOpenSuggestion(false);
  };

  const onCreateModalClose = () => {
    setCreateModalOpen(false);
  };

  const totalCount = filteredList.length;
  const todayTotalCount = todayList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const pagedList = React.useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, page]);
  React.useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter]);
  React.useEffect(() => {
    if (!pagedList.length) return;
    const first = pagedList[0];
    if (!selected || !pagedList.some((p) => p.receptionId === selected.receptionId)) {
      dispatch(receptionActions.fetchReceptionSuccess(first));
      dispatch(
        receptionActions.fetchReceptionRequest({ receptionId: String(first.receptionId) })
      );
      return;
    }
    const selectedInPage = pagedList.find((p) => p.receptionId === selected.receptionId);
    if (
      selectedInPage &&
      (normalizeStatus(selected.status) !== normalizeStatus(selectedInPage.status) ||
        selected.patientName !== selectedInPage.patientName ||
        selected.departmentName !== selectedInPage.departmentName ||
        selected.doctorName !== selectedInPage.doctorName)
    ) {
      dispatch(
        receptionActions.fetchReceptionSuccess({
          ...selected,
          ...selectedInPage,
        })
      );
    }
    if (!selected.patientName && !selected.departmentName && !selected.doctorName) {
      dispatch(
        receptionActions.fetchReceptionRequest({
          receptionId: String(selected.receptionId),
        })
      );
    }
  }, [pagedList, selected, dispatch]);
  const primary =
    selected && pagedList.some((p) => p.receptionId === selected.receptionId)
      ? selected
      : pagedList[0] ?? filteredList[0];
  const primaryName = primary ? resolvePatientDisplayName(primary, patientNameById) : "";
  const primaryDepartment = primary
    ? resolveOutpatientDepartmentName(primary, departments)
    : "-";
  const primaryDoctor = primary
    ? resolveOutpatientDoctorName(primary, doctors)
    : "";
  const avatarLabel = primaryName
    ? primaryName.slice(0, 1)
    : primary?.patientId
    ? String(primary.patientId).slice(-2)
    : "R";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card
        sx={{
          borderRadius: 3.5,
          border: "1px solid rgba(123, 146, 183, 0.25)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,248,255,0.95) 58%, rgba(235,244,255,0.95))",
          boxShadow: "0 14px 26px rgba(23, 52, 97, 0.12)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, overflow: "visible" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Stack spacing={0.35} sx={{ minWidth: 120 }}>
              <Typography fontWeight={900} sx={{ color: "#1f4f95", letterSpacing: -0.1 }}>
                {"환자 검색"}
              </Typography>
              <Typography sx={{ color: "#6f819f", fontSize: 12, fontWeight: 600 }}>
                {"이름 조회 후 바로 접수 등록"}
              </Typography>
            </Stack>
            <Box sx={{ width: { xs: "100%", md: 380 }, position: "relative" }}>
              <TextField
                size="small"
                placeholder={"환자 이름 입력"}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPatientSearchResultCount(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                onFocus={() => {
                  if (patientSuggestions.length > 0) {
                    setOpenSuggestion(true);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 19, color: "#7f93b5" }} />
                    </InputAdornment>
                  ),
                }}
                helperText={
                  patientSearchResultCount === null
                    ? " "
                    : patientSearchResultCount === 0
                    ? "일치 환자 없음"
                    : `검색 결과 ${patientSearchResultCount}명`
                }
                FormHelperTextProps={{
                  sx: {
                    mt: 0.65,
                    ml: 0.25,
                    fontWeight: 700,
                    fontSize: 12,
                    color:
                      patientSearchResultCount === 0
                        ? "#d32f2f"
                        : "#6b7a96",
                  },
                }}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    bgcolor: "rgba(255,255,255,0.9)",
                    borderRadius: 2.25,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(79, 111, 163, 0.28)",
                  },
                  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(43, 90, 169, 0.48)",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2b5aa9",
                    borderWidth: 2,
                  },
                }}
              />
              {openSuggestion && patientSuggestions.length > 0 && (
                <Card
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    zIndex: 1400,
                    borderRadius: 2,
                    border: "1px solid rgba(90, 121, 174, 0.24)",
                    boxShadow: "0 14px 28px rgba(23, 52, 97, 0.2)",
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  <Stack spacing={0}>
                    {patientSuggestions.map((p) => (
                      <Button
                        key={p.patientId}
                        onClick={() => onPickPatientSuggestion(p)}
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          px: 1.7,
                          py: 1.1,
                          borderRadius: 0,
                          color: "#1f2a44",
                          borderBottom: "1px solid #edf2fb",
                          "&:hover": {
                            bgcolor: "rgba(43, 90, 169, 0.08)",
                          },
                        }}
                      >
                        <Box sx={{ textAlign: "left", width: "100%" }}>
                          <Typography fontWeight={700} noWrap>
                            {p.name} · {p.gender ?? "-"} · {p.birthDate ?? "-"}
                          </Typography>
                          <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                            환자ID {p.patientId} · {p.phone ?? "-"} · {p.patientNo ?? "-"}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </Stack>
                </Card>
              )}
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={onSearch}
                disabled={loading}
                sx={{
                  px: 2.1,
                  borderRadius: 2,
                  bgcolor: "#2b5aa9",
                  boxShadow: "0 8px 18px rgba(43,90,169,0.28)",
                  "&:hover": { bgcolor: "#244e95" },
                }}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onReset}
                disabled={loading}
                sx={{
                  px: 1.8,
                  borderRadius: 2,
                  color: "#2b5aa9",
                  borderColor: "rgba(43,90,169,0.4)",
                  bgcolor: "rgba(255,255,255,0.85)",
                  "&:hover": {
                    borderColor: "#2b5aa9",
                    bgcolor: "rgba(43,90,169,0.07)",
                  },
                }}
              >
                초기화
              </Button>
              <Button
                variant="outlined"
                startIcon={<ListAltIcon />}
                onClick={onOpenPatientListModal}
                disabled={loading}
                sx={{
                  px: 1.8,
                  borderRadius: 2,
                  color: "#1f4f95",
                  borderColor: "rgba(31,79,149,0.38)",
                  bgcolor: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    borderColor: "#1f4f95",
                    bgcolor: "rgba(31,79,149,0.08)",
                  },
                }}
              >
                환자목록
              </Button>
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={`오늘 ${todayTotalCount}`} color="primary" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            md: "260px minmax(0, 1fr)",
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #dbe5f5",
              boxShadow: "0 12px 24px rgba(23, 52, 97, 0.12)",
            }}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 110,
                    height: 110,
                    bgcolor: "#d7e6ff",
                    color: "#2b5aa9",
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  {avatarLabel}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>
                    {primary
                      ? primaryName || `환자 ${primary.patientId ?? "-"}`
                      : "접수 미선택"}
                  </Typography>
                  <Box sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    {primary ? (
                      <Typography
                        component={Link}
                        href={`/reception/outpatient/detail/${primary.receptionId}`}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          color: "#2b5aa9",
                          textDecoration: "none",
                          fontWeight: 700,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {primary.receptionNo}
                      </Typography>
                    ) : (
                      "-"
                    )}
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    환자 이름
                  </Typography>
                  <Typography fontWeight={600}>
                    {primaryName || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    진료과
                  </Typography>
                  <Typography fontWeight={600}>
                    {primaryDepartment}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    의사 이름
                  </Typography>
                  <Typography fontWeight={600}>
                    {primaryDoctor || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    내원유형
                  </Typography>
                  <Typography fontWeight={600}>
                    {visitTypeLabel(primary?.visitType)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    상태
                  </Typography>
                  <Typography fontWeight={600}>
                    {statusLabel(primary?.status)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  sx={{ color: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/outpatient/detail/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/outpatient/edit/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  접수 수정
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #dbe5f5",
              boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 1 }}>
                  <Typography fontWeight={800}>외래접수목록</Typography>
                  <Chip label={`선택 ${totalCount} / 오늘 ${todayTotalCount}`} size="small" color="primary" />
                </Stack>
                <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
                  {STATUS_FILTER_ITEMS.map((item) => {
                    const selectedFilter = statusFilter === item.key;
                    return (
                      <Button
                        key={item.key}
                        size="small"
                        variant={selectedFilter ? "contained" : "outlined"}
                        onClick={() => setStatusFilter(item.key)}
                        sx={{
                          borderRadius: 999,
                          minWidth: "auto",
                          px: 1.2,
                          py: 0.35,
                          fontSize: 12,
                          fontWeight: 700,
                          lineHeight: 1.35,
                          textTransform: "none",
                          bgcolor: selectedFilter ? "#2b5aa9" : "#fff",
                          color: selectedFilter ? "#fff" : "#2b5aa9",
                          borderColor: "rgba(43,90,169,0.45)",
                          "&:hover": {
                            borderColor: "#2b5aa9",
                            bgcolor: selectedFilter ? "#234c91" : "rgba(43,90,169,0.06)",
                          },
                        }}
                      >
                        {`${item.label}(${statusCounts[item.key]}명)`}
                      </Button>
                    );
                  })}
                </Stack>

                <Stack spacing={1}>
                  {pagedList.map((p) => {
                    const isSelected = selected?.receptionId === p.receptionId;
                    const displayPatientName = resolvePatientDisplayName(
                      p,
                      patientNameById
                    );
                    const rowStatusLabel = statusLabel(p.status);
                    return (
                      <Box
                        key={p.receptionId}
                        onClick={() => onSelect(p)}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "48px minmax(0, 1fr) auto",
                          alignItems: "center",
                          gap: 1.5,
                          px: 1.5,
                          py: 1.2,
                          borderRadius: 2,
                          bgcolor: isSelected ? "rgba(43,90,169,0.08)" : "transparent",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f1f6ff" },
                        }}
                      >
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#d7e6ff", color: "#2b5aa9" }}>
                          {displayPatientName
                            ? displayPatientName.slice(0, 1)
                            : String(p.patientId ?? "?").slice(-2)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            component={Link}
                            href={`/reception/outpatient/detail/${p.receptionId}`}
                            onClick={(e) => e.stopPropagation()}
                            fontWeight={700}
                            noWrap
                            sx={{
                              color: "#2b5aa9",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            {p.receptionNo}
                          </Typography>
                            <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                            {displayPatientName} ·{" "}
                            {resolveOutpatientDepartmentName(p, departments)} ·{" "}
                            {statusLabel(p.status)}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Chip
                            label={rowStatusLabel}
                            size="small"
                            variant="filled"
                            sx={{
                              height: 24,
                              borderRadius: 999,
                              fontWeight: 800,
                              fontSize: 11,
                              minWidth: 58,
                              "& .MuiChip-label": { px: 1.15 },
                              boxShadow: "0 2px 6px rgba(16, 38, 72, 0.25)",
                              ...statusChipSx(p.status),
                            }}
                          />
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancel(String(p.receptionId));
                            }}
                          >
                            <BlockOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    );
                  })}

                  {filteredList.length === 0 && (
                    <Typography color="#7b8aa9">조회된 접수가 없습니다.</Typography>
                  )}
                </Stack>
                {filteredList.length > 0 && totalPages > 1 && (
                  <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
                    <Pagination
                      page={page}
                      count={totalPages}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                      size="small"
                    />
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

      </Box>

      <Dialog open={Boolean(activeNotification)} onClose={closeNotification} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>진료 알림</DialogTitle>
        <DialogContent>
          <Typography>{activeNotification}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNotification} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={patientListModalOpen}
        onClose={onClosePatientListModal}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={900}>
                환자목록
              </Typography>
              <Chip label={`총 ${filteredPatientCatalog.length}`} color="primary" />
            </Stack>

            <TextField
              size="small"
              placeholder="이름/환자번호/연락처로 검색"
              value={patientListKeyword}
              onChange={(e) => {
                setPatientListKeyword(e.target.value);
                setPatientListPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 19, color: "#7f93b5" }} />
                  </InputAdornment>
                ),
              }}
            />

            {patientCatalogLoading ? (
              <Typography sx={{ color: "#7b8aa9" }}>환자 목록 불러오는 중...</Typography>
            ) : (
              <Stack spacing={1}>
                {pagedPatientCatalog.map((patient) => (
                  <Button
                    key={patient.patientId}
                    onClick={() => onSelectPatientFromListModal(patient)}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      px: 1.6,
                      py: 1.25,
                      borderRadius: 2,
                      color: "#1f2a44",
                      border: "1px solid #e3ebf8",
                      bgcolor: "#fff",
                      "&:hover": {
                        borderColor: "#9cb5de",
                        bgcolor: "rgba(43,90,169,0.06)",
                      },
                    }}
                  >
                    <Box sx={{ textAlign: "left", width: "100%", minWidth: 0 }}>
                      <Typography fontWeight={800} noWrap>
                        {patient.name} · {genderLabel(patient.gender)} · {patient.birthDate ?? "-"}
                      </Typography>
                      <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                        환자ID {patient.patientId} · {patient.patientNo ?? "-"} · {patient.phone ?? "-"}
                      </Typography>
                    </Box>
                  </Button>
                ))}
                {!pagedPatientCatalog.length && (
                  <Typography sx={{ color: "#7b8aa9" }}>조회된 환자가 없습니다.</Typography>
                )}
              </Stack>
            )}

            {filteredPatientCatalog.length > 0 && patientListTotalPages > 1 && (
              <Stack direction="row" justifyContent="center">
                <Pagination
                  page={patientListPage}
                  count={patientListTotalPages}
                  onChange={(_, value) => setPatientListPage(value)}
                  color="primary"
                  size="small"
                />
              </Stack>
            )}

            {patientCatalogError && (
              <Typography color="error" fontWeight={700}>
                {patientCatalogError}
              </Typography>
            )}

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="text" onClick={onClosePatientListModal}>
                닫기
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createModalOpen}
        onClose={onCreateModalClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={1.75}>
            <Typography variant="h5" fontWeight={900}>
              {"접수 등록"}
            </Typography>

            <TextField
              select
              size="small"
              label={"진료과"}
              value={createModalForm.departmentId}
              onChange={(e) => {
                const departmentId = e.target.value;
                const nextDoctorId =
                  doctors.find((doctor) => String(doctor.departmentId ?? "") === String(departmentId))
                    ?.doctorId ?? null;
                setCreateModalForm((prev) => ({
                  ...prev,
                  departmentId,
                  doctorId: nextDoctorId,
                }));
              }}
              fullWidth
            >
              {departments.map((item) => (
                <MenuItem key={item.departmentId} value={String(item.departmentId)}>
                  {item.departmentName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label={"담당의"}
              value={createModalForm.doctorId ?? ""}
              onChange={(e) => {
                const doctorId = Number(e.target.value);
                const doctor = doctors.find((item) => item.doctorId === doctorId);
                setCreateModalForm((prev) => ({
                  ...prev,
                  doctorId,
                  departmentId: doctor?.departmentId ? String(doctor.departmentId) : prev.departmentId,
                }));
              }}
              fullWidth
            >
              {doctorsForSelectedDepartment.map((item) => (
                <MenuItem key={item.doctorId} value={item.doctorId}>
                  {item.doctorName}
                </MenuItem>
              ))}
              {!doctorsForSelectedDepartment.length && (
                <MenuItem disabled value="">
                  담당의 없음
                </MenuItem>
              )}
            </TextField>

            {masterDataError && (
              <Typography color="error" fontWeight={700}>
                {masterDataError}
              </Typography>
            )}

            <TextField
              size="small"
              label={"내원유형"}
              value={"외래"}
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
              {"접수 등록은 외래 접수만 지원합니다."}
            </Typography>

            <TextField
              size="small"
              type="time"
              label={"내원 시간(선택)"}
              value={createModalForm.arrivedTime}
              onChange={(e) =>
                setCreateModalForm((prev) => ({
                  ...prev,
                  arrivedTime: e.target.value,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
              {`적용 날짜: ${todayKey} (오늘)`}
            </Typography>

            <TextField
              size="small"
              label={"접수 메모(선택)"}
              value={createModalForm.note}
              onChange={(e) =>
                setCreateModalForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              fullWidth
            />

            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button variant="text" onClick={onCreateModalClose} disabled={loading}>
                {"취소"}
              </Button>
              <Button
                variant="contained"
                onClick={onCreateModalSubmit}
                disabled={
                  loading ||
                  masterDataLoading ||
                  !createTargetPatient.patientName.trim() ||
                  !createModalForm.departmentId
                }
                sx={{ bgcolor: "#2b5aa9" }}
              >
                {"저장"}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {error && (
        <Typography color="error" fontWeight={800}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
