"use client";

import { useMemo } from "react";
import { Box, Grid, MenuItem, TextField } from "@mui/material";
import type { StaffOption } from "@/lib/medical_support/staffLookupApi";

export type StaffIdNameSelection = {
  staffId: string;
  fullName: string;
};

type GridItemSize = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
};

type PairProps = {
  staffOptions: StaffOption[];
  staffId: string;
  fullName: string;
  onChange: (next: StaffIdNameSelection) => void;
  idLabel?: string;
  nameLabel?: string;
  disabled?: boolean;
  idHelperText?: string;
  nameHelperText?: string;
};

type Props = PairProps & {
  /** 각 필드를 `Grid` 아이템으로 감쌀 때 (부모가 `Grid container`일 때) */
  wrapEachFieldInGrid?: { size: GridItemSize };
  /** 기본은 ID → 이름. 간호 기록 등 레이아웃에 맞춰 이름 → ID 로 바꿀 수 있음 */
  displayOrder?: "idThenName" | "nameThenId";
};

/** RecordForm처럼 ID/이름 필드 사이에 다른 행을 끼워 넣을 때 `idSelect`·`nameSelect`를 각각 배치 */
export function useStaffPairSelect({
  staffOptions,
  staffId,
  fullName,
  onChange,
  idLabel = "ID",
  nameLabel = "이름",
  disabled,
  idHelperText,
  nameHelperText,
}: PairProps) {
  const options = useMemo(() => {
    const sid = staffId.trim();
    if (!sid) {
      return staffOptions;
    }
    const found = staffOptions.some((o) => o.staffId === sid);
    if (found) {
      return staffOptions;
    }
    const displayName = fullName.trim() || sid;
    return [
      {
        staffId: sid,
        fullName: displayName,
        dutyCode: "",
      },
      ...staffOptions,
    ];
  }, [staffOptions, staffId, fullName]);

  const effectiveValue = staffId.trim();

  const handleSelect = (selectedId: string) => {
    if (!selectedId) {
      onChange({ staffId: "", fullName: "" });
      return;
    }
    const row = options.find((o) => o.staffId === selectedId);
    if (row) {
      onChange({ staffId: row.staffId, fullName: row.fullName });
    }
  };

  const idSelect = (
    <TextField
      select
      label={idLabel}
      value={effectiveValue}
      onChange={(e) => handleSelect(e.target.value)}
      size="small"
      fullWidth
      disabled={disabled}
      helperText={idHelperText}
    >
      <MenuItem value="">선택</MenuItem>
      {options.map((o) => (
        <MenuItem key={o.staffId} value={o.staffId}>
          {o.staffId}
        </MenuItem>
      ))}
    </TextField>
  );

  const nameSelect = (
    <TextField
      select
      label={nameLabel}
      value={effectiveValue}
      onChange={(e) => handleSelect(e.target.value)}
      size="small"
      fullWidth
      disabled={disabled}
      helperText={nameHelperText}
    >
      <MenuItem value="">선택</MenuItem>
      {options.map((o) => (
        <MenuItem key={`name-${o.staffId}`} value={o.staffId}>
          {o.fullName}
          {o.fullName && o.fullName !== o.staffId ? ` (${o.staffId})` : ""}
        </MenuItem>
      ))}
    </TextField>
  );

  return { idSelect, nameSelect };
}

export function StaffIdNameSelectFields({
  staffOptions,
  staffId,
  fullName,
  onChange,
  idLabel = "ID",
  nameLabel = "이름",
  disabled,
  idHelperText,
  nameHelperText,
  wrapEachFieldInGrid,
  displayOrder = "idThenName",
}: Props) {
  const { idSelect, nameSelect } = useStaffPairSelect({
    staffOptions,
    staffId,
    fullName,
    onChange,
    idLabel,
    nameLabel,
    disabled,
    idHelperText,
    nameHelperText,
  });

  const firstField = displayOrder === "nameThenId" ? nameSelect : idSelect;
  const secondField = displayOrder === "nameThenId" ? idSelect : nameSelect;

  if (wrapEachFieldInGrid) {
    return (
      <>
        <Grid size={wrapEachFieldInGrid.size}>{firstField}</Grid>
        <Grid size={wrapEachFieldInGrid.size}>{secondField}</Grid>
      </>
    );
  }

  return (
    <Box sx={{ display: "contents" }}>
      {firstField}
      {secondField}
    </Box>
  );
}
