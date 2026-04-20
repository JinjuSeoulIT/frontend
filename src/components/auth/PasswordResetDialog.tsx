"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  confirmPasswordReset,
  preparePasswordReset,
} from "@/lib/auth/authApi";

type PasswordResetDialogProps = {
  open: boolean;
  onClose: () => void;
  onCompleted?: (userIdentifier: string) => void;
};

type PasswordResetStep = "prepare" | "confirm" | "success";

const PASSWORD_RESET_ERROR_MESSAGES: Record<string, string> = {
  AUTH_ACCOUNT_NOT_FOUND: "계정을 찾을 수 없습니다.",
  AUTH_NAME_MISMATCH: "입력한 이름이 계정 정보와 일치하지 않습니다.",
  AUTH_PHONE_MISMATCH: "휴대폰 번호가 일치하지 않습니다.",
  AUTH_BIRTH_DATE_REQUIRED: "계정 정보가 불완전합니다. 관리자에게 문의하세요.",
  AUTH_PHONE_INVALID: "휴대폰 형식이 올바르지 않습니다.",
};

const toPhoneDigits = (value: string) => value.replace(/\D/g, "").slice(0, 11);

const formatPhoneInput = (value: string) => {
  const digits = toPhoneDigits(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const isValidResetPhone = (digits: string) =>
  digits.startsWith("010") && (digits.length === 10 || digits.length === 11);

const resolvePasswordResetErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const mappedMessage = PASSWORD_RESET_ERROR_MESSAGES[error.message];
    if (mappedMessage) {
      return mappedMessage;
    }
  }

  return "잠시 후 다시 시도해주세요.";
};

export default function PasswordResetDialog({
  open,
  onClose,
  onCompleted,
}: PasswordResetDialogProps) {
  const [step, setStep] = React.useState<PasswordResetStep>("prepare");
  const [userIdentifier, setUserIdentifier] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [maskedPhone, setMaskedPhone] = React.useState("");
  const [preparedIdentifier, setPreparedIdentifier] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      return;
    }

    setStep("prepare");
    setUserIdentifier("");
    setName("");
    setPhone("");
    setMaskedPhone("");
    setPreparedIdentifier("");
    setSubmitting(false);
    setError(null);
  }, [open]);

  const handlePrepareSubmit = async () => {
    const trimmedIdentifier = userIdentifier.trim();
    const trimmedName = name.trim();

    if (!trimmedIdentifier || !trimmedName) {
      setError("아이디와 이름을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await preparePasswordReset(trimmedIdentifier, trimmedName);
      setPreparedIdentifier(trimmedIdentifier);
      setMaskedPhone(result.maskedPhone);
      setPhone("");
      setStep("confirm");
    } catch (submitError) {
      setError(resolvePasswordResetErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSubmit = async () => {
    const digits = toPhoneDigits(phone);

    if (!isValidResetPhone(digits)) {
      setError("휴대폰 형식이 올바르지 않습니다.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await confirmPasswordReset(preparedIdentifier, digits);
      setStep("success");
      onCompleted?.(preparedIdentifier);
    } catch (submitError) {
      setError(resolvePasswordResetErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const prepareTitle =
    step === "prepare"
      ? "계정 확인"
      : step === "confirm"
      ? "2단계 · 본인 확인"
      : "초기화 완료";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 56px rgba(30,64,175,0.16)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
          비밀번호 초기화
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
          {prepareTitle}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {step === "prepare" ? (
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                void handlePrepareSubmit();
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="아이디"
                  value={userIdentifier}
                  onChange={(event) => setUserIdentifier(event.target.value)}
                  autoFocus
                  fullWidth
                />
                <TextField
                  label="이름"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  fullWidth
                />
              </Stack>
            </Box>
          ) : null}

          {step === "confirm" ? (
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleConfirmSubmit();
              }}
            >
              <Stack spacing={2}>
                <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                  등록된 연락처를 확인한 뒤 휴대폰 전체 번호를 입력하세요.
                </Typography>
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                    border: "1px solid #dbe5f5",
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                    등록된 연락처
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    {maskedPhone}
                  </Typography>
                </Box>
                <TextField
                  label="휴대폰 번호"
                  value={phone}
                  onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
                  autoFocus
                  fullWidth
                  placeholder="010-1234-5678"
                  helperText="숫자만 입력해도 됩니다."
                />
              </Stack>
            </Box>
          ) : null}

          {step === "success" ? (
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                비밀번호가 생년월일 8자리로 초기화되었습니다.
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                로그인 후 비밀번호를 변경하세요.
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {step !== "success" ? (
          <>
            <Button onClick={onClose} disabled={submitting}>
              닫기
            </Button>
            <Button
              variant="contained"
              onClick={step === "prepare" ? () => void handlePrepareSubmit() : () => void handleConfirmSubmit()}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {step === "prepare" ? "다음" : "본인확인 및 초기화"}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={onClose}
          >
            로그인으로 돌아가기
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
