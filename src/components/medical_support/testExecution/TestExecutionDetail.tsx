"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { TestExecution } from "@/features/medical_support/testExecution/testExecutionType";
import { fetchTestExecutionApi } from "@/lib/medical_support/testExecutionApi";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";

  const text = String(value).trim();
  return text ? text : "-";
};

const normalizeStatus = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

const getStatusColor = (
  status?: string | null
): "default" | "info" | "warning" | "success" => {
  const normalized = normalizeStatus(status);

  if (normalized === "COMPLETED") return "success";
  if (normalized === "IN_PROGRESS") return "info";
  if (normalized === "WAITING") return "warning";

  return "default";
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography fontWeight={500}>{value ?? "-"}</Typography>
    </Box>
  );
}

export default function TestExecutionDetail() {
  const params = useParams();
  const rawId = params?.testExecutionId;
  const testExecutionId =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;

  const [item, setItem] = useState<TestExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testExecutionId) return;

    const loadDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchTestExecutionApi(testExecutionId);
        setItem(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "검사수행 상세 데이터를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [testExecutionId]);

  if (!testExecutionId) {
    return (
      <Typography p={4} color="error">
        testExecutionId가 없습니다.
      </Typography>
    );
  }

  if (loading) {
    return (
      <Box p={4} sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography p={4} color="error">
        {error}
      </Typography>
    );
  }

  if (!item) {
    return <Typography p={4}>데이터를 찾을 수 없습니다.</Typography>;
  }

  return (
    <Box sx={{ px: 2, py: 3, maxWidth: 1000, mx: "auto" }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box sx={{ px: 3, py: 2.5, backgroundColor: "#fafafa" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                검사수행 상세
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                검사수행의 상세 정보를 확인할 수 있습니다.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Link href={`/medical_support/testExecution/edit/${item.testExecutionId}`}>
                <Button variant="contained" size="small">
                  수정
                </Button>
              </Link>
              <Link href="/medical_support/testExecution/list">
                <Button variant="outlined" size="small">
                  목록으로
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                기본 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                검사수행의 기본 식별 정보와 진행 상태를 확인합니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="검사수행 ID" value={safeValue(item.testExecutionId)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="오더항목 ID" value={safeValue(item.orderItemId)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="검사유형" value={safeValue(item.executionType)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 500 }}
                    >
                      진행상태
                    </Typography>
                    <Chip
                      label={safeValue(item.progressStatus)}
                      color={getStatusColor(item.progressStatus)}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                수행 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                검사 시작, 완료, 재시도, 수행자 정보를 확인합니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="재시도횟수" value={safeValue(item.retryNo)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="수행자 ID" value={safeValue(item.performerId)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="시작일시" value={formatDateTime(item.startedAt)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="완료일시" value={formatDateTime(item.completedAt)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="수정일시" value={formatDateTime(item.updatedAt)} />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
