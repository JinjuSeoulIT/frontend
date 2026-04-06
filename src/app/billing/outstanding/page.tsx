"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

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
} from "@mui/material";

import { fetchOutstandingBillsRequest } from "@/features/billing/billingSlice";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import { getBillingStatusLabel } from "@/lib/billing/billingStatus";

export default function OutstandingBillingPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { billingList, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  /**
   * 추가:
   * patientId -> patientName 매핑용 상태
   */
  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );

  //미수금 조회
  useEffect(() => {
    dispatch(fetchOutstandingBillsRequest());
  }, [dispatch]);

  /**
   * 추가:
   * 환자 목록 전체 조회 후 patientId -> name 매핑 생성
   */
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

  /**
   * 추가:
   * patientId로 환자 이름 찾기
   */
  const resolvePatientName = useCallback(
    (patientId: number) => {
      return patientNameById[patientId] || "-";
    },
    [patientNameById]
  );

  /* ================================
     추가: 진료일 최신순(내림차순) 정렬용 목록
     - 원본 billingList는 건드리지 않고
     - 화면 출력용으로만 복사 후 정렬
  ================================= */
  const sortedBillingList = [...(billingList ?? [])].sort((a, b) => {
    return (
      new Date(b.treatmentDate).getTime() -
      new Date(a.treatmentDate).getTime()
    );
  });

  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          미수금 목록
        </Typography>

        {loading && <Typography>로딩 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {/* 테이블 */}
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
              {/* ================================
                 수정: 화면에는 최신 진료일 순으로 정렬된 목록 사용
              ================================= */}
              {sortedBillingList.map((bill) => (
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
                      {bill.billId}
                    </Link>
                  </TableCell>

                  <TableCell>{resolvePatientName(bill.patientId)}</TableCell>

                  <TableCell>{bill.patientId}</TableCell>

                  <TableCell>{bill.treatmentDate}</TableCell>

                  <TableCell>
                    {bill.totalAmount.toLocaleString()} 원
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getBillingStatusLabel(bill.status)}
                      color={
                        bill.status === "PAID"
                          ? "success"
                          : bill.status === "CONFIRMED"
                          ? "warning"
                          : "default"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}

              {/* 데이터 없을 때 */}
              {/* ================================
                 수정: 정렬된 목록 기준으로 빈 결과 여부 판단
              ================================= */}
              {sortedBillingList.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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