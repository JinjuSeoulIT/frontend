"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ClinicalRes } from "../types";
import type { DoctorNoteRes } from "@/lib/clinical/clinicalRecordApi";
import { formatPastVisitDateDash } from "../clinicalDocumentation";

export type PriorSubjectiveApplyMode = "CC" | "PI" | "BOTH";

type Props = {
  pastClinicalsForPatient: ClinicalRes[];
  paginatedPastClinicals: ClinicalRes[];
  pastClinicalSummaries: Record<number, string>;
  pastVisitNotesById: Record<number, DoctorNoteRes | null>;
  pastVisitNotesLoading: boolean;
  visitId: number | null;
  pastClinicalPageSafe: number;
  totalPastClinicalPages: number;
  onPastClinicalPageChange: (page: number) => void;
  repeatingFromClinicalId: number | null;
  onRepeatPrescription: (fromVisitId: number) => Promise<void>;
  onApplyPriorSubjective: (fromVisitId: number, mode: PriorSubjectiveApplyMode) => Promise<boolean>;
  embedded?: boolean;
};

function noteMeta(note: DoctorNoteRes | null | undefined) {
  if (note === undefined) return { ready: false, hasNote: false, hasCc: false, hasPi: false };
  if (note === null) return { ready: true, hasNote: false, hasCc: false, hasPi: false };
  const hasCc = Boolean((note.chiefComplaint ?? "").trim());
  const hasPi = Boolean((note.presentIllness ?? "").trim());
  return { ready: true, hasNote: true, hasCc, hasPi };
}

