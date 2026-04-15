"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";

import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Button,
  Stack,
} from "@mui/material";

import { fetchOutstandingBillsRequest } from "@/features/billing/billingSlice";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  getBillingStatusLabel,
  getBillingStatusColor,
} from "@/lib/billing/billingStatus";

export default function OutstandingBillingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { billingList, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );

  // 미수금 조회
  useEffect(() => {
    dispatch(fetchOutstandingBillsRequest());
  }, [dispatch]);

  // 환자 목록 조회 후 patientId -> patientName 매핑
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
        console.error("[billing/outstanding] failed to load patients", err);

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

  // 진료일 최신순 정렬
  const sortedBillingList = [...(billingList ?? [])].sort((a, b) => {
    return (
      new Date(b.treatmentDate).getTime() -
      new Date(a.treatmentDate).getTime()
    );
  });

  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 3 }}>
        {/* [추가] 상단 헤더 + 뒤로 가기 */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => router.push("/billing")}
          >
            뒤로 가기
          </Button>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            미수금 목록
          </Typography>
        </Stack>

        {/* [추가] 안내 문구 */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f8fafc",
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
            미수금 정산 안내
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            남은 금액이 있는 청구를 조회한 뒤, 우측의
            <strong> 정산 처리</strong> 버튼으로 상세 페이지에 들어가
            전액 또는 부분 수납을 진행할 수 있습니다.
          </Typography>
        </Paper>

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
                <TableCell>미수금 금액</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="center">정산</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedBillingList.map((bill) => (
                <TableRow key={bill.billId}>
                  <TableCell>
                    <Link
                      href={`/billing/${bill.billId}?returnTo=${encodeURIComponent(
                        "/billing/outstanding"
                      )}`}
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {/* [수정] billingNo 우선 표시 */}
                      {bill.billingNo ?? bill.billId}
                    </Link>
                  </TableCell>

                  <TableCell>{resolvePatientName(bill.patientId)}</TableCell>

                  <TableCell>{bill.patientId}</TableCell>

                  <TableCell>{bill.treatmentDate}</TableCell>

                  <TableCell>{bill.totalAmount.toLocaleString()} 원</TableCell>

                  {/* [추가] 미수금 금액 표시 */}
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, color: "#d32f2f" }}>
                      {bill.remainingAmount.toLocaleString()} 원
                    </Typography>
                  </TableCell>

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

                  {/* [추가] 정산 처리 버튼 */}
                  <TableCell align="center">
                    <Button
                      component={Link}
                      href={`/billing/${bill.billId}?returnTo=${encodeURIComponent(
                        "/billing/outstanding"
                      )}`}
                      variant="contained"
                      size="small"
                    >
                      정산 처리
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {sortedBillingList.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    미수금 데이터가 없습니다
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