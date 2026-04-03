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
  MenuItem,
} from "@mui/material";
import type { InsuranceFormState } from "./insuranceUtils";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  form: InsuranceFormState;
  onFormChange: (
    next: InsuranceFormState | ((prev: InsuranceFormState) => InsuranceFormState)
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function InsuranceEditDialog({
  open,
  mode,
  loading,
  form,
  onFormChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>{mode === "create" ? "보험 등록" : "보험 수정"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="보험 종류"
            value={form.insuranceType}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                insuranceType: e.target.value,
              }))
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
            value={form.policyNo}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                policyNo: e.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            type="date"
            label="적용 시작일"
            InputLabelProps={{ shrink: true }}
            value={form.startDate}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                startDate: e.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            type="date"
            label="적용 종료일"
            InputLabelProps={{ shrink: true }}
            value={form.endDate}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                endDate: e.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label="비고"
            value={form.note}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                note: e.target.value,
              }))
            }
            fullWidth
            multiline
            minRows={2}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.verifiedYn}
                onChange={(e) =>
                  onFormChange((prev) => ({
                    ...prev,
                    verifiedYn: e.target.checked,
                  }))
                }
              />
            }
            label="검증 완료"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !form.insuranceType.trim()}
        >
          {mode === "create" ? "등록" : "저장"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

