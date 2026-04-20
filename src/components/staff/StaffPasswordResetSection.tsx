"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  getEffectiveSessionRole,
  getSessionChangedEventName,
  getSessionUser,
  type SessionUser,
} from "@/lib/auth/session";
import { normalizeRole } from "@/lib/auth/roleAccess";
import {
  resetAdminUserPasswordToBirthDateApi,
  type AdminPasswordResetResult,
} from "@/lib/admin/staffPasswordAdminApi";

type StaffPasswordResetSectionProps = {
  userIdentifier: string | null | undefined;
  staffName: string | null | undefined;
};

const toUserIdentifier = (value: string | null | undefined) => {
  if (value == null) {
    return null;
  }

  const text = value.trim();
  return text.length > 0 ? text : null;
};

const isAdminRole = (role: string | null | undefined) => normalizeRole(role) === "ADMIN";

const copyText = async (value: string) => {
  const text = value.trim();
  if (!text) {
    return false;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea copy path below.
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
};

export default function StaffPasswordResetSection({
  userIdentifier,
  staffName,
}: StaffPasswordResetSectionProps) {
  const resolvedUserIdentifier = React.useMemo(
    () => toUserIdentifier(userIdentifier),
    [userIdentifier]
  );
  const [sessionUser, setSessionUser] = React.useState<SessionUser | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [resetResult, setResetResult] = React.useState<AdminPasswordResetResult | null>(null);
  const [copyMessage, setCopyMessage] = React.useState<string | null>(null);

  const effectiveRole = React.useMemo(
    () => getEffectiveSessionRole(sessionUser),
    [sessionUser]
  );

  React.useEffect(() => {
    const syncSessionUser = () => {
      setSessionUser(getSessionUser());
    };

    syncSessionUser();

    const eventName = getSessionChangedEventName();
    window.addEventListener(eventName, syncSessionUser);
    return () => window.removeEventListener(eventName, syncSessionUser);
  }, []);

  React.useEffect(() => {
    setError(null);
    setSuccessMessage(null);
    setResetResult(null);
    setCopyMessage(null);
    setConfirmOpen(false);
  }, [resolvedUserIdentifier]);

  const isAdmin = isAdminRole(effectiveRole);

  if (!isAdmin) {
    return null;
  }

  const handleOpenConfirm = () => {
    setError(null);
    setCopyMessage(null);
    setConfirmOpen(true);
  };

  const handleReset = async () => {
    if (!resolvedUserIdentifier) {
      setError("계정 정보가 없어 비밀번호를 초기화할 수 없습니다.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setCopyMessage(null);

    try {
      const response = await resetAdminUserPasswordToBirthDateApi(resolvedUserIdentifier);
      setSuccessMessage(response.message);
      setResetResult(response.result);
      setConfirmOpen(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "비밀번호 초기화에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    const targetPassword = resetResult?.temporaryPassword ?? "";
    const copied = await copyText(targetPassword);

    setCopyMessage(
      copied
        ? "초기화된 비밀번호를 복사했습니다."
        : "비밀번호 복사에 실패했습니다."
    );
  };

  return (
    <>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid rgba(217, 119, 6, 0.2)",
          bgcolor: "rgba(217, 119, 6, 0.06)",
        }}
      >
        <Stack spacing={1.25}>
          <Typography variant="subtitle1" fontWeight={800}>
            비밀번호 초기화
          </Typography>
          <Typography variant="body2" color="text.secondary">
            관리자 권한으로 직원 비밀번호를 생년월일(yyyyMMdd)로 초기화합니다.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Button
              variant="contained"
              color="warning"
              onClick={handleOpenConfirm}
              disabled={submitting || !resolvedUserIdentifier}
              sx={{ ml: { sm: "auto" } }}
            >
              {submitting ? "초기화 중..." : "비밀번호 초기화"}
            </Button>
          </Stack>

          {!resolvedUserIdentifier ? (
            <Alert severity="warning">
              계정 정보가 없어 비밀번호를 초기화할 수 없습니다.
            </Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
        </Stack>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!submitting) {
            setConfirmOpen(false);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>비밀번호 초기화 확인</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            <Typography variant="body1">
              이 사용자의 비밀번호를 생년월일(yyyyMMdd)로 초기화하시겠습니까?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              생년월일 정보가 없는 경우 초기화에 실패할 수 있습니다.
            </Typography>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(23, 90, 160, 0.06)",
                border: "1px solid rgba(23, 90, 160, 0.16)",
              }}
            >
              <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary">
                  대상 직원
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {staffName ?? "-"}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
            취소
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => void handleReset()}
            disabled={submitting || !resolvedUserIdentifier}
          >
            {submitting ? "초기화 중..." : "초기화 실행"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={resetResult != null}
        onClose={() => {
          setResetResult(null);
          setCopyMessage(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>비밀번호 초기화 완료</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            <Alert severity="success">
              {successMessage ?? "비밀번호가 생년월일로 초기화되었습니다."}
            </Alert>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(23, 90, 160, 0.06)",
                border: "1px solid rgba(23, 90, 160, 0.16)",
              }}
            >
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    초기화된 비밀번호(생년월일)
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {resetResult?.temporaryPassword ?? "-"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            {copyMessage ? (
              <Alert severity={copyMessage.includes("실패") ? "error" : "success"}>
                {copyMessage}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => void handleCopyPassword()}
            disabled={!resetResult?.temporaryPassword}
          >
            비밀번호 복사
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setResetResult(null);
              setCopyMessage(null);
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
