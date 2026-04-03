"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { insuranceActions } from "@/features/insurance/insuranceSlice";
import { fetchInsuranceHistoryApi, fetchValidInsuranceApi } from "@/lib/patient/insuranceApi";
import type { Insurance, InsuranceHistory } from "@/features/insurance/insuranceTypes";

type InsuranceFormState = {
  insuranceType: string;
  policyNo: string;
  startDate: string;
  endDate: string;
  note: string;
  activeYn: boolean;
  verifiedYn: boolean;
};

function insuranceTypeLabel(type?: string) {
  if (!type) return "-";
  switch (type) {
    case "NHI":
      return "건강보험";
    case "MED":
      return "의료급여";
    case "AUTO":
      return "자동차";
    case "IND":
      return "산재";
    case "SELF":
      return "자부담";
    default:
      return type;
  }
}

function toOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function isValidInsurance(item: Insurance) {
  if (!item.activeYn) return false;
  const today = new Date().toISOString().slice(0, 10);
  const startOk = !item.startDate || item.startDate <= today;
  const endOk = !item.endDate || item.endDate >= today;
  return startOk && endOk;
}

type Props = {
  patientId: number;
  onClose?: () => void;
};

export default function PatientInsuranceContent({ patientId, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    list: insuranceList,
    loading: insuranceLoading,
    error: insuranceError,
  } = useSelector((s: RootState) => s.insurance);

  const filteredInsuranceList = React.useMemo(
    () => insuranceList.filter((item) => item.patientId === patientId),
    [insuranceList, patientId]
  );

  const [validInsurance, setValidInsurance] = React.useState<Insurance | null>(null);
  const [historyList, setHistoryList] = React.useState<InsuranceHistory[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [historyError, setHistoryError] = React.useState<string | null>(null);

  const [insuranceDialogOpen, setInsuranceDialogOpen] = React.useState(false);
  const [insuranceDialogMode, setInsuranceDialogMode] = React.useState<"create" | "edit">("create");
  const [editingInsurance, setEditingInsurance] = React.useState<Insurance | null>(null);
  const [insuranceForm, setInsuranceForm] = React.useState<InsuranceFormState>({
    insuranceType: "",
    policyNo: "",
    startDate: "",
    endDate: "",
    note: "",
    activeYn: true,
    verifiedYn: false,
  });

  React.useEffect(() => {
    dispatch(insuranceActions.clearInsurance());
    dispatch(insuranceActions.fetchInsuranceRequest({ patientId }));
  }, [dispatch, patientId]);

  const loadHistoryAndValid = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const [valid, history] = await Promise.all([
        fetchValidInsuranceApi(patientId),
        fetchInsuranceHistoryApi(patientId),
      ]);
      setValidInsurance(valid);
      setHistoryList(history);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "보험 이력 조회 실패");
    } finally {
      setHistoryLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadHistoryAndValid();
  }, [loadHistoryAndValid, insuranceList.length]);

  const openCreateInsurance = () => {
    setInsuranceDialogMode("create");
    setEditingInsurance(null);
    setInsuranceForm({
      insuranceType: "",
      policyNo: "",
      startDate: "",
      endDate: "",
      note: "",
      activeYn: true,
      verifiedYn: false,
    });
    setInsuranceDialogOpen(true);
  };

  const openEditInsurance = (item: Insurance) => {
    setInsuranceDialogMode("edit");
    setEditingInsurance(item);
    setInsuranceForm({
      insuranceType: item.insuranceType ?? "",
      policyNo: item.policyNo ?? "",
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
      note: item.note ?? "",
      activeYn: Boolean(item.activeYn),
      verifiedYn: Boolean(item.verifiedYn),
    });
    setInsuranceDialogOpen(true);
  };

  const closeInsuranceDialog = () => {
    setInsuranceDialogOpen(false);
  };

  const onSubmitInsurance = () => {
    if (!patientId) return;
    if (insuranceDialogMode === "create") {
      if (!insuranceForm.insuranceType.trim()) return;
      dispatch(
        insuranceActions.createInsuranceRequest({
          patientId,
          form: {
            patientId,
            insuranceType: insuranceForm.insuranceType,
            policyNo: toOptional(insuranceForm.policyNo),
            verifiedYn: insuranceForm.verifiedYn,
            startDate: toOptional(insuranceForm.startDate),
            endDate: toOptional(insuranceForm.endDate),
            note: toOptional(insuranceForm.note),
          },
        })
      );
      setInsuranceDialogOpen(false);
      return;
    }

    if (!editingInsurance) return;
    dispatch(
      insuranceActions.updateInsuranceRequest({
        patientId,
        insuranceId: editingInsurance.insuranceId,
        form: {
          insuranceType: insuranceForm.insuranceType || editingInsurance.insuranceType,
          policyNo: toOptional(insuranceForm.policyNo),
          activeYn: insuranceForm.activeYn,
          verifiedYn: insuranceForm.verifiedYn,
          startDate: toOptional(insuranceForm.startDate),
          endDate: toOptional(insuranceForm.endDate),
          note: toOptional(insuranceForm.note),
        },
      })
    );
    setInsuranceDialogOpen(false);
  };

  const onToggleInsuranceActive = (item: Insurance) => {
    if (!patientId) return;
    const nextActive = !item.activeYn;
    const msg = nextActive ? "보험 사용을 재개할까요?" : "보험 사용을 중지할까요?";
    if (!confirm(msg)) return;
    dispatch(
      insuranceActions.updateInsuranceRequest({
        patientId,
        insuranceId: item.insuranceId,
        form: { activeYn: nextActive },
      })
    );
  };

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
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography fontWeight={900}>보험 정보</Typography>
            <Button size="small" variant="outlined" onClick={openCreateInsurance}>
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
                label={`${insuranceTypeLabel(validInsurance.insuranceType)}${validInsurance.policyNo ? ` (${validInsurance.policyNo})` : ""}`}
              />
            ) : (
              <Chip size="small" label="없음" />
            )}
          </Stack>

          {insuranceError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {insuranceError}
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
              {insuranceLoading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!insuranceLoading && filteredInsuranceList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">등록된 보험이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {filteredInsuranceList.map((item: Insurance) => (
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
                      <IconButton size="small" onClick={() => openEditInsurance(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={item.activeYn ? "error" : "success"}
                        onClick={() => onToggleInsuranceActive(item)}
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
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
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

              {!historyLoading && historyList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">이력이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {historyList.map((h) => (
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

      <Dialog
        open={insuranceDialogOpen}
        onClose={closeInsuranceDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>
          {insuranceDialogMode === "create" ? "보험 등록" : "보험 수정"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="보험 종류"
              value={insuranceForm.insuranceType}
              onChange={(e) =>
                setInsuranceForm((prev) => ({ ...prev, insuranceType: e.target.value }))
              }
              fullWidth
            >
              <MenuItem value="NHI">건강보험</MenuItem>
              <MenuItem value="MED">의료급여</MenuItem>
              <MenuItem value="AUTO">자동차</MenuItem>
              <MenuItem value="IND">산재</MenuItem>
              <MenuItem value="SELF">자부담</MenuItem>
            </TextField>
            <TextField
              label="증권번호/가입번호"
              value={insuranceForm.policyNo}
              onChange={(e) => setInsuranceForm((prev) => ({ ...prev, policyNo: e.target.value }))}
              fullWidth
            />
            <TextField
              type="date"
              label="적용 시작일"
              InputLabelProps={{ shrink: true }}
              value={insuranceForm.startDate}
              onChange={(e) => setInsuranceForm((prev) => ({ ...prev, startDate: e.target.value }))}
              fullWidth
            />
            <TextField
              type="date"
              label="적용 종료일"
              InputLabelProps={{ shrink: true }}
              value={insuranceForm.endDate}
              onChange={(e) => setInsuranceForm((prev) => ({ ...prev, endDate: e.target.value }))}
              fullWidth
            />
            <TextField
              label="비고"
              value={insuranceForm.note}
              onChange={(e) => setInsuranceForm((prev) => ({ ...prev, note: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={insuranceForm.verifiedYn}
                  onChange={(e) =>
                    setInsuranceForm((prev) => ({ ...prev, verifiedYn: e.target.checked }))
                  }
                />
              }
              label="검증 완료"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInsuranceDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={onSubmitInsurance}
            disabled={insuranceLoading || !insuranceForm.insuranceType.trim()}
          >
            {insuranceDialogMode === "create" ? "등록" : "저장"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
