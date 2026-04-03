"use client";

import { useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { RecActions } from "@/features/medical_support/record/recordSlice";

export default function RecordSearch() {
  const dispatch = useDispatch<AppDispatch>();

  const [searchType, setSearchType] = useState("nurseName");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleSearch = () => {
    setSearchError("");
    const keyword = searchKeyword.trim();

    if (searchType === "recordedAt") {
      if (!startDate || !endDate) {
        setSearchError("시작일과 종료일을 모두 입력해주세요.");
        return;
      }

      dispatch(
        RecActions.searchRecordsRequest({
          searchType,
          startDate,
          endDate,
        })
      );
      return;
    }

    if (!keyword) {
      setSearchError("간호사명을 입력해주세요.");
      return;
    }

    dispatch(
      RecActions.searchRecordsRequest({
        searchType,
        searchValue: keyword,
      })
    );
  };

  const handleResetSearch = () => {
    setSearchType("nurseName");
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    setSearchError("");
    dispatch(RecActions.fetchRecordsRequest());
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
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
          onChange={(event) => {
            setSearchType(String(event.target.value));
            setSearchKeyword("");
            setStartDate("");
            setEndDate("");
            setSearchError("");
          }}
        >
          <MenuItem value="nurseName">간호사명</MenuItem>
          <MenuItem value="recordedAt">기록일시</MenuItem>
        </Select>
      </FormControl>

      {searchType === "recordedAt" ? (
        <>
          <TextField
            type="date"
            size="small"
            label="시작일"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <TextField
            type="date"
            size="small"
            label="종료일"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </>
      ) : (
        <TextField
          size="small"
          label="간호사명 입력"
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
        />
      )}

      <Button variant="outlined" size="small" onClick={handleSearch}>
        검색
      </Button>

      <Button variant="text" size="small" onClick={handleResetSearch}>
        초기화
      </Button>

      {searchError && (
        <div style={{ color: "red", width: "100%" }}>
          {searchError}
        </div>
      )}
    </div>
  );
}