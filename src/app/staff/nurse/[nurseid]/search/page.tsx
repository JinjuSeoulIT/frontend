import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";

export default async function SearchPage({
  params,
}: {
  params: Promise<{ nurseid: string }>;
}) {
  const { nurseid } = await params;
  const staffId = Number(nurseid);

  if (!Number.isFinite(staffId)) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <Box sx={{ maxWidth: 640, mx: "auto", px: 2, py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3, border: "1px solid #dbe5f5" }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={800}>
              간호사 검색 화면 준비 중
            </Typography>
            <Typography color="text.secondary">
              현재 이 경로의 검색 UI는 비활성 상태입니다. 간호사 목록이나 상세 화면을 이용해 주세요.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button component={Link} href={`/staff/nurse/${staffId}/detail`} variant="contained">
                상세로 이동
              </Button>
              <Button component={Link} href="/staff/nurse/list" variant="outlined">
                목록으로 이동
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </MainLayout>
  );
}
