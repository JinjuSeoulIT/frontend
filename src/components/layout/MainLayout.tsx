"use client";

import * as React from "react";
import {
  Box,

} from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

type ReceptionStatusChangedEvent = {
  receptionId?: number;
  patientName?: string | null;
  toStatus?: string | null;
  changedAt?: string | null;
};

const RECEPTION_API_BASE =
  process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283";
const RECEPTION_STATUS_EVENT_NAME = "reception-status-changed";
const NOTIFY_TARGET_STATUS = "IN_PROGRESS";
const MAX_PROCESSED_EVENT_KEYS = 200;

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

  const sidebarWidth = isSidebarCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_OPEN_W;

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
        <Box sx={{ width: "100%", maxWidth: "100%", mx: "auto" }}>{children}</Box>
      </Box>
      
    </Box>
  );
}
