"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { DepartmentOption } from "@/features/Reservations/ReservationTypes";
import type {
  RecordDateSearchType,
  RecordSearchPayload,
  RecordSearchType,
  RecordTextSearchType,
} from "@/features/medical_support/record/recordTypes";
import { RecActions } from "@/features/medical_support/record/recordSlice";
import { fetchDepartmentsApi } from "@/lib/masterDataApi";
import type { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";

const DEFAULT_SEARCH_TYPE: RecordSearchType = "patientName";
const DATE_SEARCH_TYPE: RecordDateSearchType = "createdAt";

const SEARCH_TYPE_OPTIONS: Array<{
  value: RecordSearchType;
  label: string;
}> = [
  { value: "nurseName", label: "간호사명" },
  { value: "patientName", label: "환자명" },
  { value: "departmentName", label: "진료과" },
  { value: DATE_SEARCH_TYPE, label: "생성일시" },
];

const TEXT_SEARCH_LABELS: Record<RecordTextSearchType, string> = {
  nurseName: "간호사명 입력",
  patientName: "환자명 입력",
  departmentName: "진료과 선택",
};

const TEXT_SEARCH_ERROR_MESSAGES: Record<RecordTextSearchType, string> = {
  nurseName: "간호사명을 입력해주세요.",
  patientName: "환자명을 입력해주세요.",
  departmentName: "진료과를 선택해주세요.",
};

export default function RecordSearch() {
  const dispatch = useDispatch<AppDispatch>();

  const [searchType, setSearchType] =
    useState<RecordSearchType>(DEFAULT_SEARCH_TYPE);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState("");

  const departmentOptions = useMemo(() => {
    return [...departments]
      .filter((department) => department.departmentName.trim().length > 0)
      .sort((a, b) =>
        a.departmentName.localeCompare(b.departmentName, "ko-KR")
      );
  }, [departments]);

  useEffect(() => {
    if (searchType !== "departmentName" || departments.length > 0) {
      return;
    }

    let active = true;

    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        setDepartmentError(null);
        const departmentList = await fetchDepartmentsApi();

        if (!active) return;

        setDepartments(departmentList);
      } catch (err: unknown) {
        if (!active) return;

        const message =
          err instanceof Error && err.message
            ? err.message
            : "진료과 목록을 불러오지 못했습니다.";
        setDepartmentError(message);
      } finally {
        if (!active) return;

        setDepartmentsLoading(false);
      }
    };

    void loadDepartments();

    return () => {
      active = false;
    };
  }, [departments.length, searchType]);

  const resetSearchFields = (nextSearchType: RecordSearchType) => {
    setSearchType(nextSearchType);
    setSearchKeyword("");
    setDepartmentName("");
    setStartDate("");
    setEndDate("");
    setSearchError("");
    setDepartmentError(null);
  };

  const handleSearch = () => {
    setSearchError("");

    if (searchType === DATE_SEARCH_TYPE) {
      if (!startDate || !endDate) {
        setSearchError("시작일과 종료일을 모두 입력해주세요.");
        return;
      }

      if (startDate > endDate) {
        setSearchError("시작일은 종료일보다 늦을 수 없습니다.");
        return;
      }

      const payload: RecordSearchPayload = {
        searchType,
        startDate,
        endDate,
      };

      dispatch(RecActions.searchRecordsRequest(payload));
      return;
    }

    if (searchType === "departmentName") {
      if (departmentsLoading) {
        setSearchError("진료과 목록을 불러오는 중입니다.");
        return;
      }

      if (departmentError) {
        setSearchError("진료과 목록을 불러오지 못했습니다. 다시 시도해주세요.");
        return;
      }

      const selectedDepartment = departmentName.trim();
      if (!selectedDepartment) {
        setSearchError(TEXT_SEARCH_ERROR_MESSAGES.departmentName);
        return;
      }

      const payload: RecordSearchPayload = {
        searchType,
        searchValue: selectedDepartment,
      };

      dispatch(RecActions.searchRecordsRequest(payload));
      return;
    }

    const keyword = searchKeyword.trim();
    if (!keyword) {
      setSearchError(TEXT_SEARCH_ERROR_MESSAGES[searchType]);
      return;
    }

    const payload: RecordSearchPayload = {
      searchType,
      searchValue: keyword,
    };

    dispatch(RecActions.searchRecordsRequest(payload));
  };

  const handleResetSearch = () => {
    resetSearchFields(DEFAULT_SEARCH_TYPE);
    dispatch(RecActions.fetchRecordsRequest());
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="record-search-type-label">검색 기준</InputLabel>
        <Select
          labelId="record-search-type-label"
          label="검색 기준"
          value={searchType}
          onChange={(event) =>
            resetSearchFields(event.target.value as RecordSearchType)
          }
        >
          {SEARCH_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {searchType === DATE_SEARCH_TYPE ? (
        <>
          <TextField
            size="small"
            type="date"
            label="시작일"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setSearchError("");
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="종료일"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setSearchError("");
            }}
            InputLabelProps={{ shrink: true }}
          />
        </>
      ) : searchType === "departmentName" ? (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="record-search-department-label">
            {TEXT_SEARCH_LABELS.departmentName}
          </InputLabel>
          <Select
            labelId="record-search-department-label"
            label={TEXT_SEARCH_LABELS.departmentName}
            value={departmentName}
            onChange={(event) => {
              setDepartmentName(String(event.target.value));
              setSearchError("");
            }}
            disabled={departmentsLoading || Boolean(departmentError)}
          >
            {departmentsLoading ? (
              <MenuItem value="" disabled>
                진료과 목록 불러오는 중
              </MenuItem>
            ) : departmentOptions.length > 0 ? (
              departmentOptions.map((department) => (
                <MenuItem
                  key={department.departmentId}
                  value={department.departmentName}
                >
                  {department.departmentName}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                등록된 진료과가 없습니다
              </MenuItem>
            )}
          </Select>
        </FormControl>
      ) : (
        <TextField
          size="small"
          label={TEXT_SEARCH_LABELS[searchType]}
          value={searchKeyword}
          onChange={(event) => {
            setSearchKeyword(event.target.value);
            setSearchError("");
          }}
        />
      )}

      <Button
        variant="outlined"
        size="small"
        onClick={handleSearch}
        disabled={
          searchType === "departmentName" &&
          (departmentsLoading || Boolean(departmentError))
        }
      >
        검색
      </Button>

      <Button variant="text" size="small" onClick={handleResetSearch}>
        초기화
      </Button>

      {searchType === "departmentName" && departmentError && (
        <Alert severity="warning" sx={{ width: "100%" }}>
          진료과 목록을 불러오지 못했습니다. 다른 검색 기준은 계속 사용할 수
          있습니다.
        </Alert>
      )}

      {searchError && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {searchError}
        </Alert>
      )}
    </Box>
  );
}
