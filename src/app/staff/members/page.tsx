"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MainLayout from "@/components/layout/MainLayout";
import {
  fetchStaffDepartmentSummaryApi,
  fetchStaffLocationSummaryApi,
  fetchStaffSummaryApi,
  type StaffDepartmentSummaryItem,
  type StaffLocationSummaryItem,
  type StaffRoleFilter,
  type StaffSearchParams,
  type StaffSummaryItem,
} from "@/lib/staff/staffSummaryApi";

type SearchFormState = {
  keyword: string;
  role: StaffRoleFilter | "";
  departmentId: number | "";
  locationId: number | "";
};

const TEXT = {
  title: "직원 목록",
  subtitle: "검색 조건을 서버로 전달해 실제 직원 목록을 조회합니다.",
  searchLabel: "직원 검색",
  searchPlaceholder: "이름, 연락처, 이메일, 부서명, 위치명",
  advanced: "상세 검색",
  search: "검색",
  reset: "초기화",
  all: "전체",
  role: "직무",
  department: "부서",
  location: "위치",
  totalPrefix: "총",
  totalSuffix: "명",
  noResult: "검색 결과가 없습니다.",
  loadError: "직원 목록 조회에 실패했습니다.",
  loadInitialError: "직원 목록을 불러오지 못했습니다.",
  index: "번호",
  name: "이름",
  contact: "연락처",
  rowsPerPage: "페이지당 행 수",
} as const;

const INITIAL_FILTERS: SearchFormState = {
  keyword: "",
  role: "",
  departmentId: "",
  locationId: "",
};

const ROLE_OPTIONS: Array<{ value: StaffRoleFilter; label: string }> = [
  { value: "doctor", label: "의사" },
  { value: "nurse", label: "간호사" },
  { value: "reception", label: "원무" },
  { value: "staff", label: "직원" },
  { value: "admin", label: "관리자" },
];

const toSearchParams = (filters: SearchFormState): StaffSearchParams => ({
  keyword: filters.keyword,
  role: filters.role,
  departmentId: filters.departmentId,
  locationId: filters.locationId,
});

const toLocationOptionLabel = (item: StaffLocationSummaryItem) =>
  item.locationDisplayName ??
  item.locationName ??
  item.locationCode ??
  (item.locationId != null ? String(item.locationId) : "-");

const toRoleDisplay = (value: string | null | undefined) => {
  switch ((value ?? "").trim().toLowerCase()) {
    case "doctor":
      return "의사";
    case "nurse":
      return "간호사";
    case "reception":
      return "원무";
    case "admin":
      return "관리자";
    case "staff":
      return "직원";
    default:
      return value ?? "-";
  }
};

