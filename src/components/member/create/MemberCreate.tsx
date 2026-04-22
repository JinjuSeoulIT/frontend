"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/ko";
import {
  fetchStaffDepartmentSummaryApi,
  type StaffDepartmentSummaryItem,
} from "@/lib/staff/staffSummaryApi";
import { createStaffApi, type StaffCreateResult } from "@/lib/staff/staffCreateApi";

dayjs.extend(customParseFormat);

type FormState = {
  fullName: string;
  roleCode: string;
  departmentId: string;
  phone: string;
  email: string;
  birthDate: string;
  jobTitle: string;
  positionTitle: string;
  dutyCode: string;
};

const INITIAL_FORM: FormState = {
  fullName: "",
  roleCode: "STAFF",
  departmentId: "",
  phone: "",
  email: "",
  birthDate: "",
  jobTitle: "",
  positionTitle: "",
  dutyCode: "",
};

const DUTY_OPTIONS = [
  { value: "", label: "선택 안함" },
  { value: "ADMIN", label: "관리자" },
  { value: "DOCTOR", label: "의사" },
  { value: "NURSE", label: "간호사" },
  { value: "RECEPTION", label: "원무" },
  { value: "STAFF", label: "일반 직원" },
  { value: "RADIOLOGY_TECH", label: "방사선사" },
  { value: "CLINICAL_LAB_TECH", label: "임상병리사" },
  { value: "PATHOLOGY_COORDINATOR", label: "병리 담당자" },
  { value: "ENDOSCOPY_COORDINATOR", label: "내시경 담당자" },
  { value: "PHYSIOLOGY_TEST_COORDINATOR", label: "생리기능검사 담당자" },
];

const POSITION_TITLE_OPTIONS = [
  { value: "", label: "선택 안함" },
  { value: "총괄관리자", label: "총괄관리자" },
  { value: "부서장", label: "부서장" },
  { value: "책임간호사", label: "책임간호사" },
  { value: "전담간호사", label: "전담간호사" },
  { value: "담당자", label: "담당자" },
  { value: "직원", label: "직원" },
];

const JOB_TITLE_OPTIONS = [
  { value: "", label: "선택 안함" },
  { value: "관리자", label: "관리자" },
  { value: "의사", label: "의사" },
  { value: "간호사", label: "간호사" },
  { value: "원무", label: "원무" },
  { value: "방사선사", label: "방사선사" },
  { value: "임상병리사", label: "임상병리사" },
  { value: "병리 담당자", label: "병리 담당자" },
  { value: "내시경 담당자", label: "내시경 담당자" },
  { value: "생리기능검사 담당자", label: "생리기능검사 담당자" },
  { value: "검사결과관리자", label: "검사결과관리자" },
  { value: "직원", label: "직원" },
];

const resolveRoleCodeFromDutyCode = (dutyCode: string): string => {
  if (!dutyCode) return "STAFF";
  return dutyCode;
};

const parseBirthDate = (value: string): Dayjs | null => {
  if (!value) {
    return null;
  }
  const parsed = dayjs(value, "YYYYMMDD", true);
  return parsed.isValid() ? parsed : null;
};

