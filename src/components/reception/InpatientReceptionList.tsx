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
  DialogContent,
  Divider,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { inpatientReceptionActions } from "@/features/InpatientReception/InpatientReceptionSlice";
import type { InpatientReception } from "@/features/InpatientReception/InpatientReceptionTypes";
import type { DepartmentOption, DoctorOption } from "@/features/Reservations/ReservationTypes";
import type { Patient } from "@/features/patients/patientTypes";
import { searchPatientsApi } from "@/lib/patient/patientApi";
import { fetchDepartmentsApi, fetchDoctorsApi } from "@/lib/masterDataApi";

const statusLabel = (value?: string | null) => {
  switch (value) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "대기";
    case "IN_PROGRESS":
      return "진료중";
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

const toLocalDateTimeValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const toOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
};

const ITEMS_PER_PAGE = 10;

export default function InpatientReceptionList() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.inpatientReceptions
  );

  const [keyword, setKeyword] = React.useState("");
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [doctors, setDoctors] = React.useState<DoctorOption[]>([]);
  const [masterDataLoading, setMasterDataLoading] = React.useState(false);
  const [masterDataError, setMasterDataError] = React.useState<string | null>(null);
  const [patientSuggestions, setPatientSuggestions] = React.useState<Patient[]>([]);
  const [openSuggestion, setOpenSuggestion] = React.useState(false);
  const [patientSearchResultCount, setPatientSearchResultCount] = React.useState<number | null>(
    null
  );
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createTargetPatient, setCreateTargetPatient] = React.useState<{
    patientId: number | null;
    patientName: string;
  }>({
    patientId: null,
    patientName: "",
  });
  const [createModalForm, setCreateModalForm] = React.useState<{
    departmentId: string;
    doctorId: string | null;
    admissionPlanAt: string;
    wardId: string;
    roomId: string;
    note: string;
  }>({
    departmentId: "",
    doctorId: null,
    admissionPlanAt: toLocalDateTimeValue(new Date()),
    wardId: "",
    roomId: "",
    note: "",
  });
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    dispatch(inpatientReceptionActions.fetchInpatientReceptionsRequest());
  }, [dispatch]);

  React.useEffect(() => {
    if (!list.length) return;
    if (selected) {
      const still = list.find((p) => p.receptionId === selected.receptionId);
      if (still) return;
    }
    dispatch(inpatientReceptionActions.fetchInpatientReceptionSuccess(list[0]));
  }, [list, selected, dispatch]);

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
        const message =
          err instanceof Error && err.message ? err.message : "진료과/의사 목록 조회 실패";
        setMasterDataError(message);
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

  const openCreateWithPatient = React.useCallback(
    (patient: Patient) => {
      if (!patient.patientId) return;
      const patientName = patient.name?.trim() ?? "";
      setCreateTargetPatient({
        patientId: patient.patientId,
        patientName,
      });
      setCreateModalOpen(true);
    },
    []
  );

  const onSearch = () => {
    const kw = keyword.trim();
    setPage(1);
    if (!kw) return alert("검색어를 입력해주세요.");

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

  const onSelect = (p: InpatientReception) => {
    dispatch(inpatientReceptionActions.fetchInpatientReceptionSuccess(p));
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

  const doctorsForSelectedDepartment = React.useMemo(() => {
    if (!createModalForm.departmentId) return doctors;
    return doctors.filter(
      (doctor) => (doctor.departmentId ?? "") === createModalForm.departmentId
    );
  }, [createModalForm.departmentId, doctors]);

  React.useEffect(() => {
    if (!createModalOpen) return;
    const defaultDepartmentId = departments[0]?.departmentId ?? "";
    const defaultDoctorId =
      doctors.find((doctor) => (doctor.departmentId ?? "") === defaultDepartmentId)?.doctorId ??
      null;
    setCreateModalForm({
      departmentId: defaultDepartmentId,
      doctorId: defaultDoctorId,
      admissionPlanAt: toLocalDateTimeValue(new Date()),
      wardId: "",
      roomId: "",
      note: "",
    });
  }, [createModalOpen, departments, doctors]);

  const onCreateModalSubmit = () => {
    if (!createTargetPatient.patientId) {
      alert("환자를 먼저 선택해주세요.");
      return;
    }

    const department = departments.find(
      (item) => item.departmentId === createModalForm.departmentId
    );
    if (!department) {
      alert("진료과를 선택해주세요.");
      return;
    }

    if (!createModalForm.admissionPlanAt) {
      alert("입원 예정 시간???낅젰?댁＜?몄슂.");
      return;
    }

    const doctor =
      doctors.find((item) => String(item.doctorId) === String(createModalForm.doctorId)) ??
      doctors.find((item) => (item.departmentId ?? "") === department.departmentId) ??
      null;

    dispatch(
      inpatientReceptionActions.createInpatientReceptionRequest({
        receptionNo: "",
        patientId: createTargetPatient.patientId,
        departmentId: department.departmentId,
        doctorId: doctor?.doctorId ?? null,
        scheduledAt: null,
        arrivedAt: null,
        status: "WAITING",
        note: createModalForm.note.trim() ? createModalForm.note.trim() : null,
        admissionPlanAt: `${createModalForm.admissionPlanAt}:00`,
        wardId: toOptionalNumber(createModalForm.wardId),
        roomId: toOptionalNumber(createModalForm.roomId),
      })
    );

    setCreateModalOpen(false);
    setPatientSuggestions([]);
    setOpenSuggestion(false);
  };

  const onCreateModalClose = () => {
    setCreateModalOpen(false);
  };

  const visibleList = list;
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
    visibleList[0];

  React.useEffect(() => {
    if (!pagedList.length) return;
    if (!selected || !pagedList.some((item) => item.receptionId === selected.receptionId)) {
      dispatch(inpatientReceptionActions.fetchInpatientReceptionSuccess(pagedList[0]));
    }
  }, [pagedList, selected, dispatch]);

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
                {"이름 조회 후 바로 입원 접수 등록"}
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
                variant="contained"
                component={Link}
                href="/reception/inpatient/create"
                sx={{ bgcolor: "#1f7a3f" }}
              >
                신규 입원 접수
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
                  href={primary ? `/reception/inpatient/detail/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/inpatient/edit/${primary.receptionId}` : "#"}
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
                  <Chip label={`총 ${totalCount}`} size="small" color="primary" />
                </Stack>

                <Stack spacing={1}>
                  {pagedList.map((p) => {
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

                  {visibleList.length === 0 && (
                    <Typography color="#7b8aa9">조회된 입원 접수가 없습니다.</Typography>
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

      <Dialog open={createModalOpen} onClose={onCreateModalClose} fullWidth maxWidth="sm">
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={1.75}>
            <Typography variant="h5" fontWeight={900}>
              {"입원 접수 등록"}
            </Typography>

            <TextField
              size="small"
              label={"환자"}
              value={
                createTargetPatient.patientId
                  ? `${createTargetPatient.patientName || "환자"} (${createTargetPatient.patientId})`
                  : ""
              }
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <TextField
              select
              size="small"
              label={"진료과"}
              value={createModalForm.departmentId}
              onChange={(e) => {
                const departmentId = e.target.value;
                const nextDoctorId =
                  doctors.find((doctor) => (doctor.departmentId ?? "") === departmentId)
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
                const doctorId = e.target.value || null;
                const doctor = doctors.find((item) => String(item.doctorId) === String(doctorId));
                setCreateModalForm((prev) => ({
                  ...prev,
                  doctorId,
                  departmentId: doctor?.departmentId ?? prev.departmentId,
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
              type="datetime-local"
              label={"입원 예정 시간"}
              value={createModalForm.admissionPlanAt}
              onChange={(e) =>
                setCreateModalForm((prev) => ({
                  ...prev,
                  admissionPlanAt: e.target.value,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                size="small"
                label={"병동 ID(선택)"}
                value={createModalForm.wardId}
                onChange={(e) =>
                  setCreateModalForm((prev) => ({
                    ...prev,
                    wardId: e.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                size="small"
                label={"병실 ID(선택)"}
                value={createModalForm.roomId}
                onChange={(e) =>
                  setCreateModalForm((prev) => ({
                    ...prev,
                    roomId: e.target.value,
                  }))
                }
                fullWidth
              />
            </Stack>

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
                  !createTargetPatient.patientId ||
                  !createModalForm.departmentId ||
                  !createModalForm.admissionPlanAt
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



