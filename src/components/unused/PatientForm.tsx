"use client";

import * as React from "react";
import Link from "next/link";
import {
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import type { Patient } from "@/features/patients/patientTypes";
import { searchPatientsApi } from "@/lib/reception/patientApi";

type PatientFormState = {
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  phone: string;
  address: string;
  addressDetail: string;

  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  isForeigner: boolean;
  contactPriority: string;
  note: string;

  photoFile: File | null;
};

type PatientFormProps = {
  title: string;
  initial: PatientFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  onSubmit: (form: PatientFormPayload) => void;
  secondarySubmitLabel?: string;
  onSecondarySubmit?: (form: PatientFormPayload) => void;
  postSubmitOptions?: { label: string; onSubmit: (form: PatientFormPayload) => void }[];
  onCancel: () => void;
  onDelete?: () => void;
  showPhotoField?: boolean;
  enableDuplicateCheck?: boolean;
};

type DaumPostcodeData = { address?: string };
type DaumPostcodeInstance = { open: () => void };
type DaumPostcodeConstructor = new (opts: {
  oncomplete: (data: DaumPostcodeData) => void;
}) => DaumPostcodeInstance;
type DaumWindow = Window & {
  daum?: {
    Postcode?: DaumPostcodeConstructor;
  };
};

function toOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function toOptionalOrEmpty(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? "" : trimmed;
}

export default function PatientForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  onSubmit,
  secondarySubmitLabel,
  onSecondarySubmit,
  postSubmitOptions,
  onCancel,
  onDelete,
  showPhotoField = false,
  enableDuplicateCheck = false,
}: PatientFormProps) {
  const [form, setForm] = React.useState<PatientFormState>(initial);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [duplicateLoading, setDuplicateLoading] = React.useState(false);
  const [duplicateList, setDuplicateList] = React.useState<Patient[]>([]);
  const [postSubmitAnchorEl, setPostSubmitAnchorEl] = React.useState<null | HTMLElement>(null);
  const hasPostSubmitOptions = Boolean(postSubmitOptions && postSubmitOptions.length > 0);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("daum-postcode-script")) return;
    const script = document.createElement("script");
    script.id = "daum-postcode-script";
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleAddressSearch = () => {
    if (typeof window === "undefined") return;
    const daum = (window as DaumWindow).daum;
    if (!daum || !daum.Postcode) {
      alert("�ּ� �˻� ��ũ��Ʈ�� �ҷ����� ���Դϴ�. ��� �� �ٽ� �õ��ϼ���.");
      return;
    }
    new daum.Postcode({
      oncomplete: (data) => {
        setForm((prev) => ({
          ...prev,
          address: data.address ?? "",
          addressDetail: "",
        }));
      },
    }).open();
  };

  const buildPayload = (): PatientFormPayload | null => {
    const name = form.name.trim();
    if (!name) return null;
    return {
      name,
      email: toOptional(form.email),
      gender: toOptional(form.gender),
      birthDate: toOptional(form.birthDate),
      phone: toOptional(form.phone),
      address: toOptionalOrEmpty(form.address),
      addressDetail: toOptionalOrEmpty(form.addressDetail),

      guardianName: toOptional(form.guardianName),
      guardianPhone: toOptional(form.guardianPhone),
      guardianRelation: toOptional(form.guardianRelation),
      isForeigner: form.isForeigner,
      contactPriority: toOptional(form.contactPriority) ?? "PATIENT",
      note: toOptional(form.note),

      photoFile: form.photoFile ?? undefined,
    };
  };

  const handleSubmit = () => {
    const payload = buildPayload();
    if (!payload) return;
    onSubmit(payload);
  };

  const handleSecondarySubmit = () => {
    if (!onSecondarySubmit) return;
    const payload = buildPayload();
    if (!payload) return;
    onSecondarySubmit(payload);
  };

  const onOpenPostSubmitMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPostSubmitAnchorEl(event.currentTarget);
  };

  const onClosePostSubmitMenu = () => {
    setPostSubmitAnchorEl(null);
  };

  const onSelectPostSubmitOption = (option: {
    label: string;
    onSubmit: (form: PatientFormPayload) => void;
  }) => {
    const payload = buildPayload();
    if (!payload) return;
    onClosePostSubmitMenu();
    option.onSubmit(payload);
  };

  const handleDuplicateCheck = async () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const birthDate = form.birthDate.trim();
    if (!name && !phone && !birthDate) {
      alert("�̸�/����ó/������� �� �ϳ��� �Է��� �ּ���.");
      return;
    }
    try {
      setDuplicateLoading(true);
      const results = await Promise.all([
        name ? searchPatientsApi("name", name) : Promise.resolve([]),
        phone ? searchPatientsApi("phone", phone) : Promise.resolve([]),
        birthDate ? searchPatientsApi("birthDate", birthDate) : Promise.resolve([]),
      ]);
      const merged = new Map<number, Patient>();
      for (const list of results) {
        for (const item of list) {
          merged.set(item.patientId, item);
        }
      }
      setDuplicateList(Array.from(merged.values()));
      setDuplicateOpen(true);
    } finally {
      setDuplicateLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: "1px solid #dbe5f5",
        bgcolor: "white",
        boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          <Typography color="text.secondary" fontWeight={600}>
            ȯ�� �⺻ ������ ��Ȯ�� �Է��� �ּ���.
          </Typography>
        </Stack>
        <Divider />

        <Stack spacing={2}>
          <TextField
            label="ȯ�ڸ�"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
          <TextField
            label="�̸���"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
          <TextField
            select
            label="����"
            value={form.gender}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, gender: e.target.value }))
            }
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          >
            <MenuItem value="">���� ����</MenuItem>
            <MenuItem value="M">��</MenuItem>
            <MenuItem value="F">��</MenuItem>
          </TextField>
          <TextField
            type="date"
            label="�������"
            InputLabelProps={{ shrink: true }}
            value={form.birthDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, birthDate: e.target.value }))
            }
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
          <TextField
            label="����ó"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
          {enableDuplicateCheck && (
            <Button
              variant="outlined"
              onClick={handleDuplicateCheck}
              disabled={duplicateLoading}
              sx={{ width: "fit-content", color: "#2b5aa9" }}
            >
              {duplicateLoading ? <CircularProgress size={18} /> : "�ߺ� Ȯ��"}
            </Button>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="�ּ�"
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, address: e.target.value }))
              }
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <Button
              variant="outlined"
              onClick={handleAddressSearch}
              sx={{ minWidth: 120, color: "#2b5aa9" }}
            >
              �ּ� �˻�
            </Button>
          </Stack>
          <TextField
            label="���ּ�"
            value={form.addressDetail}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, addressDetail: e.target.value }))
            }
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />

          <Divider />
          <Typography fontWeight={800}>��ȣ�� ����</Typography>
          <TextField
            label="��ȣ�� �̸�"
            value={form.guardianName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, guardianName: e.target.value }))
            }
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
          <TextField
            label="��ȣ�� ����ó"
            value={form.guardianPhone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, guardianPhone: e.target.value }))
            }
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
          <TextField
            label="����"
            value={form.guardianRelation}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, guardianRelation: e.target.value }))
            }
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />

          <Divider />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="��/�ܱ���"
              value={form.isForeigner ? "Y" : "N"}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isForeigner: e.target.value === "Y" }))
              }
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              <MenuItem value="N">������</MenuItem>
              <MenuItem value="Y">�ܱ���</MenuItem>
            </TextField>
            <TextField
              select
              label="���� �켱����"
              value={form.contactPriority}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, contactPriority: e.target.value }))
              }
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              <MenuItem value="PATIENT">����</MenuItem>
              <MenuItem value="GUARDIAN">��ȣ��</MenuItem>
            </TextField>
          </Stack>

          <TextField
            label="�˷�����/���ǻ���"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />

          {showPhotoField && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" component="label">
                ȯ�� ����
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      photoFile: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {form.photoFile?.name ?? "���� ����"}
              </Typography>
            </Stack>
          )}
        </Stack>

        {error && (
          <Typography color="error" fontWeight={800}>
            {error}
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            ���
          </Button>
          {onDelete && (
            <Button
              variant="outlined"
              color="warning"
              onClick={onDelete}
              disabled={loading}
            >
              ��Ȱ��
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !form.name.trim()}
            sx={{ bgcolor: "#2b5aa9" }}
          >
            {submitLabel}
          </Button>
          {hasPostSubmitOptions && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={onOpenPostSubmitMenu}
                disabled={loading || !form.name.trim()}
              >
                ��� �� ����
              </Button>
              <Menu
                anchorEl={postSubmitAnchorEl}
                open={Boolean(postSubmitAnchorEl)}
                onClose={onClosePostSubmitMenu}
              >
                {(postSubmitOptions ?? []).map((option) => (
                  <MenuItem
                    key={option.label}
                    onClick={() => onSelectPostSubmitOption(option)}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {!hasPostSubmitOptions && onSecondarySubmit && secondarySubmitLabel && (
            <Button
              variant="contained"
              color="success"
              onClick={handleSecondarySubmit}
              disabled={loading || !form.name.trim()}
            >
              {secondarySubmitLabel}
            </Button>
          )}
        </Stack>
      </Stack>

      <Dialog
        open={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>�ߺ� �ĺ�</DialogTitle>
        <DialogContent>
          {duplicateList.length === 0 ? (
            <Typography color="text.secondary">�ߺ� �ĺ��� �����ϴ�.</Typography>
          ) : (
            <List>
              {duplicateList.map((p) => (
                <ListItem key={p.patientId} divider>
                  <ListItemText
                    primary={`${p.name} �� ${p.patientNo ?? p.patientId}`}
                    secondary={`${p.birthDate ?? "-"} �� ${p.phone ?? "-"}`}
                  />
                  <Button component={Link} href={`/patients/${p.patientId}`}>
                    ��
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateOpen(false)}>��� ���</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

