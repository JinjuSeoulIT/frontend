"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
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
import type { PositionResponse } from "@/features/staff/position/positiontypes";

type StaffPositionClientProps = {
  initialRows: PositionResponse[];
  initialError: string | null;
};

export default function StaffPositionClient({
  initialRows,
  initialError,
}: StaffPositionClientProps) {
  const [rows] = useState<PositionResponse[]>(initialRows);
  const [error] = useState<string | null>(initialError);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return rows;
    }

    return rows.filter((item) => {
      const target = [
        item.positionId,
        item.positionName,
        item.positionCode,
        item.positionType,
        item.positionLevel,
        item.managerYn,
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");
      return target.includes(normalized);
    });
  }, [keyword, rows]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  return (
    <MainLayout showSidebar={true}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            직책 관리
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            직책 목록 조회 및 검색 페이지입니다.
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 2.5 }}>
          <CardContent>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                size="small"
                label="직책 검색"
                placeholder="직책명, 코드, 유형, 레벨"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(0);
                }}
              />
            </Stack>

            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : filteredRows.length === 0 ? (
              <Alert severity="info">조회 결과가 없습니다.</Alert>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>직책 ID</TableCell>
                      <TableCell>직책명</TableCell>
                      <TableCell>직책 코드</TableCell>
                      <TableCell>직책 유형</TableCell>
                      <TableCell>레벨</TableCell>
                      <TableCell>관리자 여부</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedRows.map((item) => (
                      <TableRow key={item.positionId}>
                        <TableCell>{item.positionId ?? "-"}</TableCell>
                        <TableCell>{item.positionName ?? "-"}</TableCell>
                        <TableCell>{item.positionCode ?? "-"}</TableCell>
                        <TableCell>{item.positionType ?? "-"}</TableCell>
                        <TableCell>{item.positionLevel ?? "-"}</TableCell>
                        <TableCell>{item.managerYn ?? "-"}</TableCell>
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
                  labelRowsPerPage="페이지당 행 수"
                />
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
