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
} from "@mui/material";
import type {
  DepartmentOption,
  DoctorOption,
} from "@/features/Reservations/ReservationTypes";
import type { ReservationForm } from "./PatientDetailUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  form: ReservationForm;
  onFormChange: (next: ReservationForm | ((prev: ReservationForm) => ReservationForm)) => void;
  departments: DepartmentOption[];
  doctors: DoctorOption[];
  saving: boolean;
  onSave: () => void;
};

export default function PatientReservationDialog({
  open,
  onClose,
  form,
  onFormChange,
  departments,
  doctors,
  saving,
  onSave,
}: Props) {
  const filteredDoctors = form.deptCode
    ? doctors.filter((doctor) => doctor.departmentId === form.deptCode)
    : doctors;

  const handleDeptChange = (nextDepartmentId: string) => {
    const nextDoctors = doctors.filter((doctor) => doctor.departmentId === nextDepartmentId);
    onFormChange((prev) => ({
      ...prev,
      deptCode: nextDepartmentId,
      doctorId: nextDoctors.some((doctor) => doctor.doctorId === prev.doctorId)
        ? prev.doctorId
        : (nextDoctors[0]?.doctorId ?? ""),
    }));
  };

  const handleDoctorChange = (nextDoctorId: string) => {
    const nextDoctor = doctors.find((doctor) => doctor.doctorId === nextDoctorId);
    onFormChange((prev) => ({
      ...prev,
      doctorId: nextDoctorId,
      deptCode: nextDoctor?.departmentId ?? prev.deptCode,
    }));
  };

  const submitDisabled = saving || departments.length === 0 || filteredDoctors.length === 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>예약 등록</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="진료과"
            value={form.deptCode}
            onChange={(e) => handleDeptChange(e.target.value)}
            fullWidth
            disabled={saving || departments.length === 0}
          >
            {departments.length === 0 ? (
              <MenuItem value="">선택 가능한 진료과가 없습니다.</MenuItem>
            ) : (
              departments.map((department) => (
                <MenuItem key={department.departmentId} value={department.departmentId}>
                  {department.departmentName}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            select
            label="담당 의사"
            value={form.doctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            fullWidth
            disabled={saving || filteredDoctors.length === 0}
          >
            {filteredDoctors.length === 0 ? (
              <MenuItem value="">선택 가능한 의사가 없습니다.</MenuItem>
            ) : (
              filteredDoctors.map((doctor) => (
                <MenuItem key={doctor.doctorId} value={doctor.doctorId}>
                  {doctor.doctorName}
                </MenuItem>
              ))
            )}
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
        <Button variant="contained" onClick={onSave} disabled={submitDisabled}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