export default function StaffMembersPage() {
  const [rows, setRows] = useState<StaffSummaryItem[]>([]);
  const [departments, setDepartments] = useState<StaffDepartmentSummaryItem[]>([]);
  const [locations, setLocations] = useState<StaffLocationSummaryItem[]>([]);
  const [filters, setFilters] = useState<SearchFormState>(INITIAL_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);

  const loadRows = async (params: StaffSearchParams, useSearchingState = true) => {
    if (useSearchingState) {
      setSearching(true);
    }
    try {
      setError(null);
      const data = await fetchStaffSummaryApi(params);
      setRows(data);
      setPage(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : TEXT.loadError;
      setError(message);
      setRows([]);
    } finally {
      if (useSearchingState) {
        setSearching(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      try {
        setLoading(true);
        setError(null);
        const [staffRows, departmentRows, locationRows] = await Promise.all([
          fetchStaffSummaryApi(),
          fetchStaffDepartmentSummaryApi(),
          fetchStaffLocationSummaryApi(),
        ]);
        if (!mounted) {
          return;
        }
        setRows(staffRows);
        setDepartments(departmentRows);
        setLocations(locationRows);
      } catch (err) {
        const message = err instanceof Error ? err.message : TEXT.loadInitialError;
        if (mounted) {
          setError(message);
          setRows([]);
          setDepartments([]);
          setLocations([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadInitial();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = async () => {
    await loadRows(toSearchParams(filters));
  };

  const handleReset = async () => {
    setFilters(INITIAL_FILTERS);
    await loadRows({}, true);
  };

  return (
    <MainLayout showSidebar={true}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {TEXT.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            {TEXT.subtitle}
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 2.5 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label={TEXT.searchLabel}
                  placeholder={TEXT.searchPlaceholder}
                  value={filters.keyword}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, keyword: event.target.value }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleSearch();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterAltOutlinedIcon />}
                  onClick={() => setShowAdvanced((prev) => !prev)}
                >
                  {TEXT.advanced}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchOutlinedIcon />}
                  onClick={() => void handleSearch()}
                  disabled={loading || searching}
                >
                  {TEXT.search}
                </Button>
                <Button
                  variant="text"
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={() => void handleReset()}
                  disabled={loading || searching}
                >
                  {TEXT.reset}
                </Button>
              </Stack>

              <Collapse in={showAdvanced}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="staff-role-label">{TEXT.role}</InputLabel>
                    <Select
                      labelId="staff-role-label"
                      label={TEXT.role}
                      value={filters.role}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          role: event.target.value as StaffRoleFilter | "",
                        }))
                      }
                    >
                      <MenuItem value="">{TEXT.all}</MenuItem>
                      {ROLE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="staff-department-label">{TEXT.department}</InputLabel>
                    <Select
                      labelId="staff-department-label"
                      label={TEXT.department}
                      value={filters.departmentId}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          departmentId:
                            event.target.value === "" ? "" : Number(event.target.value),
                        }))
                      }
                    >
                      <MenuItem value="">{TEXT.all}</MenuItem>
                      {departments.map((item) => (
                        <MenuItem key={item.departmentId ?? "none"} value={item.departmentId ?? ""}>
                          {item.departmentName ?? "-"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="staff-location-label">{TEXT.location}</InputLabel>
                    <Select
                      labelId="staff-location-label"
                      label={TEXT.location}
                      value={filters.locationId}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          locationId:
                            event.target.value === "" ? "" : Number(event.target.value),
                        }))
                      }
                    >
                      <MenuItem value="">{TEXT.all}</MenuItem>
                      {locations.map((item) => (
                        <MenuItem key={item.locationId ?? "none"} value={item.locationId ?? ""}>
                          {toLocationOptionLabel(item)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Collapse>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2.5 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                {TEXT.totalPrefix} {rows.length}
                {TEXT.totalSuffix}
              </Typography>

              {loading ? (
                <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
                  <CircularProgress size={28} />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : rows.length === 0 ? (
                <Alert severity="info">{TEXT.noResult}</Alert>
              ) : (
                <>
                  <Box sx={{ position: "relative" }}>
                    {searching ? (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          zIndex: 1,
                          bgcolor: "rgba(255,255,255,0.55)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    ) : null}

                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width={80}>{TEXT.index}</TableCell>
                          <TableCell>{TEXT.name}</TableCell>
                          <TableCell>{TEXT.role}</TableCell>
                          <TableCell>{TEXT.department}</TableCell>
                          <TableCell>{TEXT.location}</TableCell>
                          <TableCell>{TEXT.contact}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedRows.map((item, index) => (
                          <TableRow
                            key={`${item.staffId ?? "none"}-${item.fullName ?? "unknown"}-${index}`}
                          >
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{item.fullName ?? "-"}</TableCell>
                            <TableCell>{toRoleDisplay(item.jobTitleLabel ?? item.jobTitle)}</TableCell>
                            <TableCell>{item.departmentName ?? "-"}</TableCell>
                            <TableCell>{item.locationDisplayName ?? item.locationName ?? "-"}</TableCell>
                            <TableCell>{item.phone ?? item.email ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  <TablePagination
                    component="div"
                    count={rows.length}
                    page={page}
                    onPageChange={(_, nextPage) => setPage(nextPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                      setRowsPerPage(Number(event.target.value));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[10, 20, 50]}
                    labelRowsPerPage={TEXT.rowsPerPage}
                  />
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
