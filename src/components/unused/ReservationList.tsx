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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { reservationActions } from "@/features/Reservations/ReservationSlice";
import type {
  Reservation,
  ReservationForm,
  ReservationSearchType,
  ReservationStatus,
} from "@/features/Reservations/ReservationTypes";

const SEARCH_OPTIONS: { label: string; value: ReservationSearchType }[] = [
  { label: "예약번호", value: "reservationNo" },
  { label: "환자ID", value: "patientId" },
  { label: "상태", value: "status" },
];

const statusLabel = (value?: string | null) => {
  switch (value) {
    case "RESERVED":
      return "예약";
    case "COMPLETED":
      return "완료";
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

const normalizeStatusKeyword = (keyword: string): string => {
  const raw = keyword.trim();
  if (!raw) return raw;
  const upper = raw.toUpperCase();

  const map: Record<string, ReservationStatus> = {
    RESERVED: "RESERVED",
    COMPLETED: "COMPLETED",
    CANCELED: "CANCELED",
    CANCELLED: "CANCELED",
    INACTIVE: "INACTIVE",
    "예약": "RESERVED",
    "완료": "COMPLETED",
    "취소": "CANCELED",
    "비활성": "INACTIVE",
  };

  return map[upper] ?? map[raw] ?? raw;
};

type ReservationListProps = {
  initialSearchType?: ReservationSearchType;
  initialKeyword?: string;
  autoSearch?: boolean;
  hideCanceled?: boolean;
};

export default function ReservationList({
  initialSearchType = "reservationNo",
  initialKeyword = "",
  autoSearch = false,
  hideCanceled = true,
}: ReservationListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.reservations
  );

  const [searchType, setSearchType] = React.useState<ReservationSearchType>(initialSearchType);
  const [keyword, setKeyword] = React.useState(initialSearchType === "status" ? "" : initialKeyword);
  const [statusKeyword, setStatusKeyword] = React.useState<ReservationStatus>(
    (initialSearchType === "status" && initialKeyword
      ? (initialKeyword as ReservationStatus)
      : "RESERVED") as ReservationStatus
  );

  React.useEffect(() => {
    if (autoSearch && initialKeyword) {
      const normalized =
        initialSearchType === "status"
          ? normalizeStatusKeyword(initialKeyword)
          : initialKeyword;
      setSearchType(initialSearchType);
      if (initialSearchType === "status") {
        setStatusKeyword(normalized as ReservationStatus);
      } else {
        setKeyword(initialKeyword);
      }
      dispatch(
        reservationActions.searchReservationsRequest({
          type: initialSearchType,
          keyword: normalized,
        })
      );
      return;
    }
    dispatch(reservationActions.fetchReservationsRequest());
  }, [autoSearch, dispatch, initialKeyword, initialSearchType]);

  React.useEffect(() => {
    if (!list.length) return;
    if (selected) {
      const still = list.find((p) => p.reservationId === selected.reservationId);
      if (still) return;
    }
    dispatch(reservationActions.fetchReservationSuccess(list[0]));
  }, [list, selected, dispatch]);

  const onSearch = () => {
    const kw = searchType === "status" ? statusKeyword : keyword.trim();
    if (!kw) return alert("검색어는 필수입니다.");
    const normalized = searchType === "status" ? normalizeStatusKeyword(kw) : kw;
    dispatch(
      reservationActions.searchReservationsRequest({
        type: searchType,
        keyword: normalized,
      })
    );
  };

  const onReset = () => {
    if (autoSearch && initialKeyword) {
      const normalized =
        initialSearchType === "status"
          ? normalizeStatusKeyword(initialKeyword)
          : initialKeyword;
      setSearchType(initialSearchType);
      if (initialSearchType === "status") {
        setStatusKeyword(normalized as ReservationStatus);
      } else {
        setKeyword(initialKeyword);
      }
      dispatch(
        reservationActions.searchReservationsRequest({
          type: initialSearchType,
          keyword: normalized,
        })
      );
      return;
    }
    setKeyword("");
    setSearchType("reservationNo");
    setStatusKeyword("RESERVED");
    dispatch(reservationActions.fetchReservationsRequest());
  };

  const onSelect = (p: Reservation) => {
    dispatch(reservationActions.fetchReservationSuccess(p));
  };

  const onCancelReservation = () => {
    if (!primary) return;
    if (normalizeStatus(primary.status) === "CANCELED") return;
    const ok = window.confirm("예약을 취소하시겠습니까?");
    if (!ok) return;

    const payload: ReservationForm = {
      reservationNo: primary.reservationNo,
      patientId: primary.patientId ?? null,
      patientName: primary.patientName ?? null,
      departmentId: primary.departmentId,
      departmentName: primary.departmentName ?? null,
      doctorId: primary.doctorId ?? null,
      doctorName: primary.doctorName ?? null,
      reservedAt: primary.reservedAt,
      status: "CANCELED",
      note: primary.note ?? null,
    };

    dispatch(
      reservationActions.updateReservationRequest({
        reservationId: String(primary.reservationId),
        form: payload,
      })
    );
  };

  const onCompleteReservation = () => {
    if (!primary) return;
    const normalized = normalizeStatus(primary.status);
    if (normalized === "COMPLETED" || normalized === "CANCELED") return;
    const ok = window.confirm("예약을 완료 처리하시겠습니까?");
    if (!ok) return;

    const payload: ReservationForm = {
      reservationNo: primary.reservationNo,
      patientId: primary.patientId ?? null,
      patientName: primary.patientName ?? null,
      departmentId: primary.departmentId,
      departmentName: primary.departmentName ?? null,
      doctorId: primary.doctorId ?? null,
      doctorName: primary.doctorName ?? null,
      reservedAt: primary.reservedAt,
      status: "COMPLETED",
      note: primary.note ?? null,
    };

    dispatch(
      reservationActions.updateReservationRequest({
        reservationId: String(primary.reservationId),
        form: payload,
      })
    );
  };

  const visibleList = hideCanceled
    ? list.filter((item) => !["CANCELED", "COMPLETED"].includes(normalizeStatus(item.status) ?? ""))
    : list;

  const primary =
    (selected && visibleList.find((p) => p.reservationId === selected.reservationId)) ||
    visibleList[0];

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
              예약 검색
            </Typography>
              <TextField
                select
                size="small"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as ReservationSearchType)}
                sx={{ width: { xs: "100%", md: 180 } }}
              >
              {SEARCH_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            {searchType === "status" ? (
              <TextField
                select
                size="small"
                value={statusKeyword}
                onChange={(e) => setStatusKeyword(e.target.value as ReservationStatus)}
                sx={{ width: { xs: "100%", md: 360 } }}
              >
                <MenuItem value="RESERVED">예약</MenuItem>
                <MenuItem value="COMPLETED">완료</MenuItem>
                <MenuItem value="CANCELED">취소</MenuItem>
                <MenuItem value="INACTIVE">비활성</MenuItem>
              </TextField>
            ) : (
              <TextField
                size="small"
                placeholder="검색어 입력"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                sx={{ width: { xs: "100%", md: 360 } }}
              />
            )}
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
                          <Button
                variant="contained"
                component={Link}
                href="/reservations/new"
                sx={{ bgcolor: "#1f7a3f" }}
              >
                신규 예약
              </Button>
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Chip label={`전체 ${visibleList.length}`} color="primary" />
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
                  {primary?.patientName
                    ? primary.patientName.slice(0, 1)
                    : primary?.patientId
                    ? String(primary.patientId).slice(-2)
                    : "R"}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>
                    {primary
                      ? primary.patientName
                        ? `환자 ${primary.patientName}`
                        : `환자 ${primary.patientId}`
                      : "예약 미선택"}
                  </Typography>
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    {primary?.reservationNo ?? "-"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    예약 ID
                  </Typography>
                  <Typography fontWeight={600}>
                    {primary?.reservationId ?? "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    예약 시간
                  </Typography>
                  <Typography fontWeight={600}>
                    {primary?.reservedAt ?? "-"}
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
                  href={primary ? `/reservations/${primary.reservationId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reservations/${primary.reservationId}/edit` : "#"}
                  disabled={!primary}
                >
                  예약 수정
                </Button>
                <Button
                  variant="contained"
                  onClick={onCompleteReservation}
                  disabled={
                    !primary ||
                    ["COMPLETED", "CANCELED"].includes(normalizeStatus(primary.status) ?? "") ||
                    loading
                  }
                  sx={{ bgcolor: "#2b5aa9" }}
                >
                  완료 처리
                </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={onCancelReservation}
                    disabled={!primary || normalizeStatus(primary.status) === "CANCELED" || loading}
                  >
                    예약 취소
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
                  <Typography fontWeight={800}>예약 목록</Typography>
                  <Chip label={`총 ${visibleList.length}`} size="small" color="primary" />
                </Stack>

                <Stack spacing={1}>
                  {visibleList.map((p) => {
                    const isSelected = selected?.reservationId === p.reservationId;
                    return (
                      <Box
                        key={p.reservationId}
                        onClick={() => onSelect(p)}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "48px minmax(0, 1fr)",
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
                          {p.patientName ? p.patientName.slice(0, 1) : String(p.patientId ?? "?").slice(-2)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>
                            {p.reservationNo}
                          </Typography>
                          <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                            환자 {p.patientName ?? p.patientId} · {p.reservedAt} · {statusLabel(p.status)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}

                  {visibleList.length === 0 && (
                    <Typography color="#7b8aa9">조회된 예약이 없습니다.</Typography>
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





