"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
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

import { fetchBillsRequest } from "@/features/billing/billingSlice";
import {
  getBillingStatusLabel,
  getBillingStatusColor,
} from "@/lib/billing/billingStatus";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";

export default function BillingListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const status = searchParams.get("status");
  const confirmedOnly = searchParams.get("confirmedOnly") === "true";
  const partialOnly = searchParams.get("partialOnly") === "true";
  const billingDate = searchParams.get("billingDate");

  const billingList = useSelector(
    (state: RootState) => state.billing.billingList
  );
  const loading = useSelector((state: RootState) => state.billing.loading);
  const error = useSelector((state: RootState) => state.billing.error);

  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );

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

    if (status) {
      params.set("status", status);
    }

    if (confirmedOnly) {
      params.set("confirmedOnly", "true");
    }

    if (partialOnly) {
      params.set("partialOnly", "true");
    }

    if (billingDate) {
      params.set("billingDate", billingDate);
    }

    const queryString = params.toString();
    return queryString ? `/billing/list?${queryString}` : "/billing/list";
  };

  const STATUS_OPTIONS = [
    {
      key: "READY",
      label: "미수납",
      href: buildListHref({
        status: "READY",
        billingDate,
      }),
    },
    {
      key: "PARTIAL",
      label: "부분 수납",
      href: buildListHref({
        status: "CONFIRMED",
        partialOnly: true,
        billingDate,
      }),
    },
    {
      key: "PAID",
      label: "완납",
      href: buildListHref({
        status: "PAID",
        billingDate,
      }),
    },
    {
      key: "FINAL_CONFIRMED",
      label: "청구 확정",
      href: buildListHref({
        status: "CONFIRMED",
        confirmedOnly: true,
        billingDate,
      }),
    },
    {
      key: "CANCELED",
      label: "취소됨",
      href: buildListHref({
        status: "CANCELED",
        billingDate,
      }),
    },
  ] as const;

  useEffect(() => {
    if (status || billingDate) {
      dispatch(
        fetchBillsRequest({
          status,
          confirmedOnly,
          partialOnly,
          billingDate,
        })
      );
    }
  }, [dispatch, status, confirmedOnly, partialOnly, billingDate]);

  useEffect(() => {
    let active = true;

    const loadPatients = async () => {
      try {
        const patients: Patient[] = await fetchPatientsApi();

        if (!active) return;

        const byId = patients.reduce<Record<number, string>>((acc, patient) => {
          if (patient.patientId && patient.name?.trim()) {
            acc[patient.patientId] = patient.name.trim();
          }
          return acc;
        }, {});

        setPatientNameById(byId);
      } catch (err) {
        console.error("[billing/list] failed to load patients", err);

        if (!active) return;
        setPatientNameById({});
      }
    };

    loadPatients();

    return () => {
      active = false;
    };
  }, []);

  const resolvePatientName = useCallback(
    (patientId: number) => {
      return patientNameById[patientId] || "-";
    },
    [patientNameById]
  );

  const sortedBillingList = [...(billingList ?? [])].sort((a, b) => {
    return (
      new Date(b.treatmentDate).getTime() -
      new Date(a.treatmentDate).getTime()
    );
  });

  const filteredBillingList = sortedBillingList.filter((bill) => {
    if (confirmedOnly) {
      return bill.status === "CONFIRMED" && bill.remainingAmount === 0;
    }

    if (partialOnly) {
      return bill.status === "CONFIRMED" && bill.remainingAmount > 0;
    }

    if (!status) {
      return true;
    }

    return bill.status === status;
  });

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
        {/* [추가] 일일 중간 청구 빠른 조회 */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            빠른 조회:
          </Typography>

          <Chip
            label="오늘 일일 중간 청구"
            component={Link}
            href={buildListHref({
              billingDate: todayString,
            })}
            clickable
            color={billingDate === todayString ? "primary" : "default"}
            variant={billingDate === todayString ? "filled" : "outlined"}
          />

          {billingDate && (
            <Chip
              label="일일 필터 해제"
              component={Link}
              href={buildListHref({
                status,
                confirmedOnly,
                partialOnly,
              })}
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
              (option.key === "PARTIAL" &&
                status === "CONFIRMED" &&
                partialOnly) ||
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

            {billingDate && (
              <Chip
                label={`일일 조회 ${billingDate}`}
                color="secondary"
              />
            )}

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

        {loading && <Typography>로딩 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

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
                      label={getBillingStatusLabel(
                        bill.status,
                        bill.remainingAmount
                      )}
                      color={
                        getBillingStatusColor(
                          bill.status,
                          bill.remainingAmount
                        ) as any
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}

              {filteredBillingList.length === 0 && !loading && (
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