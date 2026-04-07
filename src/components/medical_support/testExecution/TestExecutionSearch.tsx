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
} from "@mui/material";
import { useDispatch } from "react-redux";
import {
  TEST_EXECUTION_TYPE_OPTIONS,
  type TestExecutionSearchType,
} from "@/features/medical_support/testExecution/testExecutionType";
import { TestExecutionActions } from "@/features/medical_support/testExecution/testExecutionSlice";
import type { AppDispatch } from "@/store/store";

const DEFAULT_SEARCH_TYPE: TestExecutionSearchType = "executionType";

const SEARCH_TYPE_OPTIONS: Array<{
  value: TestExecutionSearchType;
  label: string;
}> = [{ value: "executionType", label: "검사유형" }];

export default function TestExecutionSearch() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchType, setSearchType] =
    useState<TestExecutionSearchType>(DEFAULT_SEARCH_TYPE);
  const [executionType, setExecutionType] = useState("");
  const [searchError, setSearchError] = useState("");

  const resetSearchFields = (nextSearchType: TestExecutionSearchType) => {
    setSearchType(nextSearchType);
    setExecutionType("");
    setSearchError("");
  };

  const handleSearch = () => {
    const selectedType = executionType.trim();

    if (!selectedType) {
      setSearchError("검사유형을 선택해주세요.");
      return;
    }

    setSearchError("");
    dispatch(
      TestExecutionActions.fetchTestExecutionsRequest({
        executionType: selectedType,
      })
    );
  };

  const handleReset = () => {
    resetSearchFields(DEFAULT_SEARCH_TYPE);
    dispatch(TestExecutionActions.fetchTestExecutionsRequest(undefined));
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

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="test-execution-type-label">검사유형 선택</InputLabel>
        <Select
          labelId="test-execution-type-label"
          label="검사유형 선택"
          value={executionType}
          onChange={(event) => {
            setExecutionType(String(event.target.value));
            setSearchError("");
          }}
        >
          <MenuItem value="">선택</MenuItem>
          {TEST_EXECUTION_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="outlined" size="small" onClick={handleSearch}>
        검색
      </Button>

      <Button variant="text" size="small" onClick={handleReset}>
        초기화
      </Button>

      {searchError && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {searchError}
        </Alert>
      )}
    </Box>
  );
}
