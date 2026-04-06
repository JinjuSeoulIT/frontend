"use client";

import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function AdminPage() {
  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h5" fontWeight={900}>
                관리자 대시보드
              </Typography>
              <Typography color="text.secondary">
                운영 관리 화면입니다. 코드그룹/상세코드 관리는 아래 버튼으로 이동하세요.
              </Typography>
              <Box>
                <Button variant="contained" component={Link} href="/admin/codes">
                  코드 관리
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}