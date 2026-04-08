"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Card, CardContent, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { getMeApi, syncAuthSessionCookieApi } from "@/lib/auth/authApi";
import { dispatchLogin } from "@/lib/auth/loginDispatch";
import { clearSession, saveAccessToken, saveSessionUserOnly, setDevBypassCookie } from "@/lib/auth/session";
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
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (!mounted) return;

        saveSessionUserOnly(me, { passwordChangeRequired: false });
        await syncAuthSessionCookieApi({
          accessToken: token,
          passwordChangeRequired: false,
        });
        router.push(getSafeNextPath(params.get("next")));
      } catch {
        if (!mounted) return;
        setError("소셜 로그인 세션을 확인하지 못했습니다. 다시 시도해 주세요.");
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

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
      setLoading(false);
      return;
    }

    await syncAuthSessionCookieApi({
      accessToken: result.accessToken,
      passwordChangeRequired: result.passwordChangeRequired,
      maxAgeSeconds: rememberLogin ? result.expiresIn : undefined,
    });
    router.push(result.redirectTo);
    setLoading(false);
  };

  const handleDevBypassLogin = () => {
    clearSession();
    setDevBypassCookie(true);
    saveSessionUserOnly(
      {
        staffId: 0,
        username: "dev.admin",
        fullName: "개발용 관리자",
        role: "ADMIN",
      },
      { passwordChangeRequired: false }
    );
    router.push("/");
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
      <Card sx={{ width: "100%", maxWidth: 460, borderRadius: 3, boxShadow: "0 24px 56px rgba(30,64,175,0.16)" }}>
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
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (!loading && username && password) {
                  void handleLogin();
                }
              }}
              fullWidth
            />

            <TextField
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (!loading && username && password) {
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
                    onChange={(e) => {
                      const checked = e.target.checked;
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
                control={<Checkbox checked={rememberLogin} onChange={(e) => setRememberLogin(e.target.checked)} size="small" />}
                label={<Typography sx={{ fontSize: 13 }}>로그인 유지</Typography>}
              />
            </Stack>

            <Button variant="contained" onClick={handleLogin} disabled={loading || !username || !password} sx={{ py: 1.1, fontWeight: 700 }}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>

            {DEV_BYPASS_ENABLED ? (
              <Button variant="outlined" onClick={handleDevBypassLogin} sx={{ py: 1, fontWeight: 700 }}>
                개발용: 인증 없이 화면 보기
              </Button>
            ) : null}

            <Typography sx={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
              아이디 발급, 비밀번호 초기화, 가입 승인 관련 문의는 관리자에게 전달합니다.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
