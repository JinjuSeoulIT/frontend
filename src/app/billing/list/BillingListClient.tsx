"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from "@mui/material";
import {
  getBillingStatusColor,
  getBillingStatusLabel,
} from "@/lib/billing/billingStatus";
import type { ServerBillSummary } from "@/lib/billing/billingServerApi";

type BillingListClientProps = {
  status: string | null;
  confirmedOnly: boolean;
  partialOnly: boolean;
  billingDate: string | null;
  initialBillingList: ServerBillSummary[];
  patientNameById: Record<number, string>;
  initialError: string | null;
};

export default function BillingListClient({
  status,
  confirmedOnly,
  partialOnly,
  billingDate,
  initialBillingList,
  patientNameById,
  initialError,
}: BillingListClientProps) {
  const router = useRouter();

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayString = getTodayString();

  const buildListHref = ({
    status,
    confirmedOnly,
    partialOnly,
    billingDate,
  }: {
    status?: string | null;
    confirmedOnly?: boolean;
    partialOnly?: boolean;
    billingDate?: string | null;
  }) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (confirmedOnly) params.set("confirmedOnly", "true");
    if (partialOnly) params.set("partialOnly", "true");
    if (billingDate) params.set("billingDate", billingDate);
    const queryString = params.toString();
    return queryString ? `/billing/list?${queryString}` : "/billing/list";
  };

  const STATUS_OPTIONS = [
    {
      key: "READY",
      label: "미수납",
      href: buildListHref({ status: "READY", billingDate }),
    },
    {
      key: "PARTIAL",
      label: "부분 수납",
      href: buildListHref({ status: "CONFIRMED", partialOnly: true, billingDate }),
    },
    {
      key: "PAID",
      label: "완납",
      href: buildListHref({ status: "PAID", billingDate }),
    },
    {
      key: "FINAL_CONFIRMED",
      label: "청구 확정",
      href: buildListHref({ status: "CONFIRMED", confirmedOnly: true, billingDate }),
    },
    {
      key: "CANCELED",
      label: "취소됨",
      href: buildListHref({ status: "CANCELED", billingDate }),
    },
  ] as const;

  const sortedBillingList = useMemo(
    () =>
      [...(initialBillingList ?? [])].sort(
        (a, b) =>
          new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
      ),
    [initialBillingList]
  );

  const filteredBillingList = useMemo(
    () =>
      sortedBillingList.filter((bill) => {
        if (confirmedOnly) return bill.status === "CONFIRMED" && bill.remainingAmount === 0;
        if (partialOnly) return bill.status === "CONFIRMED" && bill.remainingAmount > 0;
        if (!status) return true;
        return bill.status === status;
      }),
    [confirmedOnly, partialOnly, sortedBillingList, status]
  );

  const resolvePatientName = (patientId: number) => patientNameById[patientId] || "-";

  return (
    <MainLayout>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => router.push("/billing")}
        >
          뒤로 가기
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          청구 목록
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gap: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            빠른 조회:
          </Typography>
          <Chip
            label="오늘 일일 중간 청구"
            component={Link}
            href={buildListHref({ billingDate: todayString })}
            clickable
            color={billingDate === todayString ? "primary" : "default"}
            variant={billingDate === todayString ? "filled" : "outlined"}
          />
          {billingDate && (
            <Chip
              label="일일 필터 해제"
              component={Link}
              href={buildListHref({ status, confirmedOnly, partialOnly })}
              clickable
              color="default"
              variant="outlined"
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            상태 필터:
          </Typography>
          {STATUS_OPTIONS.map((option) => {
            const isActive =
              (option.key === "READY" &&
                status === "READY" &&
                !confirmedOnly &&
                !partialOnly) ||
              (option.key === "PARTIAL" && status === "CONFIRMED" && partialOnly) ||
              (option.key === "PAID" &&
                status === "PAID" &&
                !confirmedOnly &&
                !partialOnly) ||
              (option.key === "FINAL_CONFIRMED" &&
                status === "CONFIRMED" &&
                confirmedOnly) ||
              (option.key === "CANCELED" &&
                status === "CANCELED" &&
                !confirmedOnly &&
                !partialOnly);

            return (
              <Chip
                key={option.key}
                label={option.label}
                component={Link}
                href={option.href}
                clickable
                color={isActive ? "primary" : "default"}
                variant={isActive ? "filled" : "outlined"}
                sx={{ mb: 1 }}
              />
            );
          })}
          {!status && !billingDate && (
            <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
              상태를 선택하거나 오늘 일일 중간 청구를 눌러 조회할 수 있습니다.
            </Typography>
          )}
        </Stack>

        {(status || billingDate) && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1">현재 필터:</Typography>
            {billingDate && <Chip label={`일일 조회 ${billingDate}`} color="secondary" />}
            {status && (
              <Chip
                label={
                  confirmedOnly
                    ? "청구 확정"
                    : partialOnly
                    ? "부분 수납"
                    : getBillingStatusLabel(status)
                }
                color="primary"
              />
            )}
          </Stack>
        )}

        {initialError && <Typography color="error">{initialError}</Typography>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>청구번호</TableCell>
                <TableCell>환자명</TableCell>
                <TableCell>환자ID</TableCell>
                <TableCell>진료일</TableCell>
                <TableCell>총 금액</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBillingList.map((bill) => (
                <TableRow key={bill.billId}>
                  <TableCell>
                    <Link
                      href={`/billing/${bill.billId}`}
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {bill.billingNo ?? bill.billId}
                    </Link>
                  </TableCell>
                  <TableCell>{resolvePatientName(bill.patientId)}</TableCell>
                  <TableCell>{bill.patientId}</TableCell>
                  <TableCell>{bill.treatmentDate}</TableCell>
                  <TableCell>{bill.totalAmount.toLocaleString()} 원</TableCell>
                  <TableCell>
                    <Chip
                      label={getBillingStatusLabel(bill.status, bill.remainingAmount)}
                      color={
                        getBillingStatusColor(
                          bill.status,
                          bill.remainingAmount
                        ) as "default" | "error" | "warning" | "success" | "info" | "primary" | "secondary"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredBillingList.length === 0 && !initialError && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    조회 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainLayout>
  );
}
