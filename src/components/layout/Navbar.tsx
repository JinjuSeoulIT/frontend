"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Stack,
  Badge,
  Button,
} from "@mui/material";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutApi } from "@/lib/auth/authApi";
import { clearSession } from "@/lib/auth/session";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 서버 로그아웃 실패 시에도 로컬 세션은 정리
    } finally {
      clearSession();
      router.push("/login");
      router.refresh();
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
          <IconButton sx={{ color: "#dbe8ff" }}>
            <Badge color="error" variant="dot">
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>

          <Stack direction="row" spacing={1} alignItems="center">
            <PersonOutlineOutlinedIcon sx={{ color: "#dbe8ff" }} />
            <Typography sx={{ color: "#e8f1ff", fontSize: 14, fontWeight: 600 }}>
              관리자
            </Typography>
            <Typography sx={{ color: "#cbd9f5", fontSize: 12 }}>
              운영팀
            </Typography>
          </Stack>

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