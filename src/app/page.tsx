"use client";

import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";

const ROLES = [
  {
    key: "doctor",
    label: "임상",
    desc: "임상 기본 화면",
    href: "/clinical",
    icon: <LocalHospitalOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(40, 110, 165, 0.22), rgba(40, 110, 165, 0))",
  },
  {
    key: "medical_support",
    label: "진료 지원",
    desc: "처치/바이탈/병동 모니터링",
    href: "/medical_support/dashboard",
    icon: <MedicalServicesOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
  },
  {
    key: "reception",
    label: "접수",
    desc: "초진 등록/접수/예약",
    href: "/reception/dashboard",
    icon: <FactCheckOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(217, 119, 6, 0.22), rgba(217, 119, 6, 0))",
  },
  {
    key: "billing",
    label: "수납",
    desc: "수납/결제/보험 처리",
    href: "/billing",
    icon: <MonetizationOnOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(245, 158, 11, 0))",
  },
  {
    key: "patients",
    label: "환자",
    desc: "환자 목록/상세/기록",
    href: "/patient/list",
    icon: <PersonSearchOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0))",
  },
  {
    key: "staff",
    label: "의료진",
    desc: "직원/근무/권한 배정",
    href: "/staff",
    icon: <BadgeOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(24, 90, 158, 0.18), rgba(24, 90, 158, 0))",
  },
  {
    key: "admin",
    label: "관리자",
    desc: "운영 KPI, 권한, 감사 로그",
    href: "/admin",
    icon: <AdminPanelSettingsOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(75, 85, 99, 0.24), rgba(75, 85, 99, 0))",
  },
  {
    key: "login",
    label: "로그인",
    desc: "인증/세션 진입",
    href: "/login",
    icon: <LoginOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(2, 132, 199, 0))",
  },
];

export default function HomePage() {
  return (
    <MainLayout showSidebar={false}>
      <Stack spacing={3}>
        

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {ROLES.map((role) => (
            <Card
              key={role.key}
              sx={{
                borderRadius: 3,
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-1)",
                background: role.tone,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.85)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--brand-strong)",
                    mb: 2,
                  }}
                >
                  {role.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                  {role.label}
                </Typography>
                <Typography
                  sx={{ color: "var(--muted)", mt: 0.5, minHeight: 44 }}
                >
                  {role.desc}
                </Typography>
                <Button component={Link} href={role.href} size="small" sx={{ mt: 2 }}>
                  바로가기
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </MainLayout>
  );
}
