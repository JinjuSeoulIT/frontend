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
import { inpatientReceptionActions } from "@/features/InpatientReception/InpatientReceptionSlice";
import type {
  InpatientReception,
  InpatientReceptionSearchPayload,
} from "@/features/InpatientReception/InpatientReceptionTypes";

const SEARCH_OPTIONS: { label: string; value: InpatientReceptionSearchPayload["type"] }[] = [
  { label: "환자ID", value: "patientId" },
  { label: "상태", value: "status" },
  { label: "병동ID", value: "wardId" },
  { label: "병실ID", value: "roomId" },
];

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

type InpatientReceptionListProps = {
  initialSearchType?: InpatientReceptionSearchPayload["type"];
  initialKeyword?: string;
  autoSearch?: boolean;
};

export default function InpatientReceptionList({
  initialSearchType = "patientId",
  initialKeyword = "",
  autoSearch = false,
}: InpatientReceptionListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.inpatientReceptions
  );

  const [searchType, setSearchType] = React.useState<
    InpatientReceptionSearchPayload["type"]
  >(initialSearchType);
  const [keyword, setKeyword] = React.useState(initialKeyword);

  React.useEffect(() => {
    if (autoSearch && initialKeyword.trim()) {
      dispatch(
        inpatientReceptionActions.searchInpatientReceptionsRequest({
          type: initialSearchType,
          keyword: initialKeyword.trim(),
        })
      );
      return;
    }
    dispatch(inpatientReceptionActions.fetchInpatientReceptionsRequest());
  }, [dispatch, autoSearch, initialKeyword, initialSearchType]);

  React.useEffect(() => {
    if (!list.length) return;
    if (selected) {
      const still = list.find((p) => p.receptionId === selected.receptionId);
      if (still) return;
    }
    dispatch(inpatientReceptionActions.fetchInpatientReceptionSuccess(list[0]));
  }, [list, selected, dispatch]);

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) return alert("검색어는 필수입니다.");
    dispatch(
      inpatientReceptionActions.searchInpatientReceptionsRequest({
        type: searchType,
        keyword: kw,
      })
    );
  };

  const onReset = () => {
    setKeyword("");
    setSearchType("patientId");
    dispatch(inpatientReceptionActions.fetchInpatientReceptionsRequest());
  };

  const onSelect = (p: InpatientReception) => {
    dispatch(inpatientReceptionActions.fetchInpatientReceptionSuccess(p));
  };

  const primary = selected ?? list[0];

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
              입원 접수 검색
            </Typography>
            <TextField
              select
              size="small"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              sx={{ width: { xs: "100%", md: 180 } }}
            >
              {SEARCH_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              placeholder="검색어 입력"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              sx={{ width: { xs: "100%", md: 360 } }}
            />
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
                href="/inpatient-receptions/new"
                sx={{ bgcolor: "#1f7a3f" }}
              >
                신규 입원 접수
              </Button>
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Chip label={`전체 ${list.length}`} color="primary" />
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
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {primary?.wardId ? `W${primary.wardId}` : "IP"}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>
                    {primary ? `환자 ${primary.patientId}` : "입원 접수 미선택"}
                  </Typography>
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    {primary?.receptionNo ?? "-"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>입원 예정</Typography>
                  <Typography fontWeight={600}>{primary?.admissionPlanAt ?? "-"}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>상태</Typography>
                  <Typography fontWeight={600}>{statusLabel(primary?.status)}</Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  sx={{ color: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/inpatient-receptions/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/inpatient-receptions/${primary.receptionId}/edit` : "#"}
                  disabled={!primary}
                >
                  입원 접수 수정
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
                  <Typography fontWeight={800}>입원 접수 목록</Typography>
                  <Chip label={`총 ${list.length}`} size="small" color="primary" />
                </Stack>

                <Stack spacing={1}>
                  {list.map((p) => {
                    const isSelected = selected?.receptionId === p.receptionId;
                    return (
                      <Box
                        key={p.receptionId}
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
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "#d7e6ff",
                            color: "#2b5aa9",
                          }}
                        >
                          {String(p.patientId ?? "?").slice(-2)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>
                            {p.receptionNo}
                          </Typography>
                          <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                            환자 {p.patientId} · {p.admissionPlanAt} · {statusLabel(p.status)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}

                  {list.length === 0 && (
                    <Typography color="#7b8aa9">조회된 입원 접수가 없습니다.</Typography>
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
