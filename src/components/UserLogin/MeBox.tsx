"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";
import { changeMyPasswordApi } from "@/lib/auth/authApi";
import {
  getSessionUser,
  setPasswordChangeRequired,
  type SessionUser,
} from "@/lib/auth/session";

const MIN_PASSWORD_LENGTH = 8;

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const INITIAL_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function MeBox() {
  const [sessionUser, setSessionUser] = React.useState<SessionUser | null>(null);
  const [form, setForm] = React.useState<PasswordForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSessionUser(getSessionUser());
  }, []);

  const handleChange =
    (field: keyof PasswordForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const validateForm = () => {
    if (!form.currentPassword) {
      return "현재 비밀번호를 입력해 주세요.";
    }

    if (!form.newPassword) {
      return "새 비밀번호를 입력해 주세요.";
    }

    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      return "새 비밀번호는 8자 이상이어야 합니다.";
    }

    if (form.currentPassword === form.newPassword) {
      return "새 비밀번호는 현재 비밀번호와 달라야 합니다.";
    }

    if (!form.confirmPassword) {
      return "새 비밀번호 확인을 입력해 주세요.";
    }

    if (form.newPassword !== form.confirmPassword) {
      return "새 비밀번호 확인이 일치하지 않습니다.";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      setSuccessMessage(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const message = await changeMyPasswordApi(form.currentPassword, form.newPassword);
      setPasswordChangeRequired(false);
      setForm(INITIAL_FORM);
      setSuccessMessage(message);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout showSidebar={true}>
      <Stack spacing={2.5}>
        <Typography variant="h4" fontWeight={800}>
          마이페이지
        </Typography>

        <Card sx={{ borderRadius: 2.5 }}>
          <CardContent>
            <Stack spacing={1.25}>
              <Typography variant="h6" fontWeight={800}>
                내 계정 정보
              </Typography>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                useFlexGap
                flexWrap="wrap"
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    이름
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {sessionUser?.fullName ?? "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    아이디
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {sessionUser?.username ?? "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    권한
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {sessionUser?.role ?? "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    부서
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {sessionUser?.departmentName ?? "-"}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 2.5,
            border: "1px solid rgba(11, 91, 143, 0.16)",
            background:
              "linear-gradient(180deg, rgba(11, 91, 143, 0.08) 0%, rgba(11, 91, 143, 0.03) 100%)",
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  비밀번호 변경
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.
                </Typography>
              </Box>

              {error ? <Alert severity="error">{error}</Alert> : null}
              {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={1.5}>
                  <TextField
                    label="현재 비밀번호"
                    type="password"
                    value={form.currentPassword}
                    onChange={handleChange("currentPassword")}
                    autoComplete="current-password"
                    fullWidth
                    disabled={submitting}
                  />
                  <TextField
                    label="새 비밀번호"
                    type="password"
                    value={form.newPassword}
                    onChange={handleChange("newPassword")}
                    autoComplete="new-password"
                    fullWidth
                    disabled={submitting}
                    helperText="8자 이상 입력해 주세요."
                  />
                  <TextField
                    label="새 비밀번호 확인"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    autoComplete="new-password"
                    fullWidth
                    disabled={submitting}
                  />

                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{ minWidth: 140, fontWeight: 700 }}
                    >
                      {submitting ? "변경 중..." : "비밀번호 변경"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
