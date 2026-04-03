"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import { DetailNurseRequest, resetSuccessEnd } from "@/features/staff/nurse/nurseSlice";
import { NurseIdNumber } from "@/features/staff/nurse/nurseTypes";
import NurseUpload from "./nurseUpload";
import StatusBadge from "../../BasiclnfoDashboard/BasiclnfoStatus";

  const NurseDetail = ({ staffId }: NurseIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { nurseDetail, loading, error } = useSelector((state: RootState) => state.nurse);



  const goEeployeeList = () => router.push("/staff/Basiclnfo/list");

  const goNurseList = () => router.replace("/staff/nurse/list");
  //간호사수정
  const goNurseEdit = () => router.push(`/staff/nurse/${staffId}/edit`);
  //일반수정
  const goEdit = () => router.push(`/staff/Basiclnfo/${staffId}/edit`);
  
  useEffect(() => {
    if (!staffId) return;
    dispatch(DetailNurseRequest( staffId ));
    dispatch(resetSuccessEnd());
  }, [dispatch, staffId]);


  return (
        <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>간호사 상세</Typography>
        </Stack>

            <Stack direction="row" spacing={1.5} justifyContent="pace-between" sx={{ mt: 2 }} >
         
            </Stack>



                
            
              <Stack direction="row" spacing={1.5} justifyContent="pace-between" sx={{ mt: 2 }} ></Stack>
              {/*이미지 */}
              {!loading && nurseDetail&& (
              <Stack spacing={3}>
              <Box sx={{ display: "flex",  
              //여기가 오른쪽 조절
              justifyContent: "flex-end", 

              alignItems: "center", mb: 1 }}>
            
            
              {/*미리보기  */}
              {nurseDetail.nurseFileUrl ? (
              <Box component="img" 
              src={nurseDetail.nurseFileUrl} 
              alt="간호사 프로필" 

              //미리보기 크기 조절
              sx={{ width: 500, height: 500, borderRadius: 3, objectFit: "cover", 
              border: "1px solid #dbe5f5", bgcolor: "#f4f7fd" }} />
              ) : (
              <Box sx={{ width: 500, height: 500, borderRadius: 3, 
              border: "1px solid #dbe5f5", bgcolor: "#f4f7fd", 
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              
              <Typography variant="body2" color="text.secondary">이미지 없음</Typography>
              </Box>
              )}
              <NurseUpload staffId={staffId} />
              </Box>




                <Divider />
                <Table size="small">
                <TableBody>
                <TableRow>
                <TableCell 
                sx={{ fontWeight: 700, width: 160 }}>직원번호
                </TableCell>
                <TableCell>{nurseDetail.staffId ?? "-"}
                </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell 
                  sx={{ fontWeight: 700 }}>간호사 면허번호
                  </TableCell>
                  <TableCell>{nurseDetail.licenseNo ?? "-"}
                  </TableCell>
                  </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>근무 형태
                  </TableCell>
                  <TableCell>{nurseDetail.shiftType ?? "-"}
                  </TableCell>
                  </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>사내번호
                  </TableCell>
                  <TableCell>{nurseDetail.extNo ?? "-"}
                  </TableCell>
                  </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>학력
                  </TableCell>
                  <TableCell>{nurseDetail.education ?? "-"}
                  </TableCell>
                  </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>경력 상세
                  </TableCell>
                  <TableCell>{nurseDetail.careerDetail ?? "-"}
                  </TableCell>
                  </TableRow>

                  <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>상태
                  </TableCell>
                  <TableCell>

                  <StatusBadge status= {nurseDetail.status ?? "-"}></StatusBadge>
                  
                  </TableCell>
                  </TableRow>
                  </TableBody>
                  </Table>



            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }} >
            
            <Button variant="contained" onClick={goEeployeeList}  sx={{ bgcolor: "#da342f" }}> 직원 목록</Button>

            <Button variant="outlined" onClick={goNurseList}>간호사목록</Button>
            
            <Button variant="contained" onClick={goNurseEdit} sx={{ bgcolor: "#2b5aa9" }}>간호사 정보수정</Button>

            <Button variant="contained" onClick={goEdit} sx={{ bgcolor: "#2b5aa9" }}>일반 정보수정</Button>
            </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
          </Box>}

        
          </Stack>
          
        )}
      </Paper>
    </Box>
  );
};

export default NurseDetail;
