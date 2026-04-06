"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  InputAdornment,
  IconButton,
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
import { emergencyReceptionActions } from "@/features/EmergencyReception/EmergencyReceptionSlice";
import type {
  EmergencyReception,
  EmergencyReceptionForm,
} from "@/features/EmergencyReception/EmergencyReceptionTypes";
import type { Patient } from "@/features/patients/patientTypes";
import { fetchPatientsApi, searchPatientsApi } from "@/lib/patient/patientApi";

const statusLabel = (value?: string | null) => {
  switch ((value ?? "").toUpperCase()) {
    case "REGISTERED":
      return "접수 완료";
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "TRIAGE":
      return "중증도분류";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "완료";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "OBSERVATION":
      return "관찰중";
    case "ON_HOLD":
      return "보류";
    case "CANCELED":
      return "취소";
    case "INACTIVE":
      return "비활성";
    case "TRANSFERRED":
      return "전원";
    default:
      return value ?? "-";
  }
};

const normalizeEmergencyStatus = (value?: string | null) => {
  if (!value) return value;
  const raw = value.trim();
  const upper = raw.toUpperCase();

  const map: Record<string, string> = {
    REGISTERED: "REGISTERED",
    WAITING: "WAITING",
    CALLED: "CALLED",
    TRIAGE: "TRIAGE",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    PAYMENT_WAIT: "PAYMENT_WAIT",
    OBSERVATION: "OBSERVATION",
    ON_HOLD: "ON_HOLD",
    CANCELED: "CANCELED",
    CANCELLED: "CANCELED",
    INACTIVE: "INACTIVE",
    TRANSFERRED: "TRANSFERRED",
    "접수완료": "REGISTERED",
    "접수 완료": "REGISTERED",
    "대기": "WAITING",
    "호출": "CALLED",
    "중증도분류": "TRIAGE",
    "진행중": "IN_PROGRESS",
    "완료": "COMPLETED",
    "취소": "CANCELED",
    "비활성": "INACTIVE",
    "전원": "TRANSFERRED",
  };

  return map[upper] ?? map[raw] ?? raw;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
};

const summarizeOneLine = (value?: string | null, max = 18) => {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "-";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
};

const ITEMS_PER_PAGE = 10;
const PATIENT_LIST_ITEMS_PER_PAGE = 8;

