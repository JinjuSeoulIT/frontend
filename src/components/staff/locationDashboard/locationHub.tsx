"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

export default function LocationHub() {
  const router = useRouter();

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        부서 위치 관리
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        부서 위치 등록, 목록 조회, 수정, 삭제를 관리하는 화면입니다.
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              위치 등록
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              새로운 부서 위치 정보를 등록합니다.
            </Typography>
            <Button variant="contained" onClick={() => router.push("/staff/location/create")}>
              이동
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              위치 목록
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              등록된 부서 위치 목록을 조회합니다.
            </Typography>
            <Button variant="contained" onClick={() => router.push("/staff/location/list")}>
              이동
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
