"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

const menus = [
  { title: "원무 직원 목록", path: "/staff/reception/list" },
  { title: "원무 업무", path: "/reception" },
];

const ReceptionDashboard = () => {
  const router = useRouter();

  return (
    <Card sx={{ borderRadius: 3, minHeight: 320 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          원무 메뉴
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
          {menus.map((menu) => (
            <Button
              key={menu.title}
              variant="contained"
              onClick={() => router.push(menu.path)}
              sx={{ justifyContent: "flex-start", py: 1.2 }}
            >
              {menu.title}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ReceptionDashboard;
