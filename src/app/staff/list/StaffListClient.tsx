"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";
import StaffPasswordResetSection from "@/components/staff/StaffPasswordResetSection";
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

type Filters = {
  keyword: string;
  role: StaffRoleFilter | "";
  departmentId: string | "";
  locationId: number | "";
};

type SearchCondition = "name" | "phone";

type DepartmentOption = {
  id: string;
  label: string;
};

type ActiveSearch = {
  filters: Filters;
  searchCondition: SearchCondition;
};

type ServerPageMap = Record<number, StaffSummaryItem[]>;

type StaffListClientProps = {
  initialRows: StaffSummaryItem[];
  initialDepartments: StaffDepartmentSummaryItem[];
  initialLocations: StaffLocationSummaryItem[];
  initialError: string | null;
};

const SERVER_PAGE_SIZE = 50;

const INITIAL_FILTERS: Filters = {
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

const toText = (value: string | number | null | undefined) => {
  if (value == null) {
    return "-";
  }

  const text = String(value).trim();
  return text.length > 0 ? text : "-";
};

const toRoleDisplay = (value: string | null | undefined) => {
  switch ((value ?? "").trim().toLowerCase()) {
    case "doctor":
      return "의사";
    case "nurse":
      return "간호사";
    case "reception":
      return "원무";
    case "staff":
      return "직원";
    case "admin":
      return "관리자";
    default:
      return toText(value);
  }
};

const toStaffTypeDisplay = (value: string | null | undefined) => {
  switch ((value ?? "").trim().toUpperCase()) {
    case "DOCTOR":
      return "의사";
    case "NURSE":
      return "간호사";
    case "RECEPTION":
      return "원무";
    case "STAFF":
      return "직원";
    case "ADMIN":
      return "관리자";
    default:
      return toText(value);
  }
};

const toJobTitleDisplay = (item: StaffSummaryItem) =>
  toText(item.positionTitle ?? item.jobTitleLabel ?? item.jobTitle);

const toDepartmentLabel = (item: StaffDepartmentSummaryItem) =>
  item.departmentName ?? (item.departmentId != null ? String(item.departmentId) : "-");

const cloneFilters = (filters: Filters): Filters => ({
  keyword: filters.keyword,
  role: filters.role,
  departmentId: filters.departmentId,
  locationId: filters.locationId,
});

const normalizePhoneKeyword = (keyword: string) => keyword.replace(/\D/g, "");

const toSearchParams = (
  filters: Filters,
  searchCondition: SearchCondition,
  page: number
): StaffSearchParams => {
  const trimmedKeyword = filters.keyword.trim();
  const normalizedKeyword =
    searchCondition === "phone" ? normalizePhoneKeyword(trimmedKeyword) : trimmedKeyword;

  return {
    keyword: normalizedKeyword,
    keywordCondition: normalizedKeyword ? searchCondition : "all",
    role: filters.role,
    departmentId: filters.departmentId,
    locationId: filters.locationId,
    page,
    size: SERVER_PAGE_SIZE,
  };
};

const getStaffRowKey = (item: StaffSummaryItem, index: number) =>
  [
    item.staffId ?? "",
    item.username ?? "",
    item.accountId ?? "",
    item.fullName ?? "",
    item.phone ?? "",
    index,
  ].join("|");

const getRequiredServerPages = (targetPage: number, pageSize: number, totalCount: number) => {
  if (totalCount <= 0) {
    return [];
  }

  const start = targetPage * pageSize;
  const endExclusive = Math.min(start + pageSize, totalCount);
  const startServerPage = Math.floor(start / SERVER_PAGE_SIZE);
  const endServerPage = Math.floor(Math.max(endExclusive - 1, 0) / SERVER_PAGE_SIZE);

  return Array.from(
    { length: endServerPage - startServerPage + 1 },
    (_, index) => startServerPage + index
  );
};

export default function StaffListClient({
  initialRows,
  initialDepartments,
  initialLocations,
  initialError,
}: StaffListClientProps) {
  const [serverPages, setServerPages] = useState<ServerPageMap>(
    initialRows.length > 0 ? { 0: initialRows } : {}
  );
  const [totalCount, setTotalCount] = useState(initialRows.length);
  const [departments, setDepartments] = useState<StaffDepartmentSummaryItem[]>(initialDepartments);
  const [, setLocations] = useState<StaffLocationSummaryItem[]>(initialLocations);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchCondition, setSearchCondition] = useState<SearchCondition>("name");
  const [selectedStaff, setSelectedStaff] = useState<StaffSummaryItem | null>(null);
  const initialLoadStartedRef = useRef(false);
  const activeSearchRequestKeyRef = useRef<string | null>(null);
  const [activeSearch, setActiveSearch] = useState<ActiveSearch>({
    filters: cloneFilters(INITIAL_FILTERS),
    searchCondition: "name",
  });

  const loadedRowCount = useMemo(
    () => Object.values(serverPages).reduce((sum, items) => sum + items.length, 0),
    [serverPages]
  );

  const departmentOptions = useMemo<DepartmentOption[]>(() => {
    const seen = new Set<string>();
    return departments
      .filter((item) => item.departmentId != null)
      .map((item) => ({
        id: String(item.departmentId),
        label: toDepartmentLabel(item),
      }))
      .filter((item) => item.label.trim() !== "-" && item.label.trim() !== "")
      .filter((item) => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      })
      .sort((a, b) => a.label.localeCompare(b.label, "ko"));
  }, [departments]);

  const selectedDepartmentOption =
    filters.departmentId === ""
      ? null
      : departmentOptions.find((item) => item.id === filters.departmentId) ?? null;

  const pagedRows = useMemo(() => {
    const requiredServerPages = getRequiredServerPages(page, rowsPerPage, totalCount);
    if (requiredServerPages.length === 0) {
      return [];
    }

    const collected: StaffSummaryItem[] = [];
    for (const serverPage of requiredServerPages) {
      const items = serverPages[serverPage];
      if (!items) {
        return [];
      }
      collected.push(...items);
    }

    const globalStartIndex = page * rowsPerPage;
    const offsetWithinCollected = globalStartIndex - requiredServerPages[0] * SERVER_PAGE_SIZE;
    return collected.slice(offsetWithinCollected, offsetWithinCollected + rowsPerPage);
  }, [page, rowsPerPage, serverPages, totalCount]);

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / rowsPerPage) : 0;
  const currentGroupStart = Math.floor(page / 10) * 10;
  const visiblePageIndexes = useMemo(() => {
    if (totalPages === 0) {
      return [];
    }

    const endExclusive = Math.min(currentGroupStart + 10, totalPages);
    return Array.from(
      { length: endExclusive - currentGroupStart },
      (_, index) => currentGroupStart + index
    );
  }, [currentGroupStart, totalPages]);

  const searchRows = async ({
    nextFilters,
    nextCondition,
  }: {
    nextFilters: Filters;
    nextCondition: SearchCondition;
  }) => {
    const requestKey = JSON.stringify({
      keyword: nextFilters.keyword,
      role: nextFilters.role,
      departmentId: nextFilters.departmentId,
      locationId: nextFilters.locationId,
      searchCondition: nextCondition,
    });

    if (activeSearchRequestKeyRef.current === requestKey) {
      return;
    }

    activeSearchRequestKeyRef.current = requestKey;
    setSearching(true);

    try {
      setError(null);

      const data = await fetchStaffSummaryApi(toSearchParams(nextFilters, nextCondition, 0));

      setServerPages(data.list.length > 0 ? { 0: data.list } : {});
      setTotalCount(data.totalCount);
      setActiveSearch({
        filters: cloneFilters(nextFilters),
        searchCondition: nextCondition,
      });
      setPage(0);
    } catch {
      setServerPages({});
      setTotalCount(0);
      setPage(0);
      setError("직원 목록을 불러오지 못했습니다.");
    } finally {
      activeSearchRequestKeyRef.current = null;
      setSearching(false);
    }
  };

  const loadLookups = async () => {
    const [departmentData, locationData] = await Promise.allSettled([
      fetchStaffDepartmentSummaryApi(),
      fetchStaffLocationSummaryApi(),
    ]);

    setDepartments(departmentData.status === "fulfilled" ? departmentData.value : []);
    setLocations(locationData.status === "fulfilled" ? locationData.value : []);
  };

  const handleSearch = async () => {
    await searchRows({
      nextFilters: filters,
      nextCondition: searchCondition,
    });
  };

  const handleReset = async () => {
    setFilters(INITIAL_FILTERS);
    setSearchCondition("name");

    await searchRows({
      nextFilters: INITIAL_FILTERS,
      nextCondition: "name",
    });
  };

  const clampPageIndex = (nextPage: number) => {
    if (totalPages === 0) {
      return 0;
    }
    return Math.min(Math.max(nextPage, 0), totalPages - 1);
  };

  const ensureRowsForPage = async (targetPage: number, pageSize = rowsPerPage) => {
    const missingServerPages = getRequiredServerPages(targetPage, pageSize, totalCount).filter(
      (serverPage) => serverPages[serverPage] == null
    );

    if (missingServerPages.length === 0) {
      return true;
    }

    setLoadingMore(true);
    try {
      let nextTotalCount = totalCount;
      const fetchedPages: ServerPageMap = {};

      for (const serverPage of missingServerPages) {
        const data = await fetchStaffSummaryApi(
          toSearchParams(activeSearch.filters, activeSearch.searchCondition, serverPage)
        );
        fetchedPages[serverPage] = data.list;
        nextTotalCount = data.totalCount;
      }

      setServerPages((prev) => ({
        ...prev,
        ...fetchedPages,
      }));
      setTotalCount(nextTotalCount);
      return true;
    } catch {
      setError("직원 목록을 불러오지 못했습니다.");
      return false;
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePageNavigation = async (nextPage: number) => {
    const targetPage = clampPageIndex(nextPage);
    if (targetPage === page) {
      return;
    }

    const ready = await ensureRowsForPage(targetPage, rowsPerPage);
    if (!ready) {
      return;
    }

    setPage(targetPage);
  };

  const handleRowsPerPageChange = async (value: number) => {
    const currentFirstRowIndex = page * rowsPerPage;
    const nextRowsPerPage = value;
    const nextTotalPages = totalCount > 0 ? Math.ceil(totalCount / nextRowsPerPage) : 0;
    const targetPage =
      nextTotalPages === 0
        ? 0
        : Math.min(Math.floor(currentFirstRowIndex / nextRowsPerPage), nextTotalPages - 1);

    setRowsPerPage(nextRowsPerPage);
    setPage(targetPage);

    const ready = await ensureRowsForPage(targetPage, nextRowsPerPage);
    if (ready) {
      setPage(targetPage);
    }
  };

  useEffect(() => {
    if (initialLoadStartedRef.current) {
      return;
    }

    initialLoadStartedRef.current = true;
    void searchRows({
      nextFilters: INITIAL_FILTERS,
      nextCondition: "name",
    });
    void loadLookups();
  }, []);

  return (
    <MainLayout showSidebar={true}>
      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
          <Typography variant="h4" fontWeight={800}>
            직원관리
          </Typography>
          <Button component={Link} href="/staff/create" variant="contained">
            직원 등록
          </Button>
        </Stack>

        <Card sx={{ borderRadius: 2.5 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ md: "center" }}
              >
                <FormControl size="small" sx={{ width: { xs: "100%", md: 160 } }}>
                  <InputLabel id="search-condition-label">검색 조건</InputLabel>
                  <Select
                    labelId="search-condition-label"
                    label="검색 조건"
                    value={searchCondition}
                    onChange={(event) => setSearchCondition(event.target.value as SearchCondition)}
                  >
                    <MenuItem value="name">이름</MenuItem>
                    <MenuItem value="phone">연락처</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="검색어"
                  placeholder={searchCondition === "name" ? "이름 입력" : "연락처 입력"}
                  sx={{ width: { xs: "100%", md: 320 } }}
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

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => void handleSearch()}
                    disabled={searching || loadingMore}
                  >
                    검색
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => void handleReset()}
                    disabled={searching || loadingMore}
                  >
                    초기화
                  </Button>
                </Stack>

                <Box
                  component="button"
                  type="button"
                  onClick={() => setShowAdvancedFilters((prev) => !prev)}
                  sx={{
                    p: 0,
                    m: 0,
                    border: "none",
                    bgcolor: "transparent",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: 14,
                    fontWeight: showAdvancedFilters ? 700 : 500,
                    color: showAdvancedFilters ? "primary.main" : "text.secondary",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  상세검색 필터
                </Box>
              </Stack>

              <Collapse in={showAdvancedFilters} unmountOnExit>
                <Box
                  sx={{
                    mt: 0.5,
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(23, 90, 160, 0.2)",
                    bgcolor: "rgba(23, 90, 160, 0.06)",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 700, color: "primary.main", mb: 1.25 }}
                  >
                    상세검색 영역
                  </Typography>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <FormControl
                      size="small"
                      sx={{ width: { xs: "100%", md: 220 }, flexShrink: 0 }}
                    >
                      <InputLabel id="staff-role-label">직무</InputLabel>
                      <Select
                        labelId="staff-role-label"
                        label="직무"
                        value={filters.role}
                        onChange={(event) =>
                          setFilters((prev) => ({
                            ...prev,
                            role: event.target.value as StaffRoleFilter | "",
                          }))
                        }
                      >
                        <MenuItem value="">전체</MenuItem>
                        {ROLE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Autocomplete
                      size="small"
                      options={departmentOptions}
                      value={selectedDepartmentOption}
                      sx={{ width: { xs: "100%", md: 260 }, flexShrink: 0 }}
                      filterOptions={(options, state) => {
                        const keyword = state.inputValue.trim().toLowerCase();
                        if (!keyword) {
                          return options;
                        }

                        return options.filter((option) => {
                          const label = option.label.toLowerCase();
                          const id = option.id.toLowerCase();
                          return label.includes(keyword) || id.includes(keyword);
                        });
                      }}
                      onChange={(_, nextValue) =>
                        setFilters((prev) => ({
                          ...prev,
                          departmentId: nextValue?.id ?? "",
                        }))
                      }
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      noOptionsText="일치하는 부서가 없습니다."
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="부서"
                          placeholder="부서명 또는 부서 ID"
                        />
                      )}
                    />
                  </Stack>
                </Box>
              </Collapse>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 2.5,
            border: "1px solid rgba(23, 90, 160, 0.16)",
            background:
              "linear-gradient(180deg, rgba(23, 90, 160, 0.08) 0%, rgba(23, 90, 160, 0.03) 100%)",
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              {error ? (
                <Alert severity="error">{error}</Alert>
              ) : loadedRowCount === 0 ? (
                <Alert severity="info">조회 결과가 없습니다.</Alert>
              ) : (
                <>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="flex-end"
                    sx={{ mb: 1.5 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      페이지당 행 수
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 90 }}>
                      <Select
                        value={rowsPerPage}
                        onChange={(event) =>
                          void handleRowsPerPageChange(Number(event.target.value))
                        }
                        disabled={searching || loadingMore}
                      >
                        {[10, 20, 50].map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {loadingMore ? <CircularProgress size={18} /> : null}
                  </Stack>

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

                    <Table
                      size="small"
                      sx={{
                        "& thead .MuiTableCell-root:nth-of-type(5)": {
                          display: "none",
                        },
                        "& tbody .MuiTableCell-root:nth-of-type(5)": {
                          display: "none",
                        },
                      }}
                    >
                      <TableHead
                        sx={{
                          "& .MuiTableCell-root": {
                            bgcolor: "rgba(23, 90, 160, 0.12)",
                            fontWeight: 700,
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell width={80}>번호</TableCell>
                          <TableCell>이름</TableCell>
                          <TableCell>직무</TableCell>
                          <TableCell>부서</TableCell>
                          <TableCell>위치</TableCell>
                          <TableCell>연락처</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedRows.map((item, index) => (
                          <TableRow
                            key={getStaffRowKey(item, page * rowsPerPage + index)}
                            hover
                            onClick={() => setSelectedStaff(item)}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{toText(item.fullName)}</TableCell>
                            <TableCell>{toText(toRoleDisplay(item.roleCode ?? item.jobTitleLabel))}</TableCell>
                            <TableCell>{toText(item.departmentName)}</TableCell>
                            <TableCell>{toText(item.locationDisplayName ?? item.locationName)}</TableCell>
                            <TableCell>{toText(item.phone ?? item.email)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  {totalPages > 0 ? (
                    <Stack spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                      <Stack direction="row" justifyContent="center">
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => void handlePageNavigation(page - 10)}
                            disabled={searching || loadingMore || page === 0}
                          >
                            {"<<"}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => void handlePageNavigation(page - 1)}
                            disabled={searching || loadingMore || page === 0}
                          >
                            {"<"}
                          </Button>

                          {visiblePageIndexes.map((pageIndex) => (
                            <Button
                              key={pageIndex}
                              size="small"
                              variant={pageIndex === page ? "contained" : "outlined"}
                              onClick={() => void handlePageNavigation(pageIndex)}
                              disabled={searching || loadingMore}
                              sx={{ minWidth: 36 }}
                            >
                              {pageIndex + 1}
                            </Button>
                          ))}

                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => void handlePageNavigation(page + 1)}
                            disabled={searching || loadingMore || page >= totalPages - 1}
                          >
                            {">"}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => void handlePageNavigation(page + 10)}
                            disabled={searching || loadingMore || page >= totalPages - 1}
                          >
                            {">>"}
                          </Button>
                        </Stack>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {loadedRowCount === 0
                          ? "0 / 0"
                          : `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, totalCount)} / ${totalCount}`}
                      </Typography>
                    </Stack>
                  ) : null}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        open={selectedStaff != null}
        onClose={() => setSelectedStaff(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>직원 상세 정보</DialogTitle>
        <DialogContent dividers>
          {selectedStaff ? (
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid rgba(23, 90, 160, 0.18)",
                  bgcolor: "rgba(23, 90, 160, 0.06)",
                }}
              >
                <Typography variant="h6" fontWeight={800}>
                  {toText(selectedStaff.fullName)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {toText(toRoleDisplay(selectedStaff.roleCode))} / {" "}
                  {toText(toStaffTypeDisplay(selectedStaff.staffType))}
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    직책
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {toJobTitleDisplay(selectedStaff)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    부서
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {toText(selectedStaff.departmentName)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    연락처
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {toText(selectedStaff.phone)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    이메일
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {toText(selectedStaff.email)}
                  </Typography>
                </Grid>
              </Grid>

              <StaffPasswordResetSection
                userIdentifier={selectedStaff.username}
                staffName={selectedStaff.fullName}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedStaff(null)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
