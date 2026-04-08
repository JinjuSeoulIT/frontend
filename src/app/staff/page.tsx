import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";

const shortcuts = [
  {
    title: "직원 목록",
    description: "직원 기본 정보와 계정을 조회합니다.",
    href: "/staff/members",
  },
  {
    title: "부서 관리",
    description: "부서 마스터 데이터를 관리합니다.",
    href: "/staff/departments",
  },
  {
    title: "위치 관리",
    description: "근무 위치 마스터 데이터를 관리합니다.",
    href: "/staff/locations",
  },
];

export default function StaffHomePage() {
  return (
    <MainLayout showSidebar={true}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            의료진 관리
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            기존 staff 하위 라우팅은 사용하지 않고, v2 라우팅으로 정리했습니다.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {shortcuts.map((item) => (
            <Card key={item.href} sx={{ flex: 1, borderRadius: 2.5 }}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Typography variant="h6" fontWeight={700}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Button href={item.href} variant="outlined" sx={{ alignSelf: "flex-start" }}>
                    이동
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </MainLayout>
  );
}
