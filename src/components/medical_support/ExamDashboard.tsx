"use client";

import { useRouter } from "next/navigation";
import { Box, Card, CardContent, Typography } from "@mui/material";

const ExamDashboard = () => {
  const menu = [
    {
      key: "imaging",
      label: "영상 검사",
      desc: "영상 검사 관리",
      path: "/medical_support/imaging/list",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
    {
      key: "specimen",
      label: "검체 검사",
      desc: "검체 검사 관리",
      path: "/medical_support/specimen/list",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
    {
      key: "pathology",
      label: "병리 검사",
      desc: "병리 검사 관리",
      path: "/medical_support/pathology/list",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
    {
      key: "endoscopy",
      label: "내시경 검사",
      desc: "내시경 검사 관리",
      path: "/medical_support/endoscopy/list",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
    {
      key: "physiological",
      label: "생리 기능 검사",
      desc: "생리 기능 검사 관리",
      path: "/medical_support/physiological/list",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
  ];

  const router = useRouter();

  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        alignItems: "stretch",
      }}
    >
      {menu.map((m) => (
        <Card
          key={m.key}
          sx={{
            width: "100%",
            minHeight: 140,
            borderRadius: 3,
            border: "1px solid var(--line)",
            cursor: "pointer",
            boxShadow: "var(--shadow-1)",
            background: m.tone,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "var(--shadow-2)",
            },
          }}
          onClick={() => router.push(m.path)}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>
              {m.label}
            </Typography>
            <Typography sx={{ color: "var(--muted)", lineHeight: 1.6 }}>
              {m.desc}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ExamDashboard;
