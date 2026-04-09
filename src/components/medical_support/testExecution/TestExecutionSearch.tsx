"use client";

import { useState } from "react";
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

export type TestExecutionSearchType =
  | "executionType"
  | "patientName"
  | "progressStatus"
  | "createdAt";

export type TestExecutionSearchCriteria = {
  searchType: TestExecutionSearchType;
  searchValue: string;
  startDate: string;
  endDate: string;
};

type Props = {
  loading?: boolean;
  onSearch: (criteria: TestExecutionSearchCriteria) => void;
  onReset: () => void;
};

const DEFAULT_SEARCH_TYPE: TestExecutionSearchType = "executionType";

const SEARCH_TYPE_OPTIONS: Array<{
  value: TestExecutionSearchType;
  label: string;
}> = [
  { value: "executionType", label: "검사유형" },
  { value: "patientName", label: "환자명" },
  { value: "progressStatus", label: "진행상태" },
  { value: "createdAt", label: "생성일시" },
];

const EXECUTION_TYPE_OPTIONS = [
  "IMAGING",
  "PATHOLOGY",
  "SPECIMEN",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
] as const;

const PROGRESS_STATUS_OPTIONS = [
  { value: "WAITING", label: "대기중" },
  { value: "IN_PROGRESS", label: "검사중" },
  { value: "COMPLETED", label: "검사완료" },
  { value: "CANCELLED", label: "취소" },
] as const;

const TEXT_SEARCH_LABELS = {
  patientName: "환자명 입력",
} as const;

const TEXT_SEARCH_ERROR_MESSAGES = {
  patientName: "환자명을 입력해주세요.",
} as const;

export default function TestExecutionSearch({
  loading = false,
  onSearch,
  onReset,
}: Props) {
  const [searchType, setSearchType] =
    useState<TestExecutionSearchType>(DEFAULT_SEARCH_TYPE);
  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchError, setSearchError] = useState("");

  const resetSearchFields = (nextSearchType: TestExecutionSearchType) => {
    setSearchType(nextSearchType);
    setSearchValue("");
    setStartDate("");
    setEndDate("");
    setSearchError("");
  };

  const handleSearch = () => {
    setSearchError("");

    if (searchType === "createdAt") {
      if (!startDate || !endDate) {
        setSearchError("시작일과 종료일을 모두 입력해주세요.");
        return;
      }

      if (startDate > endDate) {
        setSearchError("시작일이 종료일보다 늦을 수 없습니다.");
        return;
      }

      onSearch({
        searchType,
        searchValue: "",
        startDate,
        endDate,
      });
      return;
    }

    const normalizedValue = searchValue.trim();
    if (!normalizedValue) {
      if (searchType === "patientName") {
        setSearchError(TEXT_SEARCH_ERROR_MESSAGES.patientName);
      } else if (searchType === "executionType") {
        setSearchError("검사유형을 선택해주세요.");
      } else {
        setSearchError("진행상태를 선택해주세요.");
      }
      return;
    }

    onSearch({
      searchType,
      searchValue: normalizedValue,
      startDate: "",
      endDate: "",
    });
  };

  const handleReset = () => {
    resetSearchFields(DEFAULT_SEARCH_TYPE);
    onReset();
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
        <InputLabel id="test-execution-search-type-label">검색 기준</InputLabel>
        <Select
          labelId="test-execution-search-type-label"
          label="검색 기준"
          value={searchType}
          onChange={(event) =>
            resetSearchFields(event.target.value as TestExecutionSearchType)
          }
        >
          {SEARCH_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {searchType === "createdAt" ? (
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
      ) : searchType === "executionType" ? (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="test-execution-search-value-label">
            검사유형 선택
          </InputLabel>
          <Select
            labelId="test-execution-search-value-label"
            label="검사유형 선택"
            value={searchValue}
            onChange={(event) => {
              setSearchValue(String(event.target.value));
              setSearchError("");
            }}
          >
            <MenuItem value="">선택</MenuItem>
            {EXECUTION_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : searchType === "progressStatus" ? (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="test-execution-progress-status-label">
            진행상태 선택
          </InputLabel>
          <Select
            labelId="test-execution-progress-status-label"
            label="진행상태 선택"
            value={searchValue}
            onChange={(event) => {
              setSearchValue(String(event.target.value));
              setSearchError("");
            }}
          >
            <MenuItem value="">선택</MenuItem>
            {PROGRESS_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          size="small"
          label={TEXT_SEARCH_LABELS.patientName}
          value={searchValue}
          onChange={(event) => {
            setSearchValue(event.target.value);
            setSearchError("");
          }}
        />
      )}

      <Button variant="outlined" size="small" onClick={handleSearch} disabled={loading}>
        검색
      </Button>

      <Button variant="text" size="small" onClick={handleReset} disabled={loading}>
        초기화
      </Button>

      {searchError ? (
        <Alert severity="error" sx={{ width: "100%" }}>
          {searchError}
        </Alert>
      ) : null}
    </Box>
  );
}
