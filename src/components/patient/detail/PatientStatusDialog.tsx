"use client";

import * as React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import type { Option } from "./PatientDetailUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  statusCode: string;
  statusReason: string;
  statusChangedBy: string;
  onStatusCodeChange: (v: string) => void;
  onStatusReasonChange: (v: string) => void;
  onStatusChangedByChange: (v: string) => void;
  statusOptions: Option[];
  saving: boolean;
  onSave: () => void;
};

export default function PatientStatusDialog({
  open,
  onClose,
  statusCode,
  statusReason,
  statusChangedBy,
  onStatusCodeChange,
  onStatusReasonChange,
  onStatusChangedByChange,
  statusOptions,
  saving,
  onSave,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>상태 변경</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="상태"
            value={statusCode}
            onChange={(e) => onStatusCodeChange(e.target.value)}
            fullWidth
            disabled={statusOptions.length === 0}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          {statusOptions.length === 0 && (
            <Typography variant="caption" color="error">
              환자 상태 코드가 비활성화 상태입니다.
            </Typography>
          )}
          <TextField
            label="사유"
            value={statusReason}
            onChange={(e) => onStatusReasonChange(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="변경자"
            value={statusChangedBy}
            onChange={(e) => onStatusChangedByChange(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={onSave} disabled={!statusCode || saving || statusOptions.length === 0}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
