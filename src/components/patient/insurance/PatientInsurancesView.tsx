"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";

import type { Insurance, InsuranceHistory } from "@/features/insurance/insuranceTypes";
import { insuranceTypeLabel, isValidInsurance } from "./insuranceUtils";

type Props = {
  insurances: Insurance[];
  loading: boolean;
  error: string | null;
  validInsurance: Insurance | null;
  history: InsuranceHistory[];
  historyLoading: boolean;
  historyError: string | null;
  onOpenCreate: () => void;
  onEdit: (item: Insurance) => void;
  onToggleActive: (item: Insurance) => void;
};

export default function PatientInsurancesView({
  insurances,
  loading,
  error,
  validInsurance,
  history,
  historyLoading,
  historyError,
  onOpenCreate,
  onEdit,
  onToggleActive,
}: Props) {
  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography fontWeight={900}>보험 정보</Typography>
            <Button size="small" variant="outlined" onClick={onOpenCreate}>
              보험 등록
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              현재 유효 보험:
            </Typography>
            {validInsurance ? (
              <Chip
                size="small"
                color="success"
                label={`${insuranceTypeLabel(validInsurance.insuranceType)}${
                  validInsurance.policyNo ? ` (${validInsurance.policyNo})` : ""
                }`}
              />
            ) : (
              <Chip size="small" label="없음" />
            )}
          </Stack>

          {error && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    color: "#425366",
                    borderBottom: "1px solid var(--line)",
                  },
                }}
              >
                <TableCell>보험</TableCell>
                <TableCell>증권번호</TableCell>
                <TableCell>사용</TableCell>
                <TableCell>검증</TableCell>
                <TableCell>유효</TableCell>
                <TableCell>적용기간</TableCell>
                <TableCell>비고</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading && insurances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">등록된 보험이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {insurances.map((item) => (
                <TableRow key={item.insuranceId} hover>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {insuranceTypeLabel(item.insuranceType)}
                  </TableCell>
                  <TableCell>{item.policyNo ?? "-"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.activeYn ? "사용" : "중지"}
                      color={item.activeYn ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.verifiedYn ? "확인" : "미확인"}
                      color={item.verifiedYn ? "info" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={isValidInsurance(item) ? "현재" : "만료"}
                      color={isValidInsurance(item) ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {item.startDate ?? "-"} ~ {item.endDate ?? "-"}
                  </TableCell>
                  <TableCell>{item.note ?? "-"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => onEdit(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={item.activeYn ? "error" : "success"}
                        onClick={() => onToggleActive(item)}
                      >
                        {item.activeYn ? (
                          <PauseCircleOutlineOutlinedIcon fontSize="small" />
                        ) : (
                          <PlayCircleOutlineOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 4,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography fontWeight={900}>보험 변경 이력</Typography>
          </Stack>

          {historyError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {historyError}
            </Typography>
          )}

          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    color: "#425366",
                    borderBottom: "1px solid var(--line)",
                  },
                }}
              >
                <TableCell>변경 유형</TableCell>
                <TableCell>보험 ID</TableCell>
                <TableCell>변경자</TableCell>
                <TableCell>변경일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyLoading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!historyLoading && history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">이력이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {history.map((h) => (
                <TableRow key={h.historyId} hover>
                  <TableCell>{h.changeType}</TableCell>
                  <TableCell>{h.insuranceId}</TableCell>
                  <TableCell>{h.changedBy ?? "-"}</TableCell>
                  <TableCell>{h.changedAt ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

