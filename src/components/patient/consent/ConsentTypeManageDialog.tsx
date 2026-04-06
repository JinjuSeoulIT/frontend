"use client";

import * as React from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import type { ConsentType } from "@/lib/patient/consentApi";
import { consentTypeKey } from "./consentUtils";

type TypeForm = { code: string; name: string; sortOrder: string };

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;

  mode: "create" | "edit";
  typeForm: TypeForm;
  onTypeFormChange: (next: TypeForm | ((prev: TypeForm) => TypeForm)) => void;

  onSaveType: () => void;
  onResetForm: () => void;

  types: ConsentType[];
  onEditType: (t: ConsentType) => void;
  onDeactivateType: (t: ConsentType) => void;
  onActivateType: (t: ConsentType) => void;
};

export default function ConsentTypeManageDialog(props: Props) {
  const {
    open,
    onClose,
    loading,
    mode,
    typeForm,
    onTypeFormChange,
    onSaveType,
    onResetForm,
    types,
    onEditType,
    onDeactivateType,
    onActivateType,
  } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>동의서 유형 관리</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="코드"
              value={typeForm.code}
              onChange={(e) => onTypeFormChange((prev) => ({ ...prev, code: e.target.value }))}
              fullWidth
              disabled={mode === "edit"}
            />
            <TextField
              label="정렬"
              value={typeForm.sortOrder}
              onChange={(e) => onTypeFormChange((prev) => ({ ...prev, sortOrder: e.target.value }))}
              sx={{ width: 100 }}
            />
          </Stack>
          <TextField
            label="표시명"
            value={typeForm.name}
            onChange={(e) => onTypeFormChange((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={onSaveType}
              disabled={loading || !typeForm.code.trim() || !typeForm.name.trim()}
            >
              {mode === "create" ? "추가" : "저장"}
            </Button>
            <Button variant="outlined" onClick={onResetForm}>
              새로 입력
            </Button>
          </Stack>

          <Divider />

          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    color: "#425366",
                    borderBottom: "1px solid var(--line)",
                  },
                }}
              >
                <TableCell>코드</TableCell>
                <TableCell>표시명</TableCell>
                <TableCell>정렬</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {types.map((t, index) => (
                <TableRow key={consentTypeKey(t, index)} hover>
                  <TableCell>{t.code}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.sortOrder ?? "-"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={t.isActive ? "활성" : "비활성"}
                      color={t.isActive ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => onEditType(t)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      {t.isActive ? (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onDeactivateType(t)}
                          title="비활성화"
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onActivateType(t)}
                          title="활성화"
                        >
                          <CheckCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {types.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">등록된 유형이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}

