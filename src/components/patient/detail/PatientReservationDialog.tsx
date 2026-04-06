"use client";

import * as React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import type { Department, ReservationForm } from "./PatientDetailUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  form: ReservationForm;
  onFormChange: (next: ReservationForm | ((prev: ReservationForm) => ReservationForm)) => void;
  departments: Department[];
  saving: boolean;
  onSave: () => void;
};

export default function PatientReservationDialog({
  open,
  onClose,
  form,
  onFormChange,
  departments,
  saving,
  onSave,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>예약 등록</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="진료과"
            value={form.deptCode}
            onChange={(e) => {
              const nextDeptName = e.target.value;
              const nextDept = departments.find((d) => d.name === nextDeptName);
              onFormChange((prev) => ({
                ...prev,
                deptCode: nextDeptName,
                doctorId: nextDept ? String(nextDept.doctorId) : prev.doctorId,
              }));
            }}
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
            onChange={(e) => {
              const nextDoctorId = e.target.value;
              const nextDept = departments.find((d) => String(d.doctorId) === nextDoctorId);
              onFormChange((prev) => ({
                ...prev,
                doctorId: nextDoctorId,
                deptCode: nextDept?.name ?? prev.deptCode,
              }));
            }}
            fullWidth
          >
            {departments.map((dept) => (
              <MenuItem key={dept.doctorId} value={String(dept.doctorId)}>
                {dept.doctor}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="예약 일시"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => onFormChange((prev) => ({ ...prev, scheduledAt: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="메모(선택)"
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
