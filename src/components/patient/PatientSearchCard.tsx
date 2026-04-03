"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { PatientSearchPayload, PatientMultiSearchPayload } from "@/features/patients/patientTypes";

const SEARCH_OPTIONS: { label: string; value: PatientSearchPayload["type"] }[] = [
  { label: "환자번호", value: "patientNo" },
  { label: "이름", value: "name" },
  { label: "연락처", value: "phone" },
  { label: "생년월일", value: "birthDate" },
  { label: "환자ID", value: "patientId" },
];

type Props = {
  searchType: PatientSearchPayload["type"];
  onSearchTypeChange: (v: PatientSearchPayload["type"]) => void;
  keyword: string;
  onKeywordChange: (v: string) => void;
  multiName: string;
  multiBirthDate: string;
  multiPhone: string;
  onMultiNameChange: (v: string) => void;
  onMultiBirthDateChange: (v: string) => void;
  onMultiPhoneChange: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onMultiSearch: () => void;
  onMultiReset: () => void;
  loading: boolean;
};

export default function PatientSearchCard({
  searchType,
  onSearchTypeChange,
  keyword,
  onKeywordChange,
  multiName,
  multiBirthDate,
  multiPhone,
  onMultiNameChange,
  onMultiBirthDateChange,
  onMultiPhoneChange,
  onSearch,
  onReset,
  onMultiSearch,
  onMultiReset,
  loading,
}: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>검색</Typography>
        <Stack spacing={1.25}>
          <Stack
            spacing={1}
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              select
              size="small"
              value={searchType}
              onChange={(e) =>
                onSearchTypeChange(e.target.value as PatientSearchPayload["type"])
              }
              sx={{
                width: { xs: "100%", md: 150 },
                minWidth: { md: 140 },
              }}
            >
              {SEARCH_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
              <TextField
                size="small"
                placeholder="검색어"
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
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
          </Stack>

          <Divider />

          <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
            자동 식별(중복 환자 방지)
          </Typography>
          <TextField
            label="이름"
            size="small"
            value={multiName}
            onChange={(e) => onMultiNameChange(e.target.value)}
          />
          <TextField
            label="생년월일"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={multiBirthDate}
            onChange={(e) => onMultiBirthDateChange(e.target.value)}
          />
          <TextField
            label="연락처"
            size="small"
            value={multiPhone}
            onChange={(e) => onMultiPhoneChange(e.target.value)}
          />

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={onMultiSearch} disabled={loading} fullWidth>
              자동 식별 검색
            </Button>
            <Button variant="outlined" onClick={onMultiReset} disabled={loading} fullWidth>
              초기화
            </Button>
          </Stack>

          <Divider />

          <Typography sx={{ color: "text.secondary", fontSize: 12, lineHeight: 1.5 }}>
            · 실무에서는 <b>이름+생년월일+연락처</b> 조합으로 중복 환자(동명이인) 등록을 줄입니다.
            <br />
            · 목록에서 환자 기본 정보를 빠르게 확인하고 상세 페이지로 이동할 수 있습니다.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
