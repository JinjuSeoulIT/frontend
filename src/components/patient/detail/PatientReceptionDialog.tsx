"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Department, ReceptionForm } from "./PatientDetailUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  form: ReceptionForm;
  onFormChange: (next: ReceptionForm | ((prev: ReceptionForm) => ReceptionForm)) => void;
  departments: Department[];
  saving: boolean;
  onSave: () => void;
};

export default function PatientReceptionDialog(props: Props) {
  const { open, onClose, form, onFormChange, departments, saving, onSave } = props;
  const todayDateLabel = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const handleDeptChange = (nextDeptName: string) => {
    const nextDept = departments.find((d) => d.name === nextDeptName);
    onFormChange((prev) => ({
      ...prev,
      deptCode: nextDeptName,
      doctorId: nextDept ? String(nextDept.doctorId) : prev.doctorId,
    }));
  };
  const handleDoctorChange = (nextDoctorId: string) => {
    const nextDept = departments.find((d) => String(d.doctorId) === nextDoctorId);
    onFormChange((prev) => ({
      ...prev,
      doctorId: nextDoctorId,
      deptCode: nextDept?.name ?? prev.deptCode,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>접수 등록</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="진료과"
            value={form.deptCode}
            onChange={(e) => handleDeptChange(e.target.value)}
            fullWidth
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.name}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="담당의"
            value={form.doctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            fullWidth
          >
            {departments.map((dept) => (
              <MenuItem key={dept.doctorId} value={String(dept.doctorId)}>
                {dept.doctor}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            InputProps={{ readOnly: true }}
            label="내원유형"
            value="외래"
            fullWidth
            helperText="접수 등록은 외래 접수만 지원합니다."
          />
          <TextField
            label="내원 시간(선택)"
            type="time"
            value={form.arrivedAt}
            onChange={(e) => onFormChange((prev) => ({ ...prev, arrivedAt: e.target.value }))}
            inputProps={{ step: 60 }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
            적용 날짜: {todayDateLabel} (오늘)
          </Typography>
          <TextField
            label="접수 메모(선택)"
            value={form.note}
            onChange={(e) => onFormChange((prev) => ({ ...prev, note: e.target.value }))}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={onSave} disabled={saving}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
