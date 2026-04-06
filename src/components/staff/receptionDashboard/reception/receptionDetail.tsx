"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { DetailReceptionRequest } from "@/features/staff/reception/receptionSlice";
import type { ReceptionIdNumber } from "@/features/staff/reception/receptionTypes";
import StatusBadge from "../../BasiclnfoDashboard/BasiclnfoStatus";
import ReceptionFont from "../ReceptionFont";

const ReceptionDetail = ({ staffId }: ReceptionIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { receptionDetail, loading, error } = useSelector((state: RootState) => state.reception);

  useEffect(() => {
    if (!staffId) return;
    dispatch(DetailReceptionRequest( staffId ));
  }, [dispatch, staffId]);

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
          <Stack spacing={2}>
          <Typography variant="h6" fontWeight={800}>원무 상세 조회</Typography>

          {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
          {error && <Alert severity="error">{error}</Alert>}

          {receptionDetail && (
            <>
                <Table size="small">
                <TableBody>
                <TableRow>

                <TableCell 
                sx={{ fontWeight: 700, width: 180 }}>직원번호
                </TableCell><TableCell>{receptionDetail.staffId ?? "-"}</TableCell>
                </TableRow>


                <TableRow><TableCell 
                sx={{ fontWeight: 700 }}>이름</TableCell>
                <TableCell>{receptionDetail.name ?? "-"}</TableCell></TableRow>


                <TableRow>
                <TableCell 
                sx={{ fontWeight: 700 }}>부서</TableCell>
                <TableCell>{receptionDetail.deptId ?? "-"}</TableCell></TableRow>


                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>직군</TableCell>
                <TableCell><ReceptionFont receptionType={receptionDetail.receptionType} /></TableCell>
                </TableRow>


                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>업무구분</TableCell>
                <TableCell>{receptionDetail.jobTypeCd ?? "-"}</TableCell></TableRow>


                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>창구번호</TableCell>
                <TableCell>{receptionDetail.deskNo ?? "-"}</TableCell>
                </TableRow>


                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>근무형태</TableCell>
                <TableCell>{receptionDetail.shiftType ?? "-"}</TableCell>
                </TableRow>


                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>업무 시작일</TableCell>
                <TableCell>{receptionDetail.startDate ?? "-"}</TableCell>
                </TableRow>


                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>창구구역</TableCell>
                <TableCell>{receptionDetail.windowArea ?? "-"}</TableCell>
                </TableRow>


                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>사내번호</TableCell>
                <TableCell>{receptionDetail.extNo ?? "-"}</TableCell>
                </TableRow>


                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>파트타임/멀티태스크</TableCell>
                <TableCell>{receptionDetail.multiTask ?? "-"}</TableCell>
                </TableRow>

                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>비고</TableCell>
                <TableCell>{receptionDetail.rmk ?? "-"}</TableCell>
                </TableRow>
                <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>상태</TableCell>
                <TableCell>
                <StatusBadge status={receptionDetail.status ?? "-"} /></TableCell>
                </TableRow>
                </TableBody>
                </Table>

                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => router.push("/staff/reception/list")}>목록
                </Button>

                <Button variant="contained" onClick={() => router.push(`/staff/reception/${staffId}/edit`)} 
                sx={{ bgcolor: "#2b5aa9" }}>원무 정보수정</Button>

                 <Button variant="contained" onClick={() => router.push(`/staff/Basiclnfo/${staffId}/edit`)} 
                sx={{ bgcolor: "#2b5aa9" }}>일반 정보수정</Button>

                <Button color="error" variant="outlined" onClick={() => router.push(`/staff/reception/${staffId}/delete`)}>삭제
                </Button>
              </Stack>
            </>
          )}
        </Stack>
        </Paper>
        </Box>
  );
};

export default ReceptionDetail;
