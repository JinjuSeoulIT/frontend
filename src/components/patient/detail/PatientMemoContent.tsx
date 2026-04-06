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

import type { PatientMemo } from "@/lib/patient/memoApi";
import {
  createPatientMemoApi,
  deletePatientMemoApi,
  fetchPatientMemosApi,
  updatePatientMemoApi,
} from "@/lib/patient/memoApi";

type MemoFormState = { memo: string };

function formatDate(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 16).replace("T", " ");
}

type Props = { patientId: number; onClose?: () => void };

export default function PatientMemoContent({ patientId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [memos, setMemos] = React.useState<PatientMemo[]>([]);

  const [memoDialogOpen, setMemoDialogOpen] = React.useState(false);
  const [memoDialogMode, setMemoDialogMode] = React.useState<"create" | "edit">("create");
  const [editingMemo, setEditingMemo] = React.useState<PatientMemo | null>(null);
  const [memoForm, setMemoForm] = React.useState<MemoFormState>({ memo: "" });

  const loadMemos = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPatientMemosApi(patientId);
      setMemos(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  const openCreateMemo = () => {
    setMemoDialogMode("create");
    setEditingMemo(null);
    setMemoForm({ memo: "" });
    setMemoDialogOpen(true);
  };

  const openEditMemo = (item: PatientMemo) => {
    setMemoDialogMode("edit");
    setEditingMemo(item);
    setMemoForm({ memo: item.memo ?? "" });
    setMemoDialogOpen(true);
  };

  const closeMemoDialog = () => setMemoDialogOpen(false);

  const onSubmitMemo = async () => {
    if (!patientId || !memoForm.memo.trim()) return;
    try {
      if (memoDialogMode === "create") {
        await createPatientMemoApi({ patientId, memo: memoForm.memo.trim() });
      } else if (editingMemo) {
        await updatePatientMemoApi(editingMemo.memoId, { memo: memoForm.memo.trim() });
      }
      setMemoDialogOpen(false);
      await loadMemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모 저장에 실패했습니다.");
    }
  };

  const onDeleteMemo = async (item: PatientMemo) => {
    if (!confirm("이 메모를 삭제할까요?")) return;
    try {
      await deletePatientMemoApi(item.memoId);
      await loadMemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모 삭제에 실패했습니다.");
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
            <Typography fontWeight={900}>메모</Typography>
            <Button size="small" variant="outlined" onClick={openCreateMemo}>
              메모 추가
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
                <TableCell>내용</TableCell>
                <TableCell>작성자</TableCell>
                <TableCell>작성일시</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && memos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">등록된 메모가 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {memos.map((item) => (
                <TableRow key={item.memoId} hover>
                  <TableCell sx={{ whiteSpace: "pre-line" }}>{item.memo}</TableCell>
                  <TableCell>{item.createdBy ?? "-"}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => openEditMemo(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDeleteMemo(item)}>
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
        open={memoDialogOpen}
        onClose={closeMemoDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>{memoDialogMode === "create" ? "메모 추가" : "메모 수정"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="메모"
              value={memoForm.memo}
              onChange={(e) => setMemoForm((prev) => ({ ...prev, memo: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMemoDialog}>취소</Button>
          <Button variant="contained" onClick={onSubmitMemo} disabled={!memoForm.memo.trim()}>
            {memoDialogMode === "create" ? "등록" : "저장"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
