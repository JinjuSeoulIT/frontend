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

import type { PatientFlag } from "@/lib/patient/flagApi";
import {
  createPatientFlagApi,
  deletePatientFlagApi,
  fetchPatientFlagsApi,
  updatePatientFlagApi,
} from "@/lib/patient/flagApi";
import { fetchCodesApi } from "@/lib/admin/codeApi";

type FlagFormState = {
  flagType: string;
  note: string;
  activeYn: boolean;
};

type FlagOption = { value: string; label: string };

function flagLabel(type: string, options: FlagOption[]) {
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

export default function PatientFlagContent({ patientId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [flags, setFlags] = React.useState<PatientFlag[]>([]);
  const [options, setOptions] = React.useState<FlagOption[]>([]);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editingFlag, setEditingFlag] = React.useState<PatientFlag | null>(null);
  const [form, setForm] = React.useState<FlagFormState>({
    flagType: "",
    note: "",
    activeYn: true,
  });

  const loadFlags = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPatientFlagsApi(patientId);
      setFlags(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "플래그 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  React.useEffect(() => {
    let mounted = true;
    const loadCodes = async () => {
      try {
        const list = await fetchCodesApi("PATIENT_FLAG");
        if (!mounted) return;
        setOptions(list.map((c) => ({ value: c.code, label: c.name })));
      } catch {
        if (mounted) setOptions([]);
      }
    };
    loadCodes();
    return () => {
      mounted = false;
    };
  }, []);

  const canCreate = options.length > 0;

  const optionsForEdit =
    dialogMode === "edit" && form.flagType && !options.some((o) => o.value === form.flagType)
      ? [{ value: form.flagType, label: form.flagType }, ...options]
      : options;

  const openCreate = () => {
    setDialogMode("create");
    setEditingFlag(null);
    setForm({ flagType: canCreate ? options[0].value : "", note: "", activeYn: true });
    setDialogOpen(true);
  };

  const openEdit = (item: PatientFlag) => {
    setDialogMode("edit");
    setEditingFlag(item);
    setForm({
      flagType: item.flagType ?? "",
      note: item.note ?? "",
      activeYn: Boolean(item.activeYn),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const onSubmit = async () => {
    if (!patientId || !form.flagType.trim()) return;
    if (dialogMode === "create" && !canCreate) {
      setError("플래그 유형이 비활성화 상태입니다.");
      return;
    }
    try {
      if (dialogMode === "create") {
        await createPatientFlagApi({
          patientId,
          flagType: form.flagType.trim(),
          note: toOptional(form.note),
        });
      } else if (editingFlag) {
        await updatePatientFlagApi(editingFlag.flagId, {
          flagType: form.flagType.trim(),
          note: toOptional(form.note),
          activeYn: form.activeYn,
        });
      }
      setDialogOpen(false);
      await loadFlags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  };

  const onToggleActive = async (item: PatientFlag) => {
    try {
      await updatePatientFlagApi(item.flagId, { activeYn: !item.activeYn });
      await loadFlags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경 실패");
    }
  };

  const onDelete = async (item: PatientFlag) => {
    if (!confirm("해당 플래그를 삭제할까요?")) return;
    try {
      await deletePatientFlagApi(item.flagId);
      await loadFlags();
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
            <Typography fontWeight={900}>환자 플래그</Typography>
            <Button size="small" variant="outlined" onClick={openCreate}>
              플래그 추가
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
                <TableCell>메모</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>생성일</TableCell>
                <TableCell>수정일</TableCell>
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
              {!loading && flags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">등록된 플래그가 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {flags.map((item) => (
                <TableRow key={item.flagId} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{flagLabel(item.flagType, options)}</TableCell>
                  <TableCell>{item.note ?? "-"}</TableCell>
                  <TableCell>{item.activeYn ? "활성" : "비활성"}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>{formatDate(item.updatedAt)}</TableCell>
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
        <DialogTitle>{dialogMode === "create" ? "플래그 추가" : "플래그 수정"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="유형"
              value={form.flagType}
              onChange={(e) => setForm((prev) => ({ ...prev, flagType: e.target.value }))}
              fullWidth
              disabled={dialogMode === "create" && !canCreate}
            >
              {optionsForEdit.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            {dialogMode === "create" && !canCreate && (
              <Typography variant="caption" color="error">
                플래그 유형이 비활성화 상태입니다.
              </Typography>
            )}
            <TextField
              label="메모"
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!form.flagType.trim() || (dialogMode === "create" && !canCreate)}
          >
            {dialogMode === "create" ? "등록" : "저장"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
