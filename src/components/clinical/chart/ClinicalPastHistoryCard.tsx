"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MedicalInformationOutlinedIcon from "@mui/icons-material/MedicalInformationOutlined";
import type { VitalSignsRes, AssessmentRes } from "@/lib/clinical/clinicalVitalsApi";
import type { PastHistoryItem, PastHistoryType } from "@/lib/clinical/clinicalPastHistoryApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  CLINICAL_SUPPORT_PAST_HISTORY_SYNC,
  formatDateTime,
  formatVitalsSummaryLine,
  parseNurseInterviewPhx,
  PAST_HISTORY_TYPE_LABEL,
  sortPastHistoryRows,
} from "../clinicalDocumentation";

type PhxFilter = PastHistoryType | "ALL";

const PHX_TYPES = Object.keys(PAST_HISTORY_TYPE_LABEL) as PastHistoryType[];

type Props = {
  selectedPatient: Patient | null;
  visitId: number | null;
  vitals: VitalSignsRes | null;
  assessment: AssessmentRes | null;
  assessmentLoading: boolean;
  pastHistoryList: PastHistoryItem[];
  pastHistoryLoading: boolean;
  onAddPhx: () => void;
  onEditPhx: (row: PastHistoryItem) => void;
  onDeletePhx: (rowId: number) => Promise<void>;
  embedded?: boolean;
};

