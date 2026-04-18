"use client";

import * as React from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { ClinicalRes } from "./types";
import type { ReceptionQueueItem } from "@/lib/clinical/visitApi";
import { isTerminalVisitClinicalStatus, resolveClinicalStatus } from "./clinicalDocumentation";
import { formatDepartmentName } from "@/lib/clinical/departmentLabel";

function effectiveQueueStatusForChip(r: ReceptionQueueItem, clinicals: ClinicalRes[]): string {
  const done = clinicals.some(
    (c) =>
      c.receptionId != null &&
      Number(c.receptionId) === Number(r.receptionId) &&
      isTerminalVisitClinicalStatus(resolveClinicalStatus(c))
  );
  if (done) return "COMPLETED";
  return (r.status ?? "").trim();
}

function receptionStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase?.()) {
    case "WAITING":
    case "CALLED":
      return "대기";
    case "IN_PROGRESS":
      return "진료중";
    case "COMPLETED":
    case "DONE":
      return "완료";
    case "AUTO_CLOSED":
      return "자동마감";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "CANCELLED":
    case "CANCELED":
      return "취소";
    case "INACTIVE":
      return "비활성";
    default:
      return status?.trim() ? status : "미분류";
  }
}

function receptionStatusColor(
  status?: string | null
): "default" | "primary" | "success" | "warning" | "error" {
  const s = status?.toUpperCase?.();
  if (s === "WAITING" || s === "CALLED") return "warning";
  if (s === "IN_PROGRESS") return "success";
  if (s === "COMPLETED" || s === "DONE" || s === "AUTO_CLOSED") return "default";
  return "default";
}

type Props = {
  department: string;
  onDepartmentChange: (v: string) => void;
  paginatedLeftList: ReceptionQueueItem[];
  listForLeft: ReceptionQueueItem[];
  leftPage: number;
  totalLeftPages: number;
  onLeftPageChange: (page: number) => void;
  clinicals: ClinicalRes[];
  selectedReception: ReceptionQueueItem | null;
  onSelectReception: (r: ReceptionQueueItem) => void;
  receptionLoading?: boolean;
};

export function ClinicalPatientList({
  department,
  onDepartmentChange,
  paginatedLeftList,
  listForLeft,
  leftPage,
  totalLeftPages,
  onLeftPageChange,
  clinicals,
  selectedReception,
  onSelectReception,
  receptionLoading = false,
}: Props) {
  return (
    <Box
      sx={{
        borderRight: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.25, borderBottom: "1px solid var(--line)" }}>
        <FormControl size="small" fullWidth>
          <InputLabel>진료실</InputLabel>
          <Select value={department} label="진료실" onChange={(e) => onDepartmentChange(e.target.value)}>
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="내과">내과</MenuItem>
            <MenuItem value="정형외과">정형외과</MenuItem>
            <MenuItem value="소아과">소아과</MenuItem>
            <MenuItem value="이비인후과">이비인후과</MenuItem>
            <MenuItem value="피부과">피부과</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Typography sx={{ px: 1.5, py: 1, fontWeight: 700, fontSize: 13 }}>
        진료 대기 환자목록
      </Typography>
      <Stack spacing={0.5} sx={{ flex: 1, overflow: "auto", p: 1 }}>
        {receptionLoading && (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            접수 목록 불러오는 중…
          </Typography>
        )}
        {!receptionLoading && paginatedLeftList.map((r) => {
          const isSelected = selectedReception?.receptionId === r.receptionId;
          const displayName =
            r.patientName?.trim() || `환자 ${r.patientId ?? "-"}`;
          const queueStatus = effectiveQueueStatusForChip(r, clinicals);
          const statusLabelText = receptionStatusLabel(queueStatus || r.status);
          const statusColor = receptionStatusColor(queueStatus || r.status);
          return (
            <Box
              key={r.receptionId}
              onClick={() => onSelectReception(r)}
              sx={{
                p: 1,
                borderRadius: 1.5,
                border: "1px solid var(--line)",
                bgcolor: isSelected ? "rgba(11, 91, 143, 0.12)" : "#fff",
                cursor: "pointer",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700} sx={{ fontSize: 14 }}>
                  {displayName}
                </Typography>
                <Chip
                  label={statusLabelText}
                  color={statusColor}
                  size="small"
                  sx={{ height: 22 }}
                />
              </Stack>
              <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.25 }}>
                {r.receptionNo ?? r.receptionId} · {formatDepartmentName(r.departmentName, r.departmentId) || department}
              </Typography>
            </Box>
          );
        })}
        {!receptionLoading && !listForLeft.length && (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            조회된 접수가 없습니다.
          </Typography>
        )}
      </Stack>
      <Stack sx={{ p: 1, borderTop: "1px solid var(--line)" }}>
        <Pagination
          page={leftPage}
          count={totalLeftPages}
          size="small"
          color="primary"
          disabled={listForLeft.length === 0}
          onChange={(_, page) => onLeftPageChange(page)}
        />
      </Stack>
    </Box>
  );
}