export function ClinicalPastVisitsCard({
  pastClinicalsForPatient,
  paginatedPastClinicals,
  pastClinicalSummaries,
  pastVisitNotesById,
  pastVisitNotesLoading,
  visitId,
  pastClinicalPageSafe,
  totalPastClinicalPages,
  onPastClinicalPageChange,
  repeatingFromClinicalId,
  onRepeatPrescription,
  onApplyPriorSubjective,
  embedded = false,
}: Props) {
  const [noteDialog, setNoteDialog] = React.useState<{
    visitId: number;
    visitDateLabel: string;
  } | null>(null);

  const dialogNote = noteDialog ? pastVisitNotesById[noteDialog.visitId] : undefined;
  const dialogMeta = noteMeta(dialogNote);

  const closeDialog = () => setNoteDialog(null);

  const applyFromDialog = async (mode: PriorSubjectiveApplyMode) => {
    if (!noteDialog) return;
    const ok = await onApplyPriorSubjective(noteDialog.visitId, mode);
    if (ok) closeDialog();
  };

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
            <Typography fontWeight={800} sx={{ fontSize: 15 }}>
              과거 진료기록
            </Typography>
            <Chip label="이전 방문" size="small" variant="outlined" sx={{ height: 22, fontSize: 10 }} />
          </Stack>
        ) : null}
        {pastClinicalsForPatient.length === 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    sx={{ color: "var(--muted)", fontSize: 13, py: 2.5, textAlign: "center" }}
                  >
                    이전 방문 기록이 없습니다.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 100 }}>방문일</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 0 }}>진료 요약</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 200, whiteSpace: "nowrap" }}>
                      주관적
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, width: 80 }}>
                      처방
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPastClinicals.map((c) => {
                    const cid = c.clinicalId ?? c.id;
                    if (cid == null) return null;
                    const dateStr = formatPastVisitDateDash(c.clinicalAt ?? c.createdAt);
                    const summary = (pastClinicalSummaries[cid] ?? "").trim().split(/\n/)[0] || "";
                    const summaryDisplay =
                      summary && summary !== "-"
                        ? summary.length > 40
                          ? `${summary.slice(0, 38)}…`
                          : summary
                        : "요약 없음";
                    const note = pastVisitNotesById[cid];
                    const meta = noteMeta(note);
                    const blockSubjective = visitId == null || pastVisitNotesLoading || !meta.ready;
                    const tipLoading = pastVisitNotesLoading ? "기록을 불러오는 중입니다." : undefined;
                    const tipNoVisit = visitId == null ? "진행 중인 방문을 선택한 뒤 사용할 수 있습니다." : undefined;

                    return (
                      <TableRow key={cid} hover>
                        <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                          {dateStr}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, verticalAlign: "middle" }}>
                          {summaryDisplay}
                          {!/진료$|처방$/.test(summaryDisplay) && summaryDisplay !== "요약 없음" ? (
                            <Typography component="span" sx={{ color: "var(--muted)", fontSize: 12 }}>
                              {" "}
                              진료
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle", py: 0.5, px: 0.5 }}>
                          <Stack
                            direction="row"
                            spacing={0.25}
                            justifyContent="center"
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Tooltip title={tipLoading ?? "이 방문의 주호소·현병력을 확인합니다."}>
                              <span>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="inherit"
                                  disabled={pastVisitNotesLoading}
                                  onClick={() => setNoteDialog({ visitId: cid, visitDateLabel: dateStr })}
                                  sx={{
                                    fontSize: 11,
                                    minWidth: 0,
                                    px: 1,
                                    borderColor: "var(--line, #e0e0e0)",
                                    color: "var(--muted)",
                                  }}
                                >
                                  보기
                                </Button>
                              </span>
                            </Tooltip>
                            <Tooltip
                              title={
                                tipLoading ??
                                tipNoVisit ??
                                (!meta.hasNote
                                  ? "저장된 진료노트가 없습니다."
                                  : !meta.hasCc
                                    ? "이 방문에 입력된 주호소가 없습니다."
                                    : "주호소만 현재 차트에 반영")
                              }
                            >
                              <span>
                                <Button
                                  size="small"
                                  variant="text"
                                  disabled={blockSubjective || !meta.hasNote || !meta.hasCc}
                                  onClick={() => void onApplyPriorSubjective(cid, "CC")}
                                  sx={{ minWidth: 32, px: 0.5, fontSize: 12, fontWeight: 700 }}
                                >
                                  주
                                </Button>
                              </span>
                            </Tooltip>
                            <Tooltip
                              title={
                                tipLoading ??
                                tipNoVisit ??
                                (!meta.hasNote
                                  ? "저장된 진료노트가 없습니다."
                                  : !meta.hasPi
                                    ? "이 방문에 입력된 현병력이 없습니다."
                                    : "현병력만 현재 차트에 반영")
                              }
                            >
                              <span>
                                <Button
                                  size="small"
                                  variant="text"
                                  disabled={blockSubjective || !meta.hasNote || !meta.hasPi}
                                  onClick={() => void onApplyPriorSubjective(cid, "PI")}
                                  sx={{ minWidth: 32, px: 0.5, fontSize: 12, fontWeight: 700 }}
                                >
                                  현
                                </Button>
                              </span>
                            </Tooltip>
                            <Tooltip
                              title={
                                tipLoading ??
                                tipNoVisit ??
                                (!meta.hasNote
                                  ? "저장된 진료노트가 없습니다."
                                  : !meta.hasCc && !meta.hasPi
                                    ? "반영할 주호소·현병력이 없습니다."
                                    : "주호소·현병력을 모두 현재 차트에 반영")
                              }
                            >
                              <span>
                                <Button
                                  size="small"
                                  variant="text"
                                  disabled={blockSubjective || !meta.hasNote || (!meta.hasCc && !meta.hasPi)}
                                  onClick={() => void onApplyPriorSubjective(cid, "BOTH")}
                                  sx={{ minWidth: 32, px: 0.5, fontSize: 12, fontWeight: 700 }}
                                >
                                  전
                                </Button>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{ verticalAlign: "middle", py: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={visitId == null || repeatingFromClinicalId != null}
                            onClick={() => void onRepeatPrescription(cid)}
                          >
                            {repeatingFromClinicalId === cid ? "…" : "반복"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog open={noteDialog != null} onClose={closeDialog} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ fontSize: 16, pb: 0.5 }}>
                주관적 기록 · {noteDialog?.visitDateLabel ?? ""}
              </DialogTitle>
              <DialogContent sx={{ pt: 1 }}>
                {pastVisitNotesLoading ? (
                  <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>불러오는 중…</Typography>
                ) : !dialogMeta.ready ? (
                  <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>기록을 불러올 수 없습니다.</Typography>
                ) : !dialogMeta.hasNote ? (
                  <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>
                    저장된 진료노트가 없습니다. 주호소·현병력을 입력하면 자동으로 반영된 뒤 여기에 표시됩니다.
                  </Typography>
                ) : dialogNote ? (
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", mb: 0.5 }}>
                        주호소
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                        value={dialogNote.chiefComplaint ?? ""}
                        InputProps={{ readOnly: true }}
                        sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.02)" } }}
                      />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", mb: 0.5 }}>
                        현병력
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={5}
                        size="small"
                        value={dialogNote.presentIllness ?? ""}
                        InputProps={{ readOnly: true }}
                        sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.02)" } }}
                      />
                    </Box>
                  </Stack>
                ) : (
                  <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>
                    기록을 불러올 수 없습니다.
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
                <Button onClick={closeDialog} color="inherit">
                  닫기
                </Button>
                {visitId != null && dialogMeta.ready && dialogMeta.hasNote ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!dialogMeta.hasCc}
                      onClick={() => void applyFromDialog("CC")}
                    >
                      주호소 반영
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!dialogMeta.hasPi}
                      onClick={() => void applyFromDialog("PI")}
                    >
                      현병력 반영
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!dialogMeta.hasCc && !dialogMeta.hasPi}
                      onClick={() => void applyFromDialog("BOTH")}
                    >
                      주호소·현병력 반영
                    </Button>
                  </Stack>
                ) : null}
              </DialogActions>
            </Dialog>
            <Stack sx={{ mt: 1, alignItems: "center" }}>
              <Pagination
                page={pastClinicalPageSafe}
                count={totalPastClinicalPages}
                size="small"
                color="primary"
                onChange={(_, page) => onPastClinicalPageChange(page)}
              />
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