export function ClinicalPastHistoryCard({
  selectedPatient,
  visitId,
  vitals,
  assessment,
  assessmentLoading,
  pastHistoryList,
  pastHistoryLoading,
  onAddPhx,
  onEditPhx,
  onDeletePhx,
  embedded = false,
}: Props) {
  const [phxFilter, setPhxFilter] = React.useState<PhxFilter>("ALL");

  React.useEffect(() => {
    setPhxFilter("ALL");
  }, [visitId]);

  const sortedPhx = React.useMemo(() => sortPastHistoryRows(pastHistoryList), [pastHistoryList]);
  const filteredPhx = React.useMemo(
    () => (phxFilter === "ALL" ? sortedPhx : sortedPhx.filter((r) => r.historyType === phxFilter)),
    [sortedPhx, phxFilter]
  );

  const phxTableMaxHeight = embedded ? "min(52vh, 440px)" : 200;

  return (
    <Card
      variant={embedded ? "outlined" : undefined}
      elevation={embedded ? 0 : undefined}
      sx={{
        borderRadius: 2,
        border: embedded ? "none" : "1px solid var(--line)",
        bgcolor: "#fff",
        boxShadow: embedded ? "none" : undefined,
      }}
    >
      <CardContent sx={{ py: embedded ? 0 : 1.5, "&:last-child": { pb: embedded ? 0 : 1.5 } }}>
        {!embedded ? (
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
            <MedicalInformationOutlinedIcon sx={{ fontSize: 18, color: "var(--brand)" }} />
            <Typography fontWeight={800} sx={{ fontSize: 15 }}>
              과거력 (PHx)
            </Typography>
            <Chip label="배경 과거" size="small" variant="outlined" sx={{ height: 22, fontSize: 10 }} />
          </Stack>
        ) : null}
        {!selectedPatient ? (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            환자를 선택하면 표시합니다.
          </Typography>
        ) : visitId == null ? (
          <Box
            sx={{
              py: 2,
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: 1,
              bgcolor: "#fafafa",
            }}
          >
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              진료 시작 후 이용할 수 있습니다.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.75}>
            {!CLINICAL_SUPPORT_PAST_HISTORY_SYNC ? (
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                  flexWrap="wrap"
                  gap={0.5}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)" }}>
                    이번 방 참고
                  </Typography>
                  <Chip label="연동 예정" size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, lineHeight: 1.5 }}>
                  진료 SOAP·문진·간호 기록이 연동되면 활력·문진 요약이 이 영역에 자동으로 채워집니다. 아래 PHx는 방문별
                  구조화 목록입니다.
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 88 }}>항목</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>내용</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          sx={{ color: "var(--muted)", fontSize: 13, py: 2, textAlign: "center" }}
                        >
                          연동 후 표시
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                  flexWrap="wrap"
                  gap={0.5}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)" }}>
                    이번 방 참고
                  </Typography>
                  <Chip label="미리보기" size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                </Stack>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 88 }}>항목</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>내용</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assessmentLoading ? (
                        <TableRow>
                          <TableCell colSpan={2} sx={{ py: 1.5 }}>
                            <Stack spacing={0.75}>
                              <Skeleton variant="text" width="40%" height={18} />
                              <Skeleton variant="text" width="88%" height={18} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ) : (
                        (() => {
                          const vitalsLine = formatVitalsSummaryLine(vitals);
                          const n = parseNurseInterviewPhx(assessment);
                          const hasNurse =
                            n &&
                            (n.diseases.length > 0 ||
                              n.surgeries.length > 0 ||
                              n.allergy ||
                              n.medication ||
                              n.family ||
                              n.chief ||
                              n.hpi);
                          const hasData = !!vitalsLine || !!hasNurse;
                          if (!hasData) {
                            return (
                              <TableRow>
                                <TableCell colSpan={2} sx={{ color: "var(--muted)", fontSize: 13, py: 2 }}>
                                  이번 방 참고용 데이터 없음 (좌측 SOAP 또는 연동 후)
                                </TableCell>
                              </TableRow>
                            );
                          }
                          const cells: { k: string; v: string }[] = [];
                          if (vitalsLine) cells.push({ k: "활력", v: vitalsLine });
                          if (n) {
                            if (n.chief) cells.push({ k: "주호소", v: n.chief });
                            if (n.diseases.length) cells.push({ k: "질병력", v: n.diseases.join(", ") });
                            if (n.surgeries.length) cells.push({ k: "수술력", v: n.surgeries.join(", ") });
                            if (n.allergy) cells.push({ k: "알레르기", v: n.allergy });
                            if (n.medication) cells.push({ k: "복용약", v: n.medication });
                            if (n.family) cells.push({ k: "가족력", v: n.family });
                            if (n.hpi) cells.push({ k: "현병력", v: n.hpi });
                          }
                          return cells.map((c) => (
                            <TableRow
                              key={c.k}
                              sx={
                                c.k === "알레르기"
                                  ? (t) => ({
                                      bgcolor: alpha(t.palette.error.main, 0.06),
                                      boxShadow: `inset 3px 0 0 ${t.palette.error.main}`,
                                    })
                                  : undefined
                              }
                            >
                              <TableCell sx={{ fontSize: 12, color: "var(--muted)", verticalAlign: "top" }}>
                                {c.k}
                              </TableCell>
                              <TableCell sx={{ fontSize: 13 }}>{c.v}</TableCell>
                            </TableRow>
                          ));
                        })()
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 0.5 }}
                flexWrap="wrap"
                gap={0.5}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)" }}>PHx</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
                  disabled={pastHistoryLoading}
                  onClick={onAddPhx}
                >
                  항목 추가
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, lineHeight: 1.5 }}>
                문진 서술형 과거력과 별도로, 처방·안전 확인용 구조화 항목을 관리합니다.
              </Typography>
              {pastHistoryList.length > 0 ? (
                <Box sx={{ mb: 1 }}>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={phxFilter}
                    onChange={(_, v: PhxFilter | null) => {
                      if (v != null) setPhxFilter(v);
                    }}
                    aria-label="PHx 구분 필터"
                    sx={{ flexWrap: "wrap", gap: 0.5, "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 600, fontSize: 12, py: 0.35, px: 1 } }}
                  >
                    <ToggleButton value="ALL">전체</ToggleButton>
                    {PHX_TYPES.map((t) => (
                      <ToggleButton key={t} value={t}>
                        {PAST_HISTORY_TYPE_LABEL[t]}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              ) : null}
              {pastHistoryLoading ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>구분</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>내용</TableCell>
                        <TableCell sx={{ fontWeight: 700, display: { xs: "none", sm: "table-cell" } }}>비고</TableCell>
                        <TableCell sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" }, width: 120 }}>
                          등록
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, width: 88 }}>
                          관리
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[0, 1, 2].map((i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton variant="rounded" width={56} height={22} />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="90%" />
                          </TableCell>
                          <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                            <Skeleton variant="text" width="70%" />
                          </TableCell>
                          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                            <Skeleton variant="text" width={96} />
                          </TableCell>
                          <TableCell align="right">
                            <Skeleton variant="rounded" width={72} height={32} sx={{ ml: "auto" }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : pastHistoryList.length === 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ color: "var(--muted)", fontSize: 13, py: 2.5, textAlign: "center" }}>
                          등록된 항목이 없습니다.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 1, maxHeight: phxTableMaxHeight }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "background.paper" }}>구분</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "background.paper" }}>내용</TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, display: { xs: "none", sm: "table-cell" }, bgcolor: "background.paper" }}
                        >
                          비고
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            display: { xs: "none", md: "table-cell" },
                            width: 120,
                            bgcolor: "background.paper",
                          }}
                        >
                          등록
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, width: 88, bgcolor: "background.paper" }}>
                          관리
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPhx.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            sx={{ color: "var(--muted)", fontSize: 13, py: 2, textAlign: "center" }}
                          >
                            선택한 구분에 해당하는 항목이 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPhx.map((row) => {
                          const chipColor =
                            row.historyType === "ALLERGY"
                              ? ("error" as const)
                              : row.historyType === "MEDICATION"
                                ? ("success" as const)
                                : row.historyType === "SURGERY"
                                  ? ("info" as const)
                                  : ("default" as const);
                          const allergyRow = row.historyType === "ALLERGY";
                          return (
                            <TableRow
                              key={row.id}
                              hover
                              sx={
                                allergyRow
                                  ? (t) => ({
                                      bgcolor: alpha(t.palette.error.main, 0.06),
                                      boxShadow: `inset 3px 0 0 ${t.palette.error.main}`,
                                    })
                                  : undefined
                              }
                            >
                              <TableCell sx={{ fontSize: 12, py: 0.75 }}>
                                <Chip
                                  label={PAST_HISTORY_TYPE_LABEL[row.historyType] ?? row.historyType}
                                  size="small"
                                  color={chipColor}
                                  variant={row.historyType === "DISEASE" ? "outlined" : "filled"}
                                  sx={{ height: 22, fontSize: 10 }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: 13, py: 0.75, wordBreak: "break-word" }}>
                                {row.name || "-"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontSize: 12,
                                  color: "var(--muted)",
                                  py: 0.75,
                                  display: { xs: "none", sm: "table-cell" },
                                }}
                              >
                                {(row.memo ?? "").trim() || "—"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontSize: 11,
                                  color: "var(--muted)",
                                  py: 0.75,
                                  whiteSpace: "nowrap",
                                  display: { xs: "none", md: "table-cell" },
                                }}
                              >
                                {formatDateTime(row.createdAt)}
                              </TableCell>
                              <TableCell align="right" sx={{ py: 0.5 }}>
                                <IconButton size="small" aria-label="수정" onClick={() => onEditPhx(row)}>
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  aria-label="삭제"
                                  color="error"
                                  onClick={async () => {
                                    if (row.id == null) return;
                                    if (!window.confirm("삭제할까요?")) return;
                                    try {
                                      await onDeletePhx(row.id);
                                    } catch (e) {
                                      window.alert(e instanceof Error ? e.message : "삭제 실패");
                                    }
                                  }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
