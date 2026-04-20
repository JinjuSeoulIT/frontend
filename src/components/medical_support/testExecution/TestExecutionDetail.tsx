"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  fetchTestExecutionApi,
  updateTestExecutionApi,
} from "@/lib/medical_support/testExecutionApi";

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

const normalizeActiveStatus = (value?: string | null) =>
  value?.trim().toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";

const formatProgressStatusLabel = (status?: string | null) => {
  const normalized = normalizeStatus(status);

  if (normalized === "WAITING") return "대기중";
  if (normalized === "IN_PROGRESS") return "검사중";
  if (normalized === "COMPLETED") return "검사완료";
  if (normalized === "CANCELLED") return "취소";

  return safeValue(status);
};

const getStatusColor = (
  status?: string | null
): "default" | "info" | "warning" | "success" => {
  const normalized = normalizeStatus(status);

  if (normalized === "COMPLETED") return "success";
  if (normalized === "IN_PROGRESS") return "info";
  if (normalized === "WAITING") return "warning";

  return "default";
};

const formatActiveStatusLabel = (status?: string | null) =>
  normalizeActiveStatus(status) === "INACTIVE" ? "비활성" : "활성";

const getActiveStatusColor = (
  status?: string | null
): "default" | "success" => {
  return normalizeActiveStatus(status) === "INACTIVE" ? "default" : "success";
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!testExecutionId) return;

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
  }, [testExecutionId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleToggleActiveStatus = async () => {
    if (!testExecutionId || !item || isUpdating) return;

    const currentStatus = normalizeActiveStatus(item.status);
    const nextStatus = currentStatus === "INACTIVE" ? "ACTIVE" : "INACTIVE";
    const actionLabel = nextStatus === "INACTIVE" ? "비활성화" : "활성화";

    if (
      !window.confirm(
        `활성 여부만 즉시 반영됩니다. 검사 수행을 ${actionLabel}하시겠습니까?`
      )
    ) {
      return;
    }

    setIsUpdating(true);

    try {
      await updateTestExecutionApi(testExecutionId, {
        progressStatus: item.progressStatus ?? null,
        status: nextStatus,
        retryNo: item.retryNo ?? null,
        patientId: item.patientId ?? null,
        patientName: item.patientName ?? null,
        departmentName: item.departmentName ?? null,
        performerId: item.performerId ?? null,
        performerName: item.performerName ?? null,
      });

      alert(`검사 수행이 ${actionLabel}되었습니다.`);
      await loadDetail();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : `검사 수행 ${actionLabel}에 실패했습니다.`
      );
    } finally {
      setIsUpdating(false);
    }
  };

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

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                color={
                  normalizeActiveStatus(item.status) === "INACTIVE"
                    ? "success"
                    : "warning"
                }
                onClick={handleToggleActiveStatus}
                disabled={loading || isUpdating}
              >
                {normalizeActiveStatus(item.status) === "INACTIVE"
                  ? "활성화"
                  : "비활성화"}
              </Button>
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
                      label={formatProgressStatusLabel(item.progressStatus)}
                      color={getStatusColor(item.progressStatus)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 500 }}
                    >
                      활성 여부
                    </Typography>
                    <Chip
                      label={formatActiveStatusLabel(item.status)}
                      color={getActiveStatusColor(item.status)}
                      size="small"
                      variant={
                        normalizeActiveStatus(item.status) === "INACTIVE"
                          ? "outlined"
                          : "filled"
                      }
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
                검사 시작·완료·재시도와 검사실 접수 담당자 정보를 확인합니다. 접수 담당은
                진료 의사와 자동 연결되지 않을 수 있습니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="재시도횟수" value={safeValue(item.retryNo)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="검사접수담당자 ID"
                    value={safeValue(item.performerId)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="검사접수담당자"
                    value={safeValue(item.performerName)}
                  />
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
