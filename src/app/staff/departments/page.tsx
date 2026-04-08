"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";
import {
  fetchStaffDepartmentSummaryApi,
  type StaffDepartmentSummaryItem,
} from "@/lib/staff/staffSummaryApi";

export default function StaffDepartmentsPage() {
  const [rows, setRows] = useState<StaffDepartmentSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return rows;
    }

    return rows.filter((item) => {
      const target = [item.departmentId, item.departmentName, item.activeFlag]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");
      return target.includes(normalized);
    });
  }, [keyword, rows]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStaffDepartmentSummaryApi();
        if (mounted) {
          setRows(data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "부서 목록 조회에 실패했습니다.";
        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MainLayout showSidebar={true}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            부서 관리
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            staff v2 라우팅 기준의 부서 목록 화면입니다.
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 2.5 }}>
          <CardContent>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                size="small"
                label="부서 검색"
                placeholder="부서명, ID, 활성 여부"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(0);
                }}
              />
            </Stack>

            {loading ? (
              <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : filteredRows.length === 0 ? (
              <Alert severity="info">조회된 부서 데이터가 없습니다.</Alert>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>부서 ID</TableCell>
                      <TableCell>부서명</TableCell>
                      <TableCell>활성 여부</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedRows.map((item) => (
                      <TableRow key={`${item.departmentId ?? "none"}-${item.departmentName ?? "unknown"}`}>
                        <TableCell>{item.departmentId ?? "-"}</TableCell>
                        <TableCell>{item.departmentName ?? "-"}</TableCell>
                        <TableCell>{item.activeFlag ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={filteredRows.length}
                  page={page}
                  onPageChange={(_, nextPage) => setPage(nextPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(Number(event.target.value));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[10, 20, 50]}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
