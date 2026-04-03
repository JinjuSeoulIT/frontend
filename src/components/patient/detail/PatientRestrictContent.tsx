"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import type { PatientRestriction } from "@/lib/patient/restrictionApi";
import {
  createPatientRestrictionApi,
  deletePatientRestrictionApi,
  fetchPatientRestrictionsApi,
  updatePatientRestrictionApi,
} from "@/lib/patient/restrictionApi";
import { fetchCodesApi } from "@/lib/admin/codeApi";

type RestrictionFormState = {
  restrictionType: string;
  reason: string;
  endAt: string;
  activeYn: boolean;
};

type RestrictionOption = { value: string; label: string };

function restrictionLabel(type: string | undefined | null, options: RestrictionOption[]) {
  if (!type) return "-";
  const found = options.find((opt) => opt.value === type);
  return found ? found.label : type;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 16).replace("T", " ");
}

function toOptional(value: string) {
  const t = value.trim();
  return t.length === 0 ? undefined : t;
}

type Props = { patientId: number; onClose?: () => void };

export default function PatientRestrictContent({ patientId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [restrictions, setRestrictions] = React.useState<PatientRestriction[]>([]);
  const [restrictionOptions, setRestrictionOptions] = React.useState<RestrictionOption[]>([]);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editingRestriction, setEditingRestriction] = React.useState<PatientRestriction | null>(null);
  const [form, setForm] = React.useState<RestrictionFormState>({
    restrictionType: "",
    reason: "",
    endAt: "",
    activeYn: true,
  });

  const loadRestrictions = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPatientRestrictionsApi(patientId);
      setRestrictions(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "제한 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadRestrictions();
  }, [loadRestrictions]);

  React.useEffect(() => {
    let mounted = true;
    const loadRestrictionCodes = async () => {
      try {
        const list = await fetchCodesApi("PATIENT_RESTRICTION");
        if (!mounted) return;
        setRestrictionOptions(list.map((c) => ({ value: c.code, label: c.name })));
      } catch {
        if (mounted) setRestrictionOptions([]);
      }
    };
    loadRestrictionCodes();
    return () => {
      mounted = false;
    };
  }, []);

  const openCreate = () => {
    setDialogMode("create");
    setEditingRestriction(null);
    setForm({ restrictionType: "", reason: "", endAt: "", activeYn: true });
    setDialogOpen(true);
  };

  const openEdit = (item: PatientRestriction) => {
    setDialogMode("edit");
    setEditingRestriction(item);
    setForm({
      restrictionType: item.restrictionType ?? "",
      reason: item.reason ?? "",
      endAt: item.endAt ?? "",
      activeYn: Boolean(item.activeYn),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const onSubmit = async () => {
    if (!patientId || !form.restrictionType.trim()) return;
    try {
      if (dialogMode === "create") {
        await createPatientRestrictionApi({
          patientId,
          restrictionType: form.restrictionType.trim(),
          reason: toOptional(form.reason),
          endAt: toOptional(form.endAt),
        });
      } else if (editingRestriction) {
        await updatePatientRestrictionApi(editingRestriction.restrictionId, {
          restrictionType: form.restrictionType.trim(),
          reason: toOptional(form.reason),
          endAt: toOptional(form.endAt),
          activeYn: form.activeYn,
        });
      }
      setDialogOpen(false);
      await loadRestrictions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  };

  const onToggleActive = async (item: PatientRestriction) => {
    try {
      await updatePatientRestrictionApi(item.restrictionId, { activeYn: !item.activeYn });
      await loadRestrictions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경 실패");
    }
  };

  const onDelete = async (item: PatientRestriction) => {
    if (!confirm("이 제한을 삭제할까요?")) return;
    try {
      await deletePatientRestrictionApi(item.restrictionId);
      await loadRestrictions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{ borderRadius: 4, border: "1px solid var(--line)", boxShadow: "var(--shadow-2)" }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography fontWeight={900}>환자 제한</Typography>
            <Button size="small" variant="outlined" onClick={openCreate}>
              제한 추가
            </Button>
          </Stack>

          {error && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow sx={{ "& th": { fontWeight: 800, color: "#425366", borderBottom: "1px solid var(--line)" } }}>
                <TableCell>유형</TableCell>
                <TableCell>사유</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>시작</TableCell>
                <TableCell>종료</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && restrictions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">등록된 제한이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {restrictions.map((item) => (
                <TableRow key={item.restrictionId} hover>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {restrictionLabel(item.restrictionType, restrictionOptions)}
                  </TableCell>
                  <TableCell>{item.reason ?? "-"}</TableCell>
                  <TableCell>{item.activeYn ? "활성" : "비활성"}</TableCell>
                  <TableCell>{formatDate(item.startAt)}</TableCell>
                  <TableCell>{formatDate(item.endAt)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => openEdit(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={item.activeYn ? "warning" : "success"}
                        onClick={() => onToggleActive(item)}
                      >
                        {item.activeYn ? (
                          <BlockOutlinedIcon fontSize="small" />
                        ) : (
                          <CheckCircleOutlineOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDelete(item)}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>{dialogMode === "create" ? "제한 추가" : "제한 수정"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="유형"
              value={form.restrictionType}
              onChange={(e) => setForm((prev) => ({ ...prev, restrictionType: e.target.value }))}
              fullWidth
              disabled={restrictionOptions.length === 0}
            >
              {restrictionOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            {restrictionOptions.length === 0 && (
              <Typography variant="caption" color="error">
                제한 유형이 비활성화 상태입니다.
              </Typography>
            )}
            <TextField
              label="사유"
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              type="datetime-local"
              label="종료 시각"
              InputLabelProps={{ shrink: true }}
              value={form.endAt}
              onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!form.restrictionType.trim() || restrictionOptions.length === 0}
          >
            {dialogMode === "create" ? "등록" : "저장"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
