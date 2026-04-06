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
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { Patient, PatientMultiSearchPayload, PatientSearchPayload } from "@/features/patients/patientTypes";

const SEARCH_OPTIONS: { label: string; value: PatientSearchPayload["type"] }[] = [
  { label: "환자번호", value: "patientNo" },
  { label: "이름", value: "name" },
  { label: "연락처", value: "phone" },
  { label: "생년월일", value: "birthDate" },
  { label: "환자ID", value: "patientId" },
];

const DETAIL_TABS = ["기본", "보호자/연락", "메모", "바로가기"];

const API_BASE =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181";

function resolvePhotoUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function sexLabel(g?: Patient["gender"]) {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return "-";
}

function safe(v?: string | null) {
  return v && String(v).trim() ? v : "-";
}

function patientStatusMeta(statusCode?: string | null) {
  const code = (statusCode ?? "ACTIVE").trim().toUpperCase();
  switch (code) {
    case "ACTIVE":
      return { label: "정상", color: "success" as const, variant: "filled" as const };
    case "INACTIVE":
      return { label: "비활성", color: "warning" as const, variant: "filled" as const };
    case "TRANSFERRED":
      return { label: "전원", color: "info" as const, variant: "filled" as const };
    case "DECEASED":
      return { label: "사망", color: "error" as const, variant: "filled" as const };
    default:
      return { label: code || "-", color: "default" as const, variant: "outlined" as const };
  }
}

