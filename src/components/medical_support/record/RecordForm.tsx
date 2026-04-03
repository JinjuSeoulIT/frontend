"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  MenuItem,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { RecordFormType } from "@/features/medical_support/record/recordTypes";

interface Props {
  mode: "create" | "edit";
  form: RecordFormType;
  onChange: (form: RecordFormType) => void;
  onSubmit: () => void;
  loading: boolean;
}

type RecordFormErrors = Partial<Record<keyof RecordFormType, string>>;

const RecordForm: React.FC<Props> = ({
  mode,
  form,
  onChange,
  onSubmit,
  loading,
}) => {
  const [errors, setErrors] = useState<RecordFormErrors>({});
  const isEditMode = mode === "edit";

  const toStr = (value: unknown) => String(value ?? "");

  const handleFieldChange =
    (field: keyof RecordFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...form, [field]: e.target.value });

      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    };

  const handleDateTimeChange =
    (field: "recordedAt") =>
    (newValue: dayjs.Dayjs | null) => {
      onChange({
        ...form,
        [field]: newValue ? newValue.format("YYYY-MM-DDTHH:mm:ss") : "",
      });

      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    };

  const isInteger = (value: string) => /^\d+$/.test(value);
  const isDecimal = (value: string) => /^\d+(\.\d+)?$/.test(value);

  const validateRange = (
    value: string,
    min: number,
    max: number,
    allowDecimal = false
  ) => {
    if (!value.trim()) return false;

    const validFormat = allowDecimal ? isDecimal(value) : isInteger(value);
    if (!validFormat) return false;

    const numericValue = Number(value);
    return numericValue >= min && numericValue <= max;
  };

  const validateForm = () => {
    const newErrors: RecordFormErrors = {};

    const recordedAt = toStr(form.recordedAt).trim();
    const systolicBp = toStr(form.systolicBp).trim();
    const diastolicBp = toStr(form.diastolicBp).trim();
    const pulse = toStr(form.pulse).trim();
    const respiration = toStr(form.respiration).trim();
    const temperature = toStr(form.temperature).trim();
    const spo2 = toStr(form.spo2).trim();
    const painScore = toStr(form.painScore).trim();
    const heightCm = toStr(form.heightCm).trim();
    const weightKg = toStr(form.weightKg).trim();

    // 기록일시만 필수
    if (!recordedAt) {
      newErrors.recordedAt = "기록일시는 필수 입력입니다.";
    }

    if (heightCm) {
      if (!isInteger(heightCm)) {
        newErrors.heightCm = "키는 숫자만 입력해야 합니다.";
      } else if (!validateRange(heightCm, 30, 250)) {
        newErrors.heightCm = "키는 30~250 사이로 입력해주세요.";
      }
    }

    if (weightKg) {
      if (!isDecimal(weightKg)) {
        newErrors.weightKg = "몸무게는 숫자만 입력해야 합니다.";
      } else if (!validateRange(weightKg, 1, 300, true)) {
        newErrors.weightKg = "몸무게는 1~300 사이로 입력해주세요.";
      }
    }

    if (systolicBp) {
      if (!isInteger(systolicBp)) {
        newErrors.systolicBp = "수축기 혈압은 숫자만 입력해야 합니다.";
      } else if (!validateRange(systolicBp, 60, 250)) {
        newErrors.systolicBp = "수축기 혈압은 60~250 사이로 입력해주세요.";
      }
    }

    if (diastolicBp) {
      if (!isInteger(diastolicBp)) {
        newErrors.diastolicBp = "이완기 혈압은 숫자만 입력해야 합니다.";
      } else if (!validateRange(diastolicBp, 40, 150)) {
        newErrors.diastolicBp = "이완기 혈압은 40~150 사이로 입력해주세요.";
      }
    }

    if (pulse) {
      if (!isInteger(pulse)) {
        newErrors.pulse = "맥박은 숫자만 입력해야 합니다.";
      } else if (!validateRange(pulse, 30, 220)) {
        newErrors.pulse = "맥박은 30~220 사이로 입력해주세요.";
      }
    }

    if (respiration) {
      if (!isInteger(respiration)) {
        newErrors.respiration = "호흡수는 숫자만 입력해야 합니다.";
      } else if (!validateRange(respiration, 5, 60)) {
        newErrors.respiration = "호흡수는 5~60 사이로 입력해주세요.";
      }
    }

    if (temperature) {
      if (!isDecimal(temperature)) {
        newErrors.temperature = "체온은 숫자만 입력해야 합니다.";
      } else if (!validateRange(temperature, 30, 45, true)) {
        newErrors.temperature = "체온은 30~45 사이로 입력해주세요.";
      }
    }

    if (spo2) {
      if (!isInteger(spo2)) {
        newErrors.spo2 = "산소포화도는 숫자만 입력해야 합니다.";
      } else if (!validateRange(spo2, 0, 100)) {
        newErrors.spo2 = "산소포화도는 0~100 사이로 입력해주세요.";
      }
    }

    if (painScore) {
      const pain = Number(painScore);
      if (!Number.isInteger(pain) || pain < 1 || pain > 10) {
        newErrors.painScore = "통증 점수는 1~10만 선택할 수 있습니다.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const isValid = validateForm();
    if (!isValid) return;
    onSubmit();
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 3,
        maxWidth: 1000,
        mx: "auto",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            backgroundColor: "#fafafa",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {isEditMode ? "간호 기록 수정" : "간호 기록 등록"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {isEditMode
              ? "간호 기록 정보를 수정하고 저장할 수 있습니다."
              : "간호 기록 정보를 입력하고 저장할 수 있습니다."}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                기본 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                기록 기본 정보와 참조 정보를 확인할 수 있습니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="환자명"
                    value={toStr(form.patientName)}
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="간호사명"
                    value={toStr(form.nurseName)}
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="진료과"
                    value={toStr(form.departmentName)}
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="간호사 ID"
                    value={toStr(form.nursingId)}
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="진료 ID"
                    value={toStr(form.visitId)}
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid> */}

                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="ko"
                  >
                    <DateTimePicker
                      label="기록일시"
                      value={
                        toStr(form.recordedAt)
                          ? dayjs(toStr(form.recordedAt))
                          : null
                      }
                      onChange={handleDateTimeChange("recordedAt")}
                      timeSteps={{ minutes: 1 }}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: !!errors.recordedAt,
                          helperText: errors.recordedAt,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="상태"
                    value={toStr(form.status || "ACTIVE")}
                    onChange={handleFieldChange("status")}
                    size="small"
                    fullWidth
                    disabled={!isEditMode}
                    helperText={
                      isEditMode
                        ? "수정 모드에서만 상태를 변경할 수 있습니다."
                        : "등록 시 기본값은 ACTIVE입니다."
                    }
                  >
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                신체 정보 및 활력징후
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                키, 몸무게와 활력징후를 입력하거나 확인할 수 있습니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="키"
                    placeholder="30~250 사이로 입력"
                    value={toStr(form.heightCm)}
                    onChange={handleFieldChange("heightCm")}
                    size="small"
                    fullWidth
                    error={!!errors.heightCm}
                    helperText={errors.heightCm}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">cm</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="몸무게"
                    placeholder="1~300 사이로 입력"
                    value={toStr(form.weightKg)}
                    onChange={handleFieldChange("weightKg")}
                    size="small"
                    fullWidth
                    error={!!errors.weightKg}
                    helperText={errors.weightKg}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">kg</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="수축기 혈압"
                    placeholder="60~250 사이로 입력"
                    value={toStr(form.systolicBp)}
                    onChange={handleFieldChange("systolicBp")}
                    size="small"
                    fullWidth
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={!!errors.systolicBp}
                    helperText={errors.systolicBp}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">mmHg</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="이완기 혈압"
                    placeholder="40~150 사이로 입력"
                    value={toStr(form.diastolicBp)}
                    onChange={handleFieldChange("diastolicBp")}
                    size="small"
                    fullWidth
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={!!errors.diastolicBp}
                    helperText={errors.diastolicBp}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">mmHg</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="맥박"
                    placeholder="30~220 사이로 입력"
                    value={toStr(form.pulse)}
                    onChange={handleFieldChange("pulse")}
                    size="small"
                    fullWidth
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={!!errors.pulse}
                    helperText={errors.pulse}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">bpm</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="호흡수"
                    placeholder="5~60 사이로 입력"
                    value={toStr(form.respiration)}
                    onChange={handleFieldChange("respiration")}
                    size="small"
                    fullWidth
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={!!errors.respiration}
                    helperText={errors.respiration}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">rpm</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="체온"
                    placeholder="30~45 사이로 입력"
                    value={toStr(form.temperature)}
                    onChange={handleFieldChange("temperature")}
                    size="small"
                    fullWidth
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.]*" }}
                    error={!!errors.temperature}
                    helperText={errors.temperature}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">℃</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="산소포화도"
                    placeholder="0~100 사이로 입력"
                    value={toStr(form.spo2)}
                    onChange={handleFieldChange("spo2")}
                    size="small"
                    fullWidth
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={!!errors.spo2}
                    helperText={errors.spo2}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="통증 점수"
                    value={toStr(form.painScore)}
                    onChange={handleFieldChange("painScore")}
                    size="small"
                    fullWidth
                    error={!!errors.painScore}
                    helperText={errors.painScore}
                  >
                    <MenuItem value="">선택</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <MenuItem key={score} value={String(score)}>
                        {score}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="의식 수준"
                    value={toStr(form.consciousnessLevel)}
                    onChange={handleFieldChange("consciousnessLevel")}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="">선택</MenuItem>
                    <MenuItem value="ALERT">ALERT</MenuItem>
                    <MenuItem value="VERBAL">VERBAL</MenuItem>
                    <MenuItem value="PAIN">PAIN</MenuItem>
                    <MenuItem value="UNRESPONSIVE">UNRESPONSIVE</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                간호 평가 및 상태 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                초기 문진과 간호 관찰 내용을 입력하세요.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="초기 문진 요약"
                    value={toStr(form.initialAssessment)}
                    onChange={handleFieldChange("initialAssessment")}
                    size="small"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="간호 관찰 내용"
                    value={toStr(form.observation)}
                    onChange={handleFieldChange("observation")}
                    size="small"
                    fullWidth
                    multiline
                    minRows={4}
                  />
                </Grid>
              </Grid>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ pt: 1 }}
            >
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? "저장 중..." : isEditMode ? "수정 완료" : "등록"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default RecordForm;