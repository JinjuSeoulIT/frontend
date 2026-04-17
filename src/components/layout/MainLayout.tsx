"use client";

import * as React from "react";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { getMeApi } from "@/lib/auth/authApi";
import { clearSession, getAccessToken, getSessionUser, saveSessionUserOnly } from "@/lib/auth/session";

type AuthStatus = "checking" | "ready" | "redirecting";

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  const nextPath = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?next=${encodeURIComponent(nextPath)}`);
};

const getInitialAuthStatus = (): AuthStatus => {
  if (typeof window === "undefined") return "checking";
  const token = getAccessToken();
  if (!token) return "checking";
  return getSessionUser() ? "ready" : "checking";
};

export default function MainLayout({
  children,
  showSidebar = true,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
}) {
  const SIDEBAR_OPEN_W = 240;
  const SIDEBAR_COLLAPSED_W = 72;
  const NAV_H = { xs: 64, md: 76 };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = React.useState(false);
  const [authStatus, setAuthStatus] = React.useState<AuthStatus>(getInitialAuthStatus);
  const sidebarWidth = isSidebarCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_OPEN_W;

  React.useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const token = getAccessToken();
      if (!token) {
        if (mounted) setAuthStatus("redirecting");
        clearSession();
        redirectToLogin();
        return;
      }

      const user = getSessionUser();
      if (user) {
        if (mounted) setAuthStatus("ready");
        return;
      }

      if (mounted) setAuthStatus("checking");

      try {
        const me = await getMeApi();
        if (!mounted) return;
        saveSessionUserOnly(me, { passwordChangeRequired: false });
        setAuthStatus("ready");
      } catch {
        if (mounted) setAuthStatus("redirecting");
        clearSession();
        redirectToLogin();
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: [
          "radial-gradient(circle at 12% 8%, rgba(11, 91, 143, 0.18) 0%, rgba(11, 91, 143, 0) 38%)",
          "radial-gradient(circle at 88% 12%, rgba(217, 119, 6, 0.16) 0%, rgba(217, 119, 6, 0) 32%)",
          "linear-gradient(180deg, #eef3f7 0%, #f7fafc 55%, #eef2f7 100%)",
        ].join(", "),
        backgroundAttachment: "fixed",
      }}
    >
      {showSidebar ? (
        <Box
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          sx={{
            position: { xs: "static", md: "fixed" },
            top: { xs: 0, md: `${NAV_H.md}px` },
            left: 0,
            width: { xs: "100%", md: `${sidebarWidth}px` },
            height: {
              xs: "auto",
              md: `calc(100vh - ${NAV_H.md}px)`,
            },
            overflowY: { md: "auto" },
            zIndex: 1100,
            transition: "width 0.25s ease",
          }}
        >
          <Sidebar
            width={sidebarWidth}
            collapsed={isSidebarCollapsed}
            hovered={isSidebarHovered}
            onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        </Box>
      ) : null}

      <Navbar />
      <Box sx={{ height: NAV_H }} />
      <Box
        sx={{
          ml: showSidebar ? { xs: 0, md: `${sidebarWidth}px` } : 0,
          px: { xs: 2, md: 4 },
          py: 3,
          transition: "margin-left 0.25s ease",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "100%", mx: "auto" }}>
          {authStatus === "ready" ? (
            children
          ) : (
            <Box
              sx={{
                minHeight: "calc(100vh - 180px)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress size={28} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