export default function EmergencyReceptionList() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.emergencyReceptions
  );

  const [keyword, setKeyword] = React.useState("");
  const [patientSuggestions, setPatientSuggestions] = React.useState<Patient[]>([]);
  const [openSuggestion, setOpenSuggestion] = React.useState(false);
  const [patientSearchResultCount, setPatientSearchResultCount] = React.useState<number | null>(
    null
  );
  const [patientNameById, setPatientNameById] = React.useState<Record<number, string>>({});
  const [patientListModalOpen, setPatientListModalOpen] = React.useState(false);
  const [patientListKeyword, setPatientListKeyword] = React.useState("");
  const [patientListPage, setPatientListPage] = React.useState(1);
  const [patientCatalog, setPatientCatalog] = React.useState<Patient[]>([]);
  const [patientCatalogLoading, setPatientCatalogLoading] = React.useState(false);
  const [patientCatalogError, setPatientCatalogError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionsRequest());
  }, [dispatch]);

  React.useEffect(() => {
    if (!list.length) return;
    if (selected) {
      const still = list.find((item) => item.receptionId === selected.receptionId);
      if (still) return;
    }
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionSuccess(list[0]));
  }, [list, selected, dispatch]);

  React.useEffect(() => {
    let active = true;
    const loadPatients = async () => {
      try {
        const patients = await fetchPatientsApi();
        if (!active) return;

        const byId = patients.reduce<Record<number, string>>((acc, item: Patient) => {
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

    void loadPatients();
    return () => {
      active = false;
    };
  }, []);

  const openCreateWithPatient = React.useCallback(
    (patient: Patient) => {
      if (!patient.patientId) return;
      const patientName = patient.name?.trim() ?? "";
      const params = new URLSearchParams({
        patientId: String(patient.patientId),
        patientName,
      });
      router.push(`/reception/emergency/create?${params.toString()}`);
    },
    [router]
  );

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
    if (!kw) return alert("검색어를 입력해주세요.");
    setPage(1);

    const run = async () => {
      try {
        const patients = await searchPatientsApi("name", kw);
        setPatientSearchResultCount(patients.length);

        if (patients.length === 0) {
          setPatientSuggestions([]);
          setOpenSuggestion(false);
          return;
        }

        if (patients.length === 1 && patients[0]?.patientId) {
          const single = patients[0];
          const nextKeyword = single.name?.trim() ?? kw;
          setKeyword(nextKeyword);
          setPatientSuggestions([]);
          setOpenSuggestion(false);
          openCreateWithPatient(single);
          return;
        }

        const suggestions = patients.slice(0, 8);
        setPatientSuggestions(suggestions);
        setOpenSuggestion(suggestions.length > 0);
      } catch {
        setPatientSearchResultCount(null);
        setPatientSuggestions([]);
        setOpenSuggestion(false);
      }
    };

    void run();
  };

  const onReset = () => {
    setPage(1);
    setKeyword("");
    setPatientSuggestions([]);
    setOpenSuggestion(false);
    setPatientSearchResultCount(null);
  };

  const onSelect = (item: EmergencyReception) => {
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionSuccess(item));
  };

  React.useEffect(() => {
    const kw = keyword.trim();
    if (!kw) {
      setPatientSuggestions([]);
      setOpenSuggestion(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
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
      window.clearTimeout(timer);
    };
  }, [keyword]);

  React.useEffect(() => {
    if (!patientListModalOpen) return;
    let active = true;

    const loadPatients = async () => {
      try {
        setPatientCatalogLoading(true);
        setPatientCatalogError(null);
        const patients = await fetchPatientsApi();
        if (!active) return;
        setPatientCatalog(patients);
      } catch {
        if (!active) return;
        setPatientCatalogError("환자 목록 조회 실패");
      } finally {
        if (!active) return;
        setPatientCatalogLoading(false);
      }
    };

    void loadPatients();
    return () => {
      active = false;
    };
  }, [patientListModalOpen]);

  const onPickPatientSuggestion = (patient: Patient) => {
    if (!patient.patientId) return;
    const nextKeyword = patient.name?.trim() ?? "";
    setPage(1);
    setKeyword(nextKeyword);
    setPatientSuggestions([]);
    setOpenSuggestion(false);
    setPatientSearchResultCount(1);
    openCreateWithPatient(patient);
  };

  const onSelectPatientFromListModal = (patient: Patient) => {
    const nextKeyword = patient.name?.trim() ?? "";
    setPage(1);
    setKeyword(nextKeyword);
    setPatientSuggestions([]);
    setOpenSuggestion(false);
    setPatientSearchResultCount(1);
    onClosePatientListModal();
    openCreateWithPatient(patient);
  };

  const onCancelEmergencyReceptionItem = (item: EmergencyReception) => {
    if (normalizeEmergencyStatus(item.status) === "CANCELED") return;
    const ok = window.confirm("응급 접수를 취소하시겠습니까?");
    if (!ok) return;

    const payload: EmergencyReceptionForm = {
      receptionNo: item.receptionNo,
      patientId: item.patientId,
      departmentId: item.departmentId,
      doctorId: item.doctorId ?? null,
      scheduledAt: item.scheduledAt ?? null,
      arrivedAt: item.arrivedAt ?? null,
      status: "CANCELED",
      note: item.note ?? null,
      triageLevel: item.triageLevel,
      chiefComplaint: item.chiefComplaint,
      vitalTemp: item.vitalTemp ?? null,
      vitalBpSystolic: item.vitalBpSystolic ?? null,
      vitalBpDiastolic: item.vitalBpDiastolic ?? null,
      vitalHr: item.vitalHr ?? null,
      vitalRr: item.vitalRr ?? null,
      vitalSpo2: item.vitalSpo2 ?? null,
      arrivalMode: item.arrivalMode ?? null,
      triageNote: item.triageNote ?? null,
    };

    dispatch(
      emergencyReceptionActions.updateEmergencyReceptionRequest({
        receptionId: String(item.receptionId),
        form: payload,
      })
    );
  };

  const baseVisibleList = React.useMemo(
    () => list.filter((item) => normalizeEmergencyStatus(item.status) !== "CANCELED"),
    [list]
  );

  const visibleList = baseVisibleList;
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

  const totalCount = visibleList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const pagedList = React.useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return visibleList.slice(start, start + ITEMS_PER_PAGE);
  }, [visibleList, page]);
  React.useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const primary =
    (selected && pagedList.find((item) => item.receptionId === selected.receptionId)) ||
    pagedList[0] ||
    visibleList[0] ||
    null;

  React.useEffect(() => {
    if (!pagedList.length) return;
    if (!selected || !pagedList.some((item) => item.receptionId === selected.receptionId)) {
      dispatch(emergencyReceptionActions.fetchEmergencyReceptionSuccess(pagedList[0]));
    }
  }, [pagedList, selected, dispatch]);

  const resolvePatientName = React.useCallback(
    (item?: EmergencyReception | null) => {
      if (!item) return "-";

      const withName = item as EmergencyReception & {
        patientName?: string | null;
        name?: string | null;
        patient?: { name?: string | null } | null;
      };
      const directName =
        withName.patientName ??
        withName.name ??
        withName.patient?.name ??
        "";

      if (typeof directName === "string" && directName.trim()) {
        return directName.trim();
      }

      const mappedName = item.patientId ? patientNameById[item.patientId] : "";
      if (mappedName?.trim()) return mappedName.trim();

      return `환자 ${item.patientId ?? "-"}`;
    },
    [patientNameById]
  );
  const primaryPatientName = resolvePatientName(primary);

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
                {"이름 조회 후 바로 응급 접수 등록"}
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
                    color: patientSearchResultCount === 0 ? "#d32f2f" : "#6b7a96",
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
                    {patientSuggestions.map((patient) => (
                      <Button
                        key={patient.patientId}
                        onClick={() => onPickPatientSuggestion(patient)}
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
                            {patient.name} · {patient.gender ?? "-"} · {patient.birthDate ?? "-"}
                          </Typography>
                          <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                            환자ID {patient.patientId} · {patient.phone ?? "-"} · {patient.patientNo ?? "-"}
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
            <Chip label={`전체 ${totalCount}`} color="primary" />
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
                    bgcolor: "#ffe4e4",
                    color: "#b42318",
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {primary?.triageLevel ? `T${primary.triageLevel}` : "ER"}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>
                    {primary ? primaryPatientName : "응급 접수 미선택"}
                  </Typography>
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    {primary?.receptionNo ?? "-"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>중증도</Typography>
                  <Typography fontWeight={600}>{primary?.triageLevel ?? "-"}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>상태</Typography>
                  <Typography fontWeight={600}>{statusLabel(primary?.status)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>내원 시각</Typography>
                  <Typography fontWeight={600}>{formatDateTime(primary?.arrivedAt)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>주호소</Typography>
                  <Typography
                    fontWeight={600}
                    sx={{ maxWidth: 160 }}
                    noWrap
                    title={primary?.chiefComplaint ?? "-"}
                  >
                    {summarizeOneLine(primary?.chiefComplaint)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  sx={{ color: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/emergency/detail/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/emergency/edit/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  응급 접수 수정
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
                  <Typography fontWeight={800}>응급 접수 목록</Typography>
                  <Chip label={`총 ${totalCount}`} size="small" color="primary" />
                </Stack>

                <Stack spacing={1}>
                  {pagedList.map((item) => {
                    const isSelected = selected?.receptionId === item.receptionId;
                    const patientName = resolvePatientName(item);

                    return (
                      <Box
                        key={item.receptionId}
                        onClick={() => onSelect(item)}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "48px minmax(0, 1fr)",
                          alignItems: "center",
                          gap: 1.5,
                          px: 1.5,
                          py: 1.2,
                          borderRadius: 2,
                          bgcolor: isSelected ? "rgba(180,35,24,0.08)" : "transparent",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#fff4f3" },
                        }}
                      >
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#ffe4e4", color: "#b42318" }}>
                          {`T${item.triageLevel}`}
                        </Avatar>
                        <Box
                          sx={{
                            minWidth: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={700} noWrap>
                              {item.receptionNo}
                            </Typography>
                            <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                              {patientName} · {statusLabel(item.status)} · {item.chiefComplaint ?? "-"}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            color="warning"
                            disabled={loading || normalizeEmergencyStatus(item.status) === "CANCELED"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelEmergencyReceptionItem(item);
                            }}
                          >
                            <BlockOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })}

                  {visibleList.length === 0 && (
                    <Typography color="#7b8aa9">조회된 응급 접수가 없습니다.</Typography>
                  )}
                </Stack>
                {visibleList.length > 0 && totalPages > 1 && (
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
                        {patient.name} · {patient.gender ?? "-"} · {patient.birthDate ?? "-"}
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

      {error && (
        <Typography color="error" fontWeight={800}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
