"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  createPastHistoryApi,
  updatePastHistoryApi,
  type PastHistoryType,
} from "@/lib/clinical/clinicalPastHistoryApi";
import { PAST_HISTORY_TYPE_LABEL } from "../clinicalDocumentation";

export type PastHistoryFormState = {
  historyType: PastHistoryType;
  name: string;
  memo: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  visitId: number | null;
  editingId: number | null;
  form: PastHistoryFormState;
  onFormChange: (f: PastHistoryFormState) => void;
  onSaved: () => void | Promise<void>;
};

export function ClinicalPastHistoryDialog({
  open,
  onClose,
  visitId,
  editingId,
  form,
  onFormChange,
  onSaved,
}: Props) {
  const [saving, setSaving] = React.useState(false);

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>{editingId != null ? "PHx 수정" : "PHx 추가"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>구분</InputLabel>
            <Select
              label="구분"
              value={form.historyType}
              onChange={(e) =>
                onFormChange({ ...form, historyType: e.target.value as PastHistoryType })
              }
            >
              {(Object.keys(PAST_HISTORY_TYPE_LABEL) as PastHistoryType[]).map((t) => (
                <MenuItem key={t} value={t}>
                  {PAST_HISTORY_TYPE_LABEL[t]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            required
            size="small"
            label="내용 (질병명·수술명·알러지·약물명 등)"
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            placeholder="예: 고혈압, 페니실린, 아스피린"
          />
          <TextField
            fullWidth
            size="small"
            label="비고"
            multiline
            rows={2}
            value={form.memo}
            onChange={(e) => onFormChange({ ...form, memo: e.target.value })}
            placeholder="발병 시기, 용량, 반응 등"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "var(--brand)" }}
          disabled={saving || !form.name.trim() || visitId == null}
          onClick={async () => {
            if (visitId == null || !form.name.trim()) return;
            setSaving(true);
            try {
              if (editingId != null) {
                await updatePastHistoryApi(visitId, editingId, {
                  historyType: form.historyType,
                  name: form.name.trim(),
                  memo: form.memo.trim() || null,
                });
              } else {
                await createPastHistoryApi(visitId, {
                  historyType: form.historyType,
                  name: form.name.trim(),
                  memo: form.memo.trim() || null,
                });
              }
              await onSaved();
              onClose();
            } catch (e) {
              window.alert(e instanceof Error ? e.message : "저장 실패");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "저장 중…" : "저장"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
