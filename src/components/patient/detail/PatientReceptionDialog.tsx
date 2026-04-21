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
import type {
  DepartmentOption,
  DoctorOption,
} from "@/features/Reservations/ReservationTypes";
import type { ReceptionForm } from "./PatientDetailUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  form: ReceptionForm;
  onFormChange: (next: ReceptionForm | ((prev: ReceptionForm) => ReceptionForm)) => void;
  departments: DepartmentOption[];
  doctors: DoctorOption[];
  saving: boolean;
  onSave: () => void;
};

export default function PatientReceptionDialog(props: Props) {
  const { open, onClose, form, onFormChange, departments, doctors, saving, onSave } = props;
  const todayDateLabel = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

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
      <DialogTitle>접수 등록</DialogTitle>
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
            InputProps={{ readOnly: true }}
            label="내원 유형"
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
        <Button variant="contained" onClick={onSave} disabled={submitDisabled}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
