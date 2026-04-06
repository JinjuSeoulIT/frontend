"use client";

import { useState, type FormEvent } from "react";
import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import type { ReceptionSearchType } from "@/features/staff/reception/receptionTypes";

type Props = {
  onSearch?: (search: string, searchType: ReceptionSearchType) => void;
  staffId?: string;
};

export default function ReceptionSearchBar({ onSearch }: Props) {
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<ReceptionSearchType>("all");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch?.(search, searchType);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          select
          label="검색조건"
          value={searchType}
          onChange={(event) => setSearchType(event.target.value as ReceptionSearchType)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="name">이름</MenuItem>
          <MenuItem value="staffId">직원번호</MenuItem>
          <MenuItem value="dept">부서</MenuItem>
          <MenuItem value="jobTypeCd">업무구분</MenuItem>
          <MenuItem value="deskNo">창구번호</MenuItem>
          <MenuItem value="shiftType">근무형태</MenuItem>
        </TextField>

        <TextField
          label="검색어"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />

        <Button type="submit" variant="contained">
          검색
        </Button>
      </Stack>
    </Box>
  );
}
