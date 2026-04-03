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
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Reception/ReceptionSlice";
import type { Reception, ReceptionSearchPayload } from "@/features/Reception/ReceptionTypes";
import { formatDepartmentName } from "@/lib/departmentLabel";
import type { Patient } from "@/features/patients/patientTypes";
import { fetchPatientsApi, searchPatientsApi } from "@/lib/reception/patientApi";
import { fetchReservationsApi } from "@/lib/reception/reservationAdminApi";
import { buildNextReceptionNumber } from "@/lib/reception/receptionNumber";
import { createReceptionApi, fetchReceptionsApi } from "@/lib/reception/receptionApi";

const SEARCH_OPTIONS: { label: string; value: ReceptionSearchPayload["type"] }[] = [
  { label: "접수번호", value: "receptionNo" },
  { label: "환자이름", value: "patientName" },
];

const TAB_LABELS = ["기본정보", "진료기록", "검사", "처방", "입원"];

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

const statusLabel = (value?: string | null) => {
  switch (value) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "완료";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "ON_HOLD":
      return "보류";
    case "CANCELED":
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
    case "완료":
      return "COMPLETED";
    case "수납대기":
      return "PAYMENT_WAIT";
    case "보류":
      return "ON_HOLD";
    case "취소":
      return "CANCELED";
    case "비활성":
      return "INACTIVE";
    default:
      return trimmed;
  }
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

const extractDateKeyFromReceptionNo = (value?: string | null) => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})-/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const isTodayReception = (item: Reception, todayKey: string) => {
  const candidates = [
    extractDateKeyFromDateTime(item.arrivedAt),
    extractDateKeyFromDateTime(item.scheduledAt),
    extractDateKeyFromDateTime(item.createdAt),
    extractDateKeyFromDateTime(item.updatedAt),
    extractDateKeyFromReceptionNo(item.receptionNo),
  ];
  return candidates.some((dateKey) => dateKey === todayKey);
};

type ReceptionListProps = {
  initialSearchType?: ReceptionSearchPayload["type"];
  initialKeyword?: string;
  autoSearch?: boolean;
};

export default function ReceptionList({
  initialSearchType = "receptionNo",
  initialKeyword = "",
  autoSearch = false,
}: ReceptionListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.receptions
  );

  const [searchType, setSearchType] = React.useState<
    ReceptionSearchPayload["type"]
  >(initialSearchType);
  const [keyword, setKeyword] = React.useState(initialKeyword);
  const [tab, setTab] = React.useState(0);
  const [patientSuggestions, setPatientSuggestions] = React.useState<Patient[]>([]);
  const [openSuggestion, setOpenSuggestion] = React.useState(false);
  const [patientNameById, setPatientNameById] = React.useState<Record<number, string>>({});
  const [todayKey, setTodayKey] = React.useState(() => toLocalDateKey(new Date()));

  const syncTodayReservationsToWaitingReceptions = React.useCallback(async () => {
    const [reservations, receptions] = await Promise.all([
      fetchReservationsApi(),
      fetchReceptionsApi(),
    ]);
    const today = toLocalDateKey(new Date());
    const linkedReservationIds = new Set(
      receptions
        .map((item) => item.reservationId)
        .filter((value): value is number => typeof value === "number")
    );
    const receptionNumbers = receptions.map((item) => item.receptionNo);

    const targets = reservations
      .filter((item) => normalizeReservationStatus(item.status) === "RESERVED")
      .filter((item) => extractDateKeyFromDateTime(item.reservedAt) === today)
      .filter((item) => !linkedReservationIds.has(item.reservationId))
      .sort((a, b) => a.reservationId - b.reservationId);

    if (targets.length === 0) return;

    for (const reservation of targets) {
      const nextReceptionNo = buildNextReceptionNumber({
        existingNumbers: receptionNumbers,
        startSequence: 1,
      });
      receptionNumbers.push(nextReceptionNo);

      await createReceptionApi({
        receptionNo: nextReceptionNo,
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
    }
  }, []);
  const isCanceledView = initialSearchType === "status" && initialKeyword === "CANCELED";
  const filteredList = React.useMemo(
    () =>
      (isCanceledView
        ? list
        : list.filter((p) => normalizeStatus(p.status) !== "CANCELED")
      ).filter((p) => isTodayReception(p, todayKey)),
    [isCanceledView, list, todayKey]
  );

  React.useEffect(() => {
    const initialize = async () => {
      if (autoSearch && initialKeyword.trim()) {
        dispatch(
          receptionActions.searchReceptionsRequest({
            type: initialSearchType,
            keyword: initialKeyword.trim(),
          })
        );
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
      } finally {
        dispatch(receptionActions.fetchReceptionsRequest());
      }
    };

    void initialize();
  }, [
    dispatch,
    autoSearch,
    initialKeyword,
    initialSearchType,
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
        } finally {
          dispatch(receptionActions.fetchReceptionsRequest());
        }
      };
      void runAtMidnight();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [todayKey, dispatch, syncTodayReservationsToWaitingReceptions]);

  React.useEffect(() => {
    let active = true;
    const loadPatients = async () => {
      try {
        const patients = await fetchPatientsApi();
        if (!active) return;
        const byId = patients.reduce<Record<number, string>>((acc, item) => {
          if (item.patientId && item.name?.trim()) {
            acc[item.patientId] = item.name.trim();
          }
          return acc;
        }, {});
        setPatientNameById(byId);
      } catch {
        if (!active) return;
        setPatientNameById({});
      }
    };
    loadPatients();
    return () => {
      active = false;
    };
  }, []);


  React.useEffect(() => {
    if (!filteredList.length) return;
    const first = filteredList[0];
    if (!selected || !filteredList.some((p) => p.receptionId === selected.receptionId)) {
      dispatch(receptionActions.fetchReceptionSuccess(first));
      dispatch(receptionActions.fetchReceptionRequest({ receptionId: String(first.receptionId) }));
      return;
    }
    if (!selected.patientName && !selected.departmentName && !selected.doctorName) {
      dispatch(
        receptionActions.fetchReceptionRequest({
          receptionId: String(selected.receptionId),
        })
      );
    }
  }, [filteredList, selected, dispatch]);

  const resolveReceptionPatientName = React.useCallback(
    (item: Reception) =>
      (item.patientId ? patientNameById[item.patientId] : "") ||
      item.patientName?.trim() ||
      "",
    [patientNameById]
  );

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) return alert("검색어는 필수입니다.");
    setOpenSuggestion(false);
    if (searchType === "patientName") {
      const run = async () => {
        try {
          const all = await fetchReceptionsApi();
          const lowered = kw.toLowerCase();
          const filtered = all.filter((item) =>
            resolveReceptionPatientName(item).toLowerCase().includes(lowered)
          );
          dispatch(receptionActions.fetchReceptionsSuccess(filtered));
        } catch (err: unknown) {
          dispatch(
            receptionActions.fetchReceptionsFailure(
              resolveErrorMessage(err, "접수 검색 실패")
            )
          );
        }
      };
      void run();
      return;
    }
    dispatch(receptionActions.searchReceptionsRequest({ type: searchType, keyword: kw }));
  };

  const onReset = () => {
    setKeyword("");
    setSearchType("receptionNo");
    dispatch(receptionActions.fetchReceptionsRequest());
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
    if (!kw || searchType !== "patientName") {
      setPatientSuggestions([]);
      setOpenSuggestion(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const byName = await searchPatientsApi("name", kw);
        if (!active) return;
        setPatientSuggestions(byName.slice(0, 8));
        setOpenSuggestion(byName.length > 0);
      } catch {
        if (!active) return;
        setPatientSuggestions([]);
        setOpenSuggestion(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [keyword, searchType]);

  const onPickPatientSuggestion = (patient: Patient) => {
    const nextKeyword = patient.name?.trim() ?? "";
    if (!nextKeyword) return;
    setSearchType("patientName");
    setKeyword(nextKeyword);
    setOpenSuggestion(false);
    const run = async () => {
      try {
        const all = await fetchReceptionsApi();
        const lowered = nextKeyword.toLowerCase();
        const filtered = all.filter((item) =>
          resolveReceptionPatientName(item).toLowerCase().includes(lowered)
        );
        dispatch(receptionActions.fetchReceptionsSuccess(filtered));
      } catch (err: unknown) {
        dispatch(
          receptionActions.fetchReceptionsFailure(
            resolveErrorMessage(err, "접수 검색 실패")
          )
        );
      }
    };
    void run();
  };

  const primary =
    selected && filteredList.some((p) => p.receptionId === selected.receptionId)
      ? selected
      : filteredList[0];
  const primaryName =
    (primary?.patientId ? patientNameById[primary.patientId] : "") ||
    primary?.patientName?.trim() ||
    "";
  const primaryDepartment = formatDepartmentName(
    primary?.departmentName,
    primary?.departmentId
  );
  const primaryDoctor = primary?.doctorName?.trim() || "";
  const avatarLabel = primaryName
    ? primaryName.slice(0, 1)
    : primary?.patientId
    ? String(primary.patientId).slice(-2)
    : "R";
  const totalCount = filteredList.length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          boxShadow: "0 12px 24px rgba(23, 52, 97, 0.12)",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Typography fontWeight={800} sx={{ color: "#2b5aa9", minWidth: 110 }}>
              접수 검색
            </Typography>
            <TextField
              select
              size="small"
              value={searchType}
              onChange={(e) =>
                setSearchType(e.target.value as ReceptionSearchPayload["type"])
              }
              sx={{ width: { xs: "100%", md: 180 } }}
            >
              {SEARCH_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ width: { xs: "100%", md: 360 }, position: "relative" }}>
              <TextField
                size="small"
                placeholder="검색어 입력"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                onFocus={() => {
                  if (patientSuggestions.length > 0) {
                    setOpenSuggestion(true);
                  }
                }}
                sx={{ width: "100%" }}
              />
              {openSuggestion && patientSuggestions.length > 0 && (
                <Card
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    borderRadius: 2,
                    border: "1px solid #dbe5f5",
                    boxShadow: "0 10px 24px rgba(23, 52, 97, 0.18)",
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
                          px: 1.5,
                          py: 1,
                          borderRadius: 0,
                          color: "#1f2a44",
                          borderBottom: "1px solid #eef3fb",
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
                sx={{ bgcolor: "#2b5aa9" }}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onReset}
                disabled={loading}
                sx={{ color: "#2b5aa9" }}
              >
                초기화
              </Button>
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={`오늘 ${totalCount}`} color="primary" />
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
                        href={`/receptions/${primary.receptionId}`}
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
                  href={primary ? `/receptions/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/receptions/${primary.receptionId}/edit` : "#"}
                  disabled={!primary}
                >
                  접수 수정
                </Button>
                <Button
                  variant="outlined"
                  sx={{ color: "#2b5aa9" }}
                  component={Link}
                  href="/reservations"
                >
                  예약 관리
                </Button>
                <Button variant="outlined" sx={{ color: "#2b5aa9" }}>
                  검사 기록
                </Button>
                <Button variant="outlined" sx={{ color: "#2b5aa9" }}>
                  처방 이력
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
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={800}>환자리스트</Typography>
                  <Chip label={`오늘 ${totalCount}`} size="small" color="primary" />
                </Stack>

                <Tabs
                  value={tab}
                  onChange={(_, value) => setTab(value)}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    "& .MuiTab-root": {
                      minHeight: 32,
                      fontSize: 13,
                      color: "#5f6f93",
                    },
                    "& .Mui-selected": { color: "#2b5aa9" },
                  }}
                >
                  {TAB_LABELS.map((label) => (
                    <Tab key={label} label={label} />
                  ))}
                </Tabs>

                <Stack spacing={1}>
                  {filteredList.map((p) => {
                    const isSelected = selected?.receptionId === p.receptionId;
                    const displayPatientName =
                      (p.patientId ? patientNameById[p.patientId] : "") ||
                      p.patientName?.trim() ||
                      `환자 ${p.patientId ?? "-"}`;
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
                            href={`/receptions/${p.receptionId}`}
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
                            {displayPatientName}{" "}
                            ·{" "}
                            {formatDepartmentName(p.departmentName, p.departmentId)} ·{" "}
                            {statusLabel(p.status)}
                          </Typography>
                        </Box>
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
                      </Box>
                    );
                  })}

                  {filteredList.length === 0 && (
                    <Typography color="#7b8aa9">조회된 접수가 없습니다.</Typography>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>

      </Box>

      {error && (
        <Typography color="error" fontWeight={800}>
          {error}
        </Typography>
      )}
    </Box>
  );
}


