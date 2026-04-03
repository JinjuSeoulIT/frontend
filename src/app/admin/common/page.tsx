"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, Stack, Typography } from "@mui/material";

export default function AdminCommonPage() {
  return (
    <MainLayout>
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={900}>공통 코드 관리</Typography>
            <Typography color="text.secondary">
              공통 코드/메뉴 관리 화면은 별도 정책 정리 후 확장 예정입니다.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </MainLayout>
  );
}