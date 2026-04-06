"use client";


//이동 메뉴 컴포넌트 
//빠른 메뉴
import { useRouter } from "next/navigation";
import { Card, CardContent, Typography, Divider, Stack, Button } from "@mui/material";

const menus = [
  { title: "간호 목록", path: "/staff/nurse/list" },
  { title: "간호 업무", path: "/nurse/record/list" },
];
const NurseDashboard = () => {
  
  
  const router = useRouter();

  return (
      <Card sx={{ borderRadius: 3, minHeight: 320 }}>
      <CardContent>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
      간호 메뉴
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

export default NurseDashboard;