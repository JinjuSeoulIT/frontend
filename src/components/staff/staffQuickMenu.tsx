"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

const menus = [
  { title: "환자 목록",     path:     "/patients" },
  { title: "진료 대시보드", path:     "/doctor" },
  { title: "간호 기록",     path:     "/staff/nurse/record/list" },
  { title: "예약 조회",     path:     "/reservations" },                      // 예약쪽
];

const MedicalQuickMenu = () => {
  const router = useRouter();

  return (
    <Card sx={{ borderRadius: 3, minHeight: 320 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
        업무 메뉴 
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

export default MedicalQuickMenu;
