"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type { ConsentFormState } from "./consentUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  form: ConsentFormState;
  onFormChange: (next: ConsentFormState | ((prev: ConsentFormState) => ConsentFormState)) => void;
  onSave: () => void;
};

export default function ConsentEditDialog({ open, onClose, loading, form, onFormChange, onSave }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>동의서 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="동의서 유형" value={form.consentType} fullWidth disabled />
          <TextField
            label="비고"
            value={form.note}
            onChange={(e) => onFormChange((prev) => ({ ...prev, note: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="동의일시"
            type="datetime-local"
            value={form.agreedAt}
            onChange={(e) => onFormChange((prev) => ({ ...prev, agreedAt: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.activeYn}
                onChange={(e) => onFormChange((prev) => ({ ...prev, activeYn: e.target.checked }))}
              />
            }
            label="활성"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={onSave} disabled={loading || !form.consentType.trim()}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}