export default function PatientList() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.patients
  );

  // 빠른 검색(단일 필드)
  const [searchType, setSearchType] = React.useState<
    PatientSearchPayload["type"]
  >("patientNo");
  const [keyword, setKeyword] = React.useState("");

  // 자동 식별(다중 조건)
  const [multiName, setMultiName] = React.useState("");
  const [multiBirthDate, setMultiBirthDate] = React.useState("");
  const [multiPhone, setMultiPhone] = React.useState("");

  // 상세 탭
  const [detailTab, setDetailTab] = React.useState(0);

  React.useEffect(() => {
    dispatch(patientActions.fetchPatientsRequest());
  }, [dispatch]);

  React.useEffect(() => {
    if (!list.length) return;
    if (selected) {
      const still = list.find((p) => p.patientId === selected.patientId);
      if (still) return;
    }
    dispatch(patientActions.fetchPatientSuccess(list[0]));
  }, [list, selected, dispatch]);

  const onSelect = (p: Patient) => {
    dispatch(patientActions.fetchPatientSuccess(p));
  };

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) return alert("검색어는 필수입니다.");
    dispatch(
      patientActions.searchPatientsRequest({ type: searchType, keyword: kw })
    );
  };

  const onReset = () => {
    setKeyword("");
    setSearchType("patientNo");
    dispatch(patientActions.fetchPatientsRequest());
  };

  const onMultiSearch = () => {
    const payload: PatientMultiSearchPayload = {
      name: multiName.trim() || undefined,
      birthDate: multiBirthDate.trim() || undefined,
      phone: multiPhone.trim() || undefined,
    };
    if (!payload.name && !payload.birthDate && !payload.phone) {
      return alert("검색 조건을 입력하세요.");
    }
    dispatch(patientActions.searchPatientsMultiRequest(payload));
  };

  const onMultiReset = () => {
    setMultiName("");
    setMultiBirthDate("");
    setMultiPhone("");
    dispatch(patientActions.fetchPatientsRequest());
  };

  const onDeactivate = (patientId: number) => {
    if (!confirm("환자를 비활성 처리하시겠습니까?")) return;
    dispatch(patientActions.deletePatientRequest(patientId));
  };

  const primary = selected ?? list[0] ?? null;
  const primaryStatusMeta = primary ? patientStatusMeta(primary.statusCode) : null;

  const totalCount = list.length;
  const vipCount = list.filter((p) => p.isVip).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 상단 헤더 (실무 EMR 느낌: 타이틀 + 액션) */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
            환자관리
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.25 }}>
            검색 · 목록 · 상세를 한 화면에서 처리하는 원무/접수용 워크벤치
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href="/patients/new"
          >
            신규 등록
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
            disabled={loading}
          >
            새로고침
          </Button>
        </Stack>
      </Stack>

      {/* KPI 칩 */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Chip label={`전체 ${totalCount}`} color="primary" />
        <Chip label={`VIP ${vipCount}`} variant="outlined" />
        {error && <Chip label={`에러: ${error}`} color="error" variant="outlined" />}
        {loading && <Chip label="조회 중…" variant="outlined" />}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "320px minmax(0, 1fr) 380px",
          },
        }}
      >
        {/* 좌측: 검색/필터 패널 */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>
              검색
            </Typography>

            <Stack spacing={1.25}>
              <Stack spacing={1} direction="row">
                <TextField
                  select
                  size="small"
                  value={searchType}
                  onChange={(e) =>
                    setSearchType(e.target.value as PatientSearchPayload["type"])
                  }
                  sx={{ width: 130 }}
                >
                  {SEARCH_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  placeholder="검색어"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  fullWidth
                />

                <Tooltip title="검색">
                  <span>
                    <IconButton onClick={onSearch} disabled={loading}>
                      <SearchIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>

              <Divider />

              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
                자동 식별(중복 환자 방지)
              </Typography>

              <TextField
                label="이름"
                size="small"
                value={multiName}
                onChange={(e) => setMultiName(e.target.value)}
              />
              <TextField
                label="생년월일"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={multiBirthDate}
                onChange={(e) => setMultiBirthDate(e.target.value)}
              />
              <TextField
                label="연락처"
                size="small"
                value={multiPhone}
                onChange={(e) => setMultiPhone(e.target.value)}
              />

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={onMultiSearch}
                  disabled={loading}
                  fullWidth
                >
                  자동 식별 검색
                </Button>
                <Button
                  variant="outlined"
                  onClick={onMultiReset}
                  disabled={loading}
                  fullWidth
                >
                  초기화
                </Button>
              </Stack>

              <Divider />

              <Typography sx={{ color: "text.secondary", fontSize: 12, lineHeight: 1.5 }}>
                · 실무에서는 <b>이름+생년월일+연락처</b> 조합으로 중복 환자(동명이인) 등록을 줄입니다.\n                <br />· 목록에서 환자를 클릭하면 우측에 상세가 바로 표시됩니다.\n              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* 중앙: 환자 목록(테이블, 정보 밀도 높게) */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, pb: 1.25 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontWeight: 800 }}>환자 목록</Typography>
                <Chip label={`총 ${totalCount}`} size="small" />
              </Stack>
              <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 0.5 }}>
                더블클릭(또는 우측 아이콘)으로 상세 페이지 이동
              </Typography>
            </Box>

            <Divider />

            <TableContainer sx={{ maxHeight: { xs: 420, lg: 640 } }}>
              <Table stickyHeader size="small" aria-label="patient list">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 56 }}>사진</TableCell>
                    <TableCell sx={{ width: 120 }}>환자번호</TableCell>
                    <TableCell sx={{ width: 110 }}>이름</TableCell>
                    <TableCell sx={{ width: 70 }}>성별</TableCell>
                    <TableCell sx={{ width: 120 }}>생년월일</TableCell>
                    <TableCell sx={{ width: 140 }}>연락처</TableCell>
                    <TableCell sx={{ width: 110 }}>상태</TableCell>
                    <TableCell sx={{ width: 110 }}>구분</TableCell>
                    <TableCell align="right" sx={{ width: 120 }}>
                      액션
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {list.map((p) => {
                    const isSelected = primary?.patientId === p.patientId;
                    const statusMeta = patientStatusMeta(p.statusCode);
                    return (
                      <TableRow
                        key={p.patientId}
                        hover
                        selected={isSelected}
                        sx={{
                          cursor: "pointer",
                          "&.Mui-selected": {
                            backgroundColor: "rgba(25, 118, 210, 0.08)",
                          },
                        }}
                        onClick={() => onSelect(p)}
                        onDoubleClick={() => {
                          router.push(`/patients/${p.patientId}`);
                        }}
                      >
                        <TableCell>
                          <Avatar
                            src={resolvePhotoUrl(p.photoUrl) || undefined}
                            sx={{ width: 28, height: 28 }}
                          >
                            {p.name?.slice(0, 1) ?? "?"}
                          </Avatar>
                        </TableCell>
                        <TableCell>{safe(p.patientNo)}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{p.name}</TableCell>
                        <TableCell>{sexLabel(p.gender)}</TableCell>
                        <TableCell>{safe(p.birthDate)}</TableCell>
                        <TableCell>{safe(p.phone)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={statusMeta.label}
                            variant={statusMeta.variant}
                            color={statusMeta.color}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                            {p.isVip && <Chip size="small" label="VIP" color="primary" />}
                            {p.isForeigner && (
                              <Chip size="small" label="외국인" variant="outlined" />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="상세 페이지">
                            <IconButton
                              size="small"
                              component={Link}
                              href={`/patients/${p.patientId}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="비활성 처리">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeactivate(p.patientId);
                              }}
                            >
                              <BlockOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {list.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Typography sx={{ color: "text.secondary" }}>
                          조회된 환자가 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* 우측: 선택 환자 상세(EMR 느낌: 요약 + 탭) */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={resolvePhotoUrl(primary?.photoUrl) || undefined}
                sx={{ width: 64, height: 64 }}
              >
                {primary?.name?.slice(0, 1) ?? "P"}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: 18 }} noWrap>
                  {primary?.name ?? "환자를 선택하세요"}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
                  {primary?.patientNo ? `환자번호 ${primary.patientNo}` : "환자번호 -"} ·{" "}
                  {primary ? `ID ${primary.patientId}` : "ID -"}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: "wrap" }}>
                  {primary?.isVip && <Chip size="small" label="VIP" color="primary" />}
                  {primaryStatusMeta && (
                    <Chip
                      size="small"
                      label={primaryStatusMeta.label}
                      color={primaryStatusMeta.color}
                      variant={primaryStatusMeta.variant}
                    />
                  )}
                  {primary?.isForeigner && (
                    <Chip size="small" label="외국인" variant="outlined" />
                  )}
                </Stack>
              </Box>

              {primary && (
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  href={`/patients/${primary.patientId}`}
                  startIcon={<OpenInNewIcon />}
                >
                  상세
                </Button>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Tabs
              value={detailTab}
              onChange={(_, v) => setDetailTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 34,
                "& .MuiTab-root": { minHeight: 34, fontSize: 13 },
              }}
            >
              {DETAIL_TABS.map((t) => (
                <Tab key={t} label={t} />
              ))}
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {detailTab === 0 && (
                <Stack spacing={1.2}>
                  <Row label="성별" value={primary ? sexLabel(primary.gender) : "-"} />
                  <Row label="생년월일" value={safe(primary?.birthDate)} />
                  <Row label="연락처" value={safe(primary?.phone)} />
                  <Row label="이메일" value={safe(primary?.email)} />
                  <Row label="주소" value={formatAddress(primary)} />
                </Stack>
              )}

              {detailTab === 1 && (
                <Stack spacing={1.2}>
                  <Row label="보호자명" value={safe(primary?.guardianName)} />
                  <Row label="보호자 연락처" value={safe(primary?.guardianPhone)} />
                  <Row label="관계" value={safe(primary?.guardianRelation)} />
                  <Row label="우선 연락처" value={safe(primary?.contactPriority)} />
                </Stack>
              )}

              {detailTab === 2 && (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.5,
                    minHeight: 140,
                    bgcolor: "background.default",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {primary?.note?.trim()
                      ? primary.note
                      : "메모가 없습니다. (환자 상세 화면에서 입력하도록 연결해두면 실무 느낌이 확 올라갑니다.)"}
                  </Typography>
                </Box>
              )}

              {detailTab === 3 && (
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    component={Link}
                    href={primary ? `/patients/${primary.patientId}` : "#"}
                    disabled={!primary}
                  >
                    환자 상세/수정
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    href="/insurances"
                  >
                    보험 관리(전체)
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    href="/consents"
                  >
                    동의서(전체)
                  </Button>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
                    * 실제 운영에서는 보험/동의서 페이지에 <b>patientId</b>를 넘겨 필터링합니다.\n                    <br />예: /insurances?patientId=123\n                  </Typography>
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function formatAddress(p?: Patient | null) {
  if (!p) return "-";
  const a = p.address?.trim();
  const d = p.addressDetail?.trim();
  if (!a && !d) return "-";
  if (a && d) return `${a} ${d}`;
  return a || d || "-";
}
