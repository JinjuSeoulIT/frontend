"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type { Patient } from "@/features/patients/patientTypes";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import { searchPatientsApi } from "@/lib/patient/patientApi";

type DaumPostcodeData = { address?: string };
type DaumPostcodeInstance = { open: () => void };
type DaumPostcodeConstructor = new (opts: {
  oncomplete: (data: DaumPostcodeData) => void;
}) => DaumPostcodeInstance;
type DaumWindow = Window & { daum?: { Postcode?: DaumPostcodeConstructor } };

const PATIENT_TYPES = [
  { value: "VIP", label: "VIP" },
  { value: "지인추천", label: "지인추천" },
  { value: "검색방문", label: "검색방문" },
  { value: "실비O", label: "실비O" },
  { value: "실비X", label: "실비X" },
] as const;

type FormState = {
  name: string;
  rrn1: string;
  rrn2: string;
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
  patientType: string;
  note: string;
  consentRequired: boolean;
  consentOptional: boolean;
  consentAll: boolean;
};

const emptyForm: FormState = {
  name: "",
  rrn1: "",
  rrn2: "",
  email: "",
  gender: "",
  birthDate: "",
  phone: "",
  address: "",
  addressDetail: "",
  guardianName: "",
  guardianPhone: "",
  guardianRelation: "",
  isForeigner: false,
  contactPriority: "PATIENT",
  patientType: "",
  note: "",
  consentRequired: false,
  consentOptional: false,
  consentAll: false,
};

function toOptional(v: string) {
  const t = v.trim();
  return t.length === 0 ? undefined : t;
}

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  patient?: Patient | null;
  initialName?: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (form: PatientFormPayload) => void;
  onSubmitAndReception?: (form: PatientFormPayload) => void;
  onDelete?: () => void;
};

