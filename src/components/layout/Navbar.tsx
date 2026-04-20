"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Stack,
  Button,
} from "@mui/material";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Link from "next/link";
import * as React from "react";
import { logoutApi } from "@/lib/auth/authApi";
import {
  clearSession,
  getSessionChangedEventName,
  getSessionUser,
  type SessionUser,
} from "@/lib/auth/session";
import NotificationBell from "@/components/layout/NotificationBell";

export default function Navbar() {
  const [sessionUser, setSessionUser] = React.useState<SessionUser | null>(null);

  React.useEffect(() => {
    const syncSessionUser = () => {
      setSessionUser(getSessionUser());
    };

    syncSessionUser();

    const eventName = getSessionChangedEventName();
    window.addEventListener(eventName, syncSessionUser);
    return () => window.removeEventListener(eventName, syncSessionUser);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 서버 로그아웃 실패 시에도 로컬 세션은 정리
    } finally {
      clearSession();
      window.location.replace("/login");
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "transparent",
        background:
          "linear-gradient(90deg, rgba(11, 91, 143, 0.96) 0%, rgba(10, 62, 98, 0.96) 70%)",
        borderBottom: "1px solid rgba(255,255,255,0.16)",
        backdropFilter: "blur(8px)",
        zIndex: 1200,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 76 },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mr: 3, textDecoration: "none" }}
          component={Link}
          href="/"
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.16)",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <MedicalServicesOutlinedIcon sx={{ color: "#fff" }} />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, letterSpacing: 0.4 }}
            >
              HMS Workspace
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
              역할 기반 병원관리 시스템
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <NotificationBell />

          <Stack direction="row" spacing={1} alignItems="center">
            <PersonOutlineOutlinedIcon sx={{ color: "#dbe8ff" }} />
            <Typography sx={{ color: "#e8f1ff", fontSize: 14, fontWeight: 600 }}>
              {sessionUser?.fullName || sessionUser?.username || "내 계정"}
            </Typography>
            {sessionUser?.departmentName ? (
              <Typography sx={{ color: "#cbd9f5", fontSize: 12 }}>
                {sessionUser.departmentName}
              </Typography>
            ) : null}
          </Stack>

          <Button
            component={Link}
            href="/mypage"
            variant="outlined"
            sx={{
              color: "#e8f1ff",
              borderColor: "rgba(232, 241, 255, 0.32)",
              fontWeight: 700,
              minWidth: 88,
              "&:hover": {
                borderColor: "#e8f1ff",
                backgroundColor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            내 정보
          </Button>

          <Button
            onClick={handleLogout}
            variant="outlined"
            sx={{
              color: "#e8f1ff",
              borderColor: "rgba(232, 241, 255, 0.45)",
              fontWeight: 700,
              minWidth: 88,
              "&:hover": {
                borderColor: "#e8f1ff",
                backgroundColor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            로그아웃
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
