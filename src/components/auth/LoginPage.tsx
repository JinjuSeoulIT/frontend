"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PasswordResetDialog from "@/components/auth/PasswordResetDialog";
import { getMeApi, syncAuthSessionCookieApi } from "@/lib/auth/authApi";
import { dispatchLogin } from "@/lib/auth/loginDispatch";
import {
  clearSession,
  saveAccessToken,
  saveSessionUserOnly,
  setDevBypassCookie,
} from "@/lib/auth/session";
import { DEV_BYPASS_ENABLED } from "@/lib/common/env";

const SAVED_USERNAME_KEY = "login.savedUsername";
const REMEMBER_LOGIN_KEY = "login.rememberLogin";

const getSafeNextPath = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return "/";
  }
  return value;
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);

  useEffect(() => {
    const savedUsername = window.localStorage.getItem(SAVED_USERNAME_KEY);
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberUsername(true);
    }

    const savedRememberLogin = window.localStorage.getItem(REMEMBER_LOGIN_KEY);
    setRememberLogin(savedRememberLogin === "1");
  }, []);

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth") !== "ok") {
      return;
    }

    const run = async () => {
      try {
        const token = params.get("token") || "";
        if (!token) {
          throw new Error("missing_oauth_token");
        }

        saveAccessToken(token, true);
        window.history.replaceState({}, "", "/login");
        const me = await getMeApi();
        if (!mounted) {
          return;
        }

        saveSessionUserOnly(me, { passwordChangeRequired: false });
        await syncAuthSessionCookieApi({
          accessToken: token,
          passwordChangeRequired: false,
        });
        window.location.replace(getSafeNextPath(params.get("next")));
      } catch {
        if (!mounted) {
          return;
        }
        setError("소셜 로그인 세션을 확인하지 못했습니다. 다시 시도해주세요.");
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  const validateLoginFields = () => {
    if (!username.trim()) {
      return "아이디를 입력해 주세요.";
    }

    if (!password) {
      return "비밀번호를 입력해 주세요.";
    }

    return null;
  };

  const handleLogin = async () => {
    const validationMessage = validateLoginFields();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dispatchLogin({
        username,
        password,
        rememberUsername,
        rememberLogin,
        savedUsernameKey: SAVED_USERNAME_KEY,
        rememberLoginKey: REMEMBER_LOGIN_KEY,
      });

      if (result.type === "error") {
        setError(result.message);
        return;
      }

      await syncAuthSessionCookieApi({
        accessToken: result.accessToken,
        passwordChangeRequired: result.passwordChangeRequired,
        maxAgeSeconds: rememberLogin ? result.expiresIn : undefined,
      });
      window.location.replace(result.redirectTo);
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypassLogin = () => {
    clearSession();
    setDevBypassCookie(true);
    saveSessionUserOnly(
      {
        userId: "0",
        username: "dev.admin",
        fullName: "개발용 관리자",
        role: "ADMIN",
        departmentId: null,
        departmentName: null,
      },
      { passwordChangeRequired: false }
    );
    window.location.replace("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background:
          "radial-gradient(circle at 84% -4%, rgba(59,130,246,0.18), transparent 38%), radial-gradient(circle at 6% 104%, rgba(16,185,129,0.14), transparent 32%), linear-gradient(180deg, #eef4ff 0%, #f8fbff 48%, #ecf3ff 100%)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 3,
          boxShadow: "0 24px 56px rgba(30,64,175,0.16)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.25}>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>
                HMS Workspace
              </Typography>
              <Typography sx={{ mt: 0.5, color: "#475569", fontSize: 14 }}>
                로그인 후 역할에 맞는 화면으로 이동합니다.
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="아이디"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") {
                  return;
                }

                event.preventDefault();
                if (!loading) {
                  void handleLogin();
                }
              }}
              fullWidth
            />

            <TextField
              label="비밀번호"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") {
                  return;
                }

                event.preventDefault();
                if (!loading) {
                  void handleLogin();
                }
              }}
              fullWidth
            />

            <Stack direction="row" spacing={1.5}>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    checked={rememberUsername}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setRememberUsername(checked);
                      if (!checked) {
                        window.localStorage.removeItem(SAVED_USERNAME_KEY);
                      }
                    }}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: 13 }}>아이디 저장</Typography>}
              />
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    checked={rememberLogin}
                    onChange={(event) => setRememberLogin(event.target.checked)}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: 13 }}>로그인 유지</Typography>}
              />
            </Stack>

            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{ py: 1.1, fontWeight: 700 }}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>

            {DEV_BYPASS_ENABLED ? (
              <Button
                variant="outlined"
                onClick={handleDevBypassLogin}
                sx={{ py: 1, fontWeight: 700 }}
              >
                개발용 인증 없이 화면 보기
              </Button>
            ) : null}

            <Button
              variant="text"
              onClick={() => setPasswordResetOpen(true)}
              sx={{ alignSelf: "center", fontWeight: 700 }}
            >
              비밀번호 초기화
            </Button>

            <Typography sx={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
              아이디 발급, 비밀번호 초기화, 가입 승인 관련 문의는 관리자에게 전달됩니다.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <PasswordResetDialog
        open={passwordResetOpen}
        onClose={() => setPasswordResetOpen(false)}
        onCompleted={(preparedIdentifier) => setUsername(preparedIdentifier)}
      />
    </Box>
  );
}
