"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ClinicalOrder } from "@/lib/clinical/clinicalOrderApi";
import { ORDER_TYPE_LABELS, formatDateTime } from "../clinicalDocumentation";

export type OrderResultCategory = "exam" | "procedure" | "medication";

type Props = {
  open: boolean;
  onClose: () => void;
  order: ClinicalOrder | null;
  category: OrderResultCategory;
  patientName?: string | null;
  orderStatusNorm?: string;
};

const MOCK_LAB_ROWS: { name: string; value: string; unit: string; ref: string; flag?: "H" | "L" }[] = [
  { name: "WBC", value: "7.2", unit: "10³/μL", ref: "4.0–10.0" },
  { name: "Hb", value: "13.1", unit: "g/dL", ref: "12.0–16.0" },
  { name: "Glucose", value: "102", unit: "mg/dL", ref: "70–99", flag: "H" },
  { name: "CRP", value: "0.4", unit: "mg/L", ref: "< 0.5" },
];

function orderTitleName(ord: ClinicalOrder): string {
  if (
    ord.orderName &&
    !(Object.keys(ORDER_TYPE_LABELS) as string[]).includes(ord.orderName)
  ) {
    return ord.orderName;
  }
  return ORDER_TYPE_LABELS[ord.orderType];
}

export function ClinicalOrderResultDialog({
  open,
  onClose,
  order,
  category,
  patientName,
  orderStatusNorm,
}: Props) {
  const inProgress = orderStatusNorm === "IN_PROGRESS";
  const cancelled = orderStatusNorm === "CANCELLED";
  const completed = orderStatusNorm === "COMPLETED";
  const pending =
    !cancelled &&
    !completed &&
    !inProgress &&
    (orderStatusNorm === "REQUESTED" || orderStatusNorm === "REQUEST" || orderStatusNorm === "");
  const showExamSampleTable =
    category === "exam" && (completed || inProgress) && !cancelled;
  const reportedAt = order?.createdAt
    ? formatDateTime(order.createdAt)
    : "—";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontSize: 17, fontWeight: 700 }}>
        {category === "exam" && "검사 결과"}
        {category === "procedure" && "처치 결과"}
        {category === "medication" && "투약·시행 정보"}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {order ? (
          <Stack spacing={2}>
            {cancelled ? (
              <Alert severity="warning" sx={{ fontSize: 13 }}>
                취소된 오더입니다. 연동 결과·수치는 표시되지 않습니다.
              </Alert>
            ) : null}
            {!cancelled && pending ? (
              <Alert severity="info" sx={{ fontSize: 13 }}>
                접수·대기 중입니다. 결과는 시행 완료 후 조회할 수 있습니다.
              </Alert>
            ) : null}
            {!cancelled && inProgress ? (
              <Alert severity="info" sx={{ fontSize: 13 }}>
                진행 중인 오더입니다. 최종 결과·판독은 완료 후 갱신됩니다.
              </Alert>
            ) : null}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {orderTitleName(order)}
                  </Typography>
                  <Chip
                    size="small"
                    label={ORDER_TYPE_LABELS[order.orderType]}
                    variant="outlined"
                    sx={{ height: 22, fontSize: 11 }}
                  />
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={2} sx={{ typography: "body2", fontSize: 12 }}>
                  <span>
                    <Typography component="span" color="text.secondary">
                      환자{" "}
                    </Typography>
                    {(patientName ?? "").trim() || "—"}
                  </span>
                  <span>
                    <Typography component="span" color="text.secondary">
                      보고·기준 시각{" "}
                    </Typography>
                    {reportedAt}
                  </span>
                  <span>
                    <Typography component="span" color="text.secondary">
                      오더 ID{" "}
                    </Typography>
                    {order.id}
                  </span>
                </Stack>
              </Stack>
            </Box>

            {category === "exam" && showExamSampleTable ? (
              <>
                <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 700 }}>
                  검사 수치
                </Typography>
                <TableContainer
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    maxHeight: 280,
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: "action.hover" }}>
                          항목
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, fontSize: 11, bgcolor: "action.hover", width: 72 }}
                        >
                          결과
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: "action.hover", width: 64 }}>
                          단위
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: "action.hover", width: 88 }}>
                          참고치
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 700, fontSize: 11, bgcolor: "action.hover", width: 44 }}
                        >
                          Δ
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {MOCK_LAB_ROWS.map((row) => (
                        <TableRow key={row.name} hover>
                          <TableCell sx={{ fontSize: 12 }}>{row.name}</TableCell>
                          <TableCell align="right" sx={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                            {row.value}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>{row.unit}</TableCell>
                          <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>{row.ref}</TableCell>
                          <TableCell align="center">
                            {row.flag === "H" ? (
                              <Chip label="H" size="small" color="warning" sx={{ height: 20, fontSize: 10 }} />
                            ) : row.flag === "L" ? (
                              <Chip label="L" size="small" color="info" sx={{ height: 20, fontSize: 10 }} />
                            ) : (
                              <Typography component="span" sx={{ fontSize: 11, color: "text.disabled" }}>
                                —
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ p: 1.25, bgcolor: "grey.50", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 0.5 }}>소견·코멘트</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
                    진료지원 연동 후 판독 문구가 표시됩니다. (화면 구성용 샘플)
                  </Typography>
                </Box>
              </>
            ) : null}
            {category === "exam" && !showExamSampleTable ? (
              <Box sx={{ p: 1.5, borderRadius: 1, border: "1px dashed", borderColor: "divider", bgcolor: "grey.50" }}>
                <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.55 }}>
                  이 상태에서는 검사 수치·판독 샘플을 숨깁니다. 완료·진행 중 오더는 동일 레이아웃으로 결과가 채워집니다.
                </Typography>
              </Box>
            ) : null}

            {category === "procedure" && !cancelled ? (
              <Box sx={{ p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 1 }}>처치 내용</Typography>
                <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: "text.secondary" }}>
                  시행 일시·부위·소모품·특이사항 등은 진료지원 기록 연동 후 표시됩니다.
                </Typography>
              </Box>
            ) : null}

            {category === "medication" && !cancelled ? (
              <Box sx={{ p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 1 }}>투약·시행</Typography>
                <Stack spacing={0.5} sx={{ fontSize: 12 }}>
                  <Typography color="text.secondary">용법·용량·시행 확인 등은 연동 후 표시됩니다.</Typography>
                </Stack>
              </Box>
            ) : null}

            <Divider />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              API 연결 전 UI입니다. 실제 결과는 진료지원·임상 연동 후 동일 레이아웃에 반영할 수 있습니다.
            </Typography>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={onClose} sx={{ textTransform: "none", minWidth: 88 }}>
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