export default function MemberCreate() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [departments, setDepartments] = useState<StaffDepartmentSummaryItem[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<StaffCreateResult | null>(null);
  const [phoneInputHint, setPhoneInputHint] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const rows = await fetchStaffDepartmentSummaryApi();
        if (!mounted) {
          return;
        }
        setDepartments(rows);
        if (!form.departmentId && rows.length > 0 && rows[0].departmentId) {
          setForm((prev) => ({ ...prev, departmentId: String(rows[0].departmentId) }));
        }
      } catch {
        if (mounted) {
          setError("부서 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (mounted) {
          setLoadingDepartments(false);
        }
      }
    };

    void loadDepartments();
    return () => {
      mounted = false;
    };
  }, []);

  const departmentOptions = useMemo(
    () =>
      departments
        .filter((item) => item.departmentId)
        .map((item) => ({
          value: String(item.departmentId),
          label: item.departmentName ?? String(item.departmentId),
        })),
    [departments]
  );

  const onChangeField =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const onChangePhone = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const raw = event.target.value;
    const digitsOnly = raw.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, phone: digitsOnly }));
    setPhoneInputHint(raw === digitsOnly ? null : "연락처는 숫자만 입력해 주세요. '-' 없이 입력합니다.");
  };

  const handleSubmit = async () => {
    setError(null);
    setCreated(null);

    if (!form.fullName.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!form.birthDate.trim()) {
      setError("생년월일을 선택해 주세요.");
      return;
    }
    if (!form.departmentId.trim()) {
      setError("부서를 선택해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createStaffApi({
        fullName: form.fullName.trim(),
        roleCode: form.roleCode,
        departmentId: form.departmentId,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        birthDate: form.birthDate.trim(),
        jobTitle: form.jobTitle.trim() || undefined,
        positionTitle: form.positionTitle.trim() || undefined,
        dutyCode: form.dutyCode.trim() || undefined,
        accountStatus: "ACTIVE",
        employmentStatus: "ACTIVE",
      });
      setCreated(result);
      setForm((prev) => ({
        ...INITIAL_FORM,
        departmentId: prev.departmentId,
      }));
    } catch (createError) {
      if (createError instanceof Error) {
        setError(createError.message);
      } else {
        setError("직원 등록에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={800}>
          직원 등록
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2.5 }}>
        <CardContent>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {created ? (
              <Alert severity="success">
                등록 완료: 로그인 아이디 <strong>{created.loginId}</strong> / 직원 ID <strong>{created.staffId}</strong> / 초기 비밀번호는 생년월일(yyyyMMdd)입니다.
              </Alert>
            ) : null}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="이름"
                  fullWidth
                  value={form.fullName}
                  onChange={onChangeField("fullName")}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                  <DatePicker
                    label="생년월일"
                    format="YYYY-MM-DD"
                    value={parseBirthDate(form.birthDate)}
                    onChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        birthDate: value && value.isValid() ? value.format("YYYYMMDD") : "",
                      }));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "초기 비밀번호로 사용됩니다.",
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth disabled={loadingDepartments}>
                  <InputLabel id="departmentId-label">부서</InputLabel>
                  <Select
                    labelId="departmentId-label"
                    label="부서"
                    value={form.departmentId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, departmentId: String(event.target.value) }))
                    }
                  >
                    {departmentOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="연락처"
                  fullWidth
                  placeholder="예: 01012345678"
                  value={form.phone}
                  onChange={onChangePhone}
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 11 }}
                  helperText={phoneInputHint ?? "숫자만 입력하세요. '-' 없이 입력합니다."}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="이메일"
                  fullWidth
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={onChangeField("email")}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="dutyCode-label">직업 구분</InputLabel>
                  <Select
                    labelId="dutyCode-label"
                    label="직업 구분"
                    value={form.dutyCode}
                    onChange={(event) =>
                      setForm((prev) => {
                        const dutyCode = String(event.target.value);
                        return {
                          ...prev,
                          dutyCode,
                          roleCode: resolveRoleCodeFromDutyCode(dutyCode),
                        };
                      })
                    }
                  >
                    {DUTY_OPTIONS.map((option) => (
                      <MenuItem key={option.value || "none"} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
              <InputLabel id="jobTitle-label">직책</InputLabel>
                  <Select
                    labelId="jobTitle-label"
                label="직책"
                    value={form.jobTitle}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, jobTitle: String(event.target.value) }))
                    }
                  >
                    {JOB_TITLE_OPTIONS.map((option) => (
                      <MenuItem key={option.value || "none"} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
              <InputLabel id="positionTitle-label">직위</InputLabel>
                  <Select
                    labelId="positionTitle-label"
                label="직위"
                    value={form.positionTitle}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, positionTitle: String(event.target.value) }))
                    }
                  >
                    {POSITION_TITLE_OPTIONS.map((option) => (
                      <MenuItem key={option.value || "none"} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                onClick={() => void handleSubmit()}
                disabled={submitting || loadingDepartments}
              >
                {submitting ? "등록 중..." : "직원 등록"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
