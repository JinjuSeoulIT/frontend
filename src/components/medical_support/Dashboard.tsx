"use client";

import { useRouter } from "next/navigation";
import { Box, Card, CardContent, Typography } from "@mui/material";

const Dashboard = () => {
  const menu = [
    {
      key: "record",
      label: "간호 기록",
      desc: "간호 기록 관리",
      path: "/medical_support/record/list",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
    {
      key: "testexecution",
      label: "검사 수행",
      desc: "검사 수행 관리",
      path: "/medical_support/testExecution/list",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
    {
      key: "exam",
      label: "검사",
      desc: "검사 항목 관리",
      path: "/medical_support/exam",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
    {
      key: "medicationrecord",
      label: "투약 기록",
      desc: "투약 기록 관리",
      path: "/medical_support/medicationRecord/list",
      tone:
        "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
    },
    {
      key: "treatmentresult",
      label: "처치 결과",
      desc: "처치 결과 관리",
      path: "/medical_support/treatmentResult/list",
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
          onClick={() => {
            router.push(m.path);
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
              {m.label}
            </Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5, minHeight: 44 }}>
              {m.desc}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Dashboard;