export default function PatientFormModal({
  open,
  onClose,
  mode,
  patient = null,
  initialName = "",
  loading = false,
  error = null,
  onSubmit,
  onSubmitAndReception,
  onDelete,
}: Props) {
  const isCreate = mode === "create";

  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [duplicateLoading, setDuplicateLoading] = React.useState(false);
  const [duplicateList, setDuplicateList] = React.useState<Patient[]>([]);

  React.useEffect(() => {
    if (!open) return;
    if (isCreate) {
      setForm({
        ...emptyForm,
        name: initialName,
      });
    } else if (patient) {
      setForm({
        ...emptyForm,
        name: patient.name ?? "",
        email: patient.email ?? "",
        gender: patient.gender ?? "",
        birthDate: patient.birthDate ?? "",
        phone: patient.phone ?? "",
        address: patient.address ?? "",
        addressDetail: patient.addressDetail ?? "",
        guardianName: patient.guardianName ?? "",
        guardianPhone: patient.guardianPhone ?? "",
        guardianRelation: patient.guardianRelation ?? "",
        isForeigner: Boolean(patient.isForeigner),
        contactPriority: patient.contactPriority ?? "PATIENT",
        note: patient.note ?? "",
        consentRequired: true,
        consentOptional: false,
        consentAll: false,
      });
    }
  }, [open, isCreate, patient, initialName]);

  React.useEffect(() => {
    if (form.consentAll) {
      setForm((p) => ({ ...p, consentRequired: true, consentOptional: true }));
    }
  }, [form.consentAll]);

  React.useEffect(() => {
    if (form.rrn2.length >= 1 && isCreate) {
      const first = form.rrn2[0];
      setForm((p) => ({
        ...p,
        gender: "13579".includes(first) ? "M" : "F",
      }));
    }
  }, [form.rrn2, isCreate]);

  React.useEffect(() => {
    if (form.rrn1.length >= 6 && isCreate) {
      const yy = form.rrn1.slice(0, 2);
      const mm = form.rrn1.slice(2, 4);
      const dd = form.rrn1.slice(4, 6);
      const prefix = parseInt(yy, 10) <= 24 ? "20" : "19";
      setForm((p) => ({
        ...p,
        birthDate: `${prefix}${yy}-${mm}-${dd}`,
      }));
    }
  }, [form.rrn1, isCreate]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("daum-postcode-script")) return;
    const s = document.createElement("script");
    s.id = "daum-postcode-script";
    s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const handleAddressSearch = () => {
    const daum = (window as DaumWindow).daum;
    if (!daum?.Postcode) {
      alert("주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }
    new daum.Postcode({
      oncomplete: (data) => {
        setForm((p) => ({ ...p, address: data.address ?? "", addressDetail: "" }));
      },
    }).open();
  };

  const buildPayload = (): PatientFormPayload | null => {
    const n = form.name.trim();
    if (!n) return null;
    if (isCreate && !form.consentRequired) return null;

    const note = form.note.trim() || undefined;

    const hasGuardian = !!(form.guardianName?.trim() || form.guardianPhone?.trim() || form.guardianRelation?.trim());
    const families = hasGuardian
      ? [
          {
            relation: form.guardianRelation?.trim() || "보호자",
            familyName: form.guardianName?.trim() || "보호자",
            familyPhone: form.guardianPhone?.trim() || undefined,
            isPrimary: true as const,
          },
        ]
      : undefined;

    return {
      name: n,
      email: toOptional(form.email),
      gender: toOptional(form.gender),
      birthDate: toOptional(form.birthDate),
      phone: toOptional(form.phone),
      address: form.address?.trim() || undefined,
      addressDetail: form.addressDetail?.trim() || undefined,
      guardianName: toOptional(form.guardianName),
      guardianPhone: toOptional(form.guardianPhone),
      guardianRelation: toOptional(form.guardianRelation),
      isForeigner: form.isForeigner,
      isVip: form.patientType === "VIP",
      contactPriority: form.contactPriority || "PATIENT",
      note,
      consentRequired: form.consentRequired,
      consentOptional: form.consentOptional,
      families,
    };
  };

  const handleSubmit = () => {
    const p = buildPayload();
    if (p) {
      onSubmit(p);
    } else {
      if (!form.name.trim()) alert("이름을 입력해 주세요.");
      else if (isCreate && !form.consentRequired) alert("(필수) 개인정보 수집·이용 동의에 체크해 주세요.");
    }
  };

  const handleSubmitAndReception = () => {
    const p = buildPayload();
    if (p && onSubmitAndReception) {
      onSubmitAndReception(p);
    } else {
      if (!form.name.trim()) alert("이름을 입력해 주세요.");
      else if (isCreate && !form.consentRequired) alert("(필수) 개인정보 수집·이용 동의에 체크해 주세요.");
    }
  };

  const handleDuplicateCheck = async () => {
    const [n, ph, b] = [form.name.trim(), form.phone.trim(), form.birthDate.trim()];
    if (!n && !ph && !b) {
      alert("이름/연락처/생년월일 중 하나는 입력해 주세요.");
      return;
    }
    try {
      setDuplicateLoading(true);
      const [r1, r2, r3] = await Promise.all([
        n ? searchPatientsApi("name", n) : Promise.resolve([]),
        ph ? searchPatientsApi("phone", ph) : Promise.resolve([]),
        b ? searchPatientsApi("birthDate", b) : Promise.resolve([]),
      ]);
      const m = new Map<number, Patient>();
      for (const list of [r1, r2, r3])
        for (const item of list) m.set(item.patientId, item);
      setDuplicateList(Array.from(m.values()));
      setDuplicateOpen(true);
    } finally {
      setDuplicateLoading(false);
    }
  };

  const fieldSx = { "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } } as const;
  const canSubmit = form.name.trim() && (!isCreate || form.consentRequired);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          boxShadow: "0 20px 40px rgba(23, 52, 97, 0.18)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: "1px solid #e8eef7" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <PersonOutlineIcon sx={{ color: "#2b5aa9", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={900}>
            {isCreate ? "신규환자등록" : "환자 정보 수정"}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <DialogContent sx={{ p: 3, maxHeight: "70vh", overflow: "auto" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label="이름*"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
            {isCreate && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  주민등록번호(외국인등록번호)*
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                  <TextField
                    placeholder="앞 6자리"
                    value={form.rrn1}
                    onChange={(e) => setForm((p) => ({ ...p, rrn1: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    sx={{ ...fieldSx, width: 100 }}
                  />
                  <Typography>-</Typography>
                  <TextField
                    placeholder="뒤 7자리"
                    value={form.rrn2}
                    onChange={(e) => setForm((p) => ({ ...p, rrn2: e.target.value.replace(/\D/g, "").slice(0, 7) }))}
                    sx={{ ...fieldSx, width: 120 }}
                  />
                  {form.rrn2.length >= 1 && (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({form.rrn2[0]} → {form.rrn2[0] && "13579".includes(form.rrn2[0]) ? "남" : "여"})
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
            <TextField
              label="이메일"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            {!isCreate && (
              <TextField
                select
                label="성별"
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                fullWidth
                sx={fieldSx}
              >
                <MenuItem value="">선택 안함</MenuItem>
                <MenuItem value="M">남</MenuItem>
                <MenuItem value="F">여</MenuItem>
              </TextField>
            )}
            <TextField
              type="date"
              label="생년월일"
              InputLabelProps={{ shrink: true }}
              value={form.birthDate}
              onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="연락처"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              fullWidth
              placeholder="010-0000-0000"
              sx={fieldSx}
            />
            {isCreate && (
              <Button
                variant="outlined"
                onClick={handleDuplicateCheck}
                disabled={duplicateLoading}
                sx={{ width: "fit-content", color: "#2b5aa9" }}
              >
                중복 확인
              </Button>
            )}
            <Stack direction="row" spacing={1}>
              <TextField
                label="주소"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                fullWidth
                size="small"
                sx={fieldSx}
                placeholder="주소 검색"
              />
              <Button variant="outlined" onClick={handleAddressSearch} sx={{ minWidth: 100, color: "#2b5aa9" }}>
                검색
              </Button>
            </Stack>
            <TextField
              label="상세주소"
              value={form.addressDetail}
              onChange={(e) => setForm((p) => ({ ...p, addressDetail: e.target.value }))}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Stack>

          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={800}>보호자 정보</Typography>
            <TextField
              label="보호자 이름"
              value={form.guardianName}
              onChange={(e) => setForm((p) => ({ ...p, guardianName: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="보호자 연락처"
              value={form.guardianPhone}
              onChange={(e) => setForm((p) => ({ ...p, guardianPhone: e.target.value }))}
              fullWidth
              placeholder="010-0000-0000"
              sx={fieldSx}
            />
            <TextField
              label="관계"
              value={form.guardianRelation}
              onChange={(e) => setForm((p) => ({ ...p, guardianRelation: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                select
                label="내/외국인"
                value={form.isForeigner ? "Y" : "N"}
                onChange={(e) => setForm((p) => ({ ...p, isForeigner: e.target.value === "Y" }))}
                fullWidth
                sx={fieldSx}
              >
                <MenuItem value="N">내국인</MenuItem>
                <MenuItem value="Y">외국인</MenuItem>
              </TextField>
              <TextField
                select
                label="연락 우선순위"
                value={form.contactPriority}
                onChange={(e) => setForm((p) => ({ ...p, contactPriority: e.target.value }))}
                fullWidth
                sx={fieldSx}
              >
                <MenuItem value="PATIENT">본인</MenuItem>
                <MenuItem value="GUARDIAN">보호자</MenuItem>
              </TextField>
            </Stack>
            {isCreate && (
              <TextField
                select
                label="환자유형"
                value={form.patientType}
                onChange={(e) => setForm((p) => ({ ...p, patientType: e.target.value }))}
                fullWidth
                size="small"
                sx={fieldSx}
              >
                <MenuItem value="">선택</MenuItem>
                {PATIENT_TYPES.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="알레르기/주의사항"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={fieldSx}
            />
            {isCreate && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Checkbox
                    checked={form.consentAll}
                    onChange={(e) => setForm((p) => ({ ...p, consentAll: e.target.checked }))}
                    size="small"
                  />
                  <Typography variant="body2" fontWeight={800}>
                    약관 전체 동의
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.consentRequired}
                        onChange={(e) => setForm((p) => ({ ...p, consentRequired: e.target.checked }))}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">(필수) 개인정보 수집·이용 동의</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.consentOptional}
                        onChange={(e) => setForm((p) => ({ ...p, consentOptional: e.target.checked }))}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">(선택) 병의원 마케팅 정보 수신 동의</Typography>}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        </Stack>

        {error && (
          <Typography color="error" fontWeight={800} sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ px: 3, py: 2, borderTop: "1px solid #e8eef7", bgcolor: "#fafbfd" }}
      >
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          취소
        </Button>
        {onDelete && (
          <Button variant="outlined" color="warning" onClick={onDelete} disabled={loading}>
            비활성
          </Button>
        )}
        <Button variant="outlined" onClick={handleSubmit} disabled={loading || !canSubmit}>
          {isCreate ? "등록완료" : "저장"}
        </Button>
        {isCreate && onSubmitAndReception && (
          <Button
            variant="contained"
            onClick={handleSubmitAndReception}
            disabled={loading || !canSubmit}
            sx={{ bgcolor: "#2b5aa9", fontWeight: 800 }}
          >
            등록 후 접수
          </Button>
        )}
      </Stack>

      <Dialog open={duplicateOpen} onClose={() => setDuplicateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <Typography fontWeight={800} component="div" sx={{ px: 2, pt: 2 }}>중복 후보</Typography>
        <DialogContent sx={{ pt: 1 }}>
          {duplicateList.length === 0 ? (
            <Typography color="text.secondary">중복 후보가 없습니다.</Typography>
          ) : (
            <List>
              {duplicateList.map((p) => (
                <ListItem key={p.patientId} divider>
                  <ListItemText primary={`${p.name} · ${p.patientNo ?? p.patientId}`} secondary={`${p.birthDate ?? "-"} · ${p.phone ?? "-"}`} />
                  <Button component={Link} href={`/patient/${p.patientId}`} size="small">
                    상세
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <Box sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDuplicateOpen(false)}>계속 등록</Button>
        </Box>
      </Dialog>
    </Dialog>
  );
}
