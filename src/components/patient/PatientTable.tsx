"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Pagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import type { Patient } from "@/features/patients/patientTypes";
import { patientStatusMeta, sexLabel, safe } from "./PatientListUtils";

type Props = {
  list: Patient[];
  selected: Patient | null;
  onSelect: (p: Patient) => void;
  onDeactivate: (patientId: number) => void;
  onNavigateToDetail: (patientId: number) => void;
};

export default function PatientTable({
  list,
  selected,
  onSelect,
  onDeactivate,
  onNavigateToDetail,
}: Props) {
  const primary = selected ?? list[0] ?? null;
  const ROWS_PER_PAGE = 10;
  const [page, setPage] = React.useState(1);
  const cellSx = { whiteSpace: "nowrap" };
  const columnWidths = {
    patientNo: 120,
    name: 110,
    gender: 70,
    birthDate: 120,
    phone: 140,
    status: 110,
    action: 120,
  } as const;
  const tableMinWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);

  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(list.length / ROWS_PER_PAGE));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [list.length, page]);

  const pagedList = React.useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return list.slice(start, start + ROWS_PER_PAGE);
  }, [list, page]);

  const totalPages = Math.max(1, Math.ceil(list.length / ROWS_PER_PAGE));

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, pb: 1.25 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800 }}>환자 목록</Typography>
            <Chip label={`총 ${list.length}`} size="small" />
          </Stack>
          <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 0.5 }}>
            더블클릭(또는 우측 아이콘)으로 상세 페이지 이동
          </Typography>
        </Box>

        <Divider />

        <TableContainer
          sx={{
            maxHeight: { xs: 380, md: 460, lg: 520, xl: 640 },
            overflowX: "auto",
          }}
        >
          <Table
            stickyHeader
            size="small"
            aria-label="patient list"
            sx={{
              minWidth: tableMinWidth,
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                ...cellSx,
                textAlign: "center",
                verticalAlign: "middle",
              },
            }}
          >
            <colgroup>
              <col style={{ width: columnWidths.patientNo }} />
              <col style={{ width: columnWidths.name }} />
              <col style={{ width: columnWidths.gender }} />
              <col style={{ width: columnWidths.birthDate }} />
              <col style={{ width: columnWidths.phone }} />
              <col style={{ width: columnWidths.status }} />
              <col style={{ width: columnWidths.action }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell>환자번호</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>성별</TableCell>
                <TableCell>생년월일</TableCell>
                <TableCell>연락처</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>
                  액션
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedList.map((p) => {
                const isSelected = primary?.patientId === p.patientId;
                const statusMeta = patientStatusMeta(p.statusCode);
                return (
                  <TableRow
                    key={p.patientId}
                    hover
                    selected={isSelected}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                    }}
                    onClick={() => onSelect(p)}
                    onDoubleClick={() => onNavigateToDetail(p.patientId)}
                  >
                    <TableCell>{safe(p.patientNo)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.name}
                    </TableCell>
                    <TableCell>{sexLabel(p.gender)}</TableCell>
                    <TableCell>{safe(p.birthDate)}</TableCell>
                    <TableCell>{safe(p.phone)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statusMeta.label}
                        variant={statusMeta.variant}
                        color={statusMeta.color}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="상세 페이지">
                          <IconButton
                            size="small"
                            component={Link}
                            href={`/patient/${p.patientId}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="비활성 처리">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeactivate(p.patientId);
                            }}
                          >
                            <BlockOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={{ color: "text.secondary" }}>
                      조회된 환자가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            shape="rounded"
            color="primary"
            siblingCount={4}
            boundaryCount={1}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
