"use client";

import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import {
  nurselistRequest,
  resetSuccessEnd,
  searchNurseListRequest,
} from "@/features/staff/nurse/nurseSlice";
import type { NurseResponse, NurseSearchType, SearchNursePayload } from "@/features/staff/nurse/nurseTypes";
import StatusBadge from "../../BasiclnfoDashboard/BasiclnfoStatus";
import NurseFont from "../NurseFont";




  const NurseList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { nurselist, nurseSearch ,loading ,error} = useSelector((state: RootState) => state.nurse);

  // SearchNursePayload //검색
    const [search, setSearch] = useState("");
    const [searchType, setSearchType] = useState<NurseSearchType>("all");




  useEffect(() => {
    dispatch(nurselistRequest());
  }, [dispatch]);


  const handleHome = () => router.push("/staff");

  const handleCreate = () => router.push("/staff/Basiclnfo/list");

  // const handleDetail = (staffId: number) => router.push(`/staff/nurse/${staffId}/detail`);


  const handleEdit = (staffId: number) => router.push(`/staff/nurse/${staffId}/edit`);




//검색바
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

  if (!search.trim()) {
    dispatch(nurselistRequest());
    dispatch(resetSuccessEnd());
    return;
  }
    const nurseReq: SearchNursePayload = {
      search: search.trim(),
      searchType,
    };
    console.log("doctorReq", nurseReq);
    dispatch(searchNurseListRequest(nurseReq));
  };


const nurses = search.trim() ? nurseSearch : nurselist;

  




const NurseDetail = (nurse: NurseResponse) => {


   //의사 디테일로
  if (nurse.nurseType) {
    const path = `/staff/nurse/${nurse.staffId}/detail`;

    console.log( path);
    router.push(path);
    return;
  }

}




  return (
    <Box sx={{ maxWidth: 1480, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #0f69fa" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>간호사 목록</Typography>
          <Button variant="contained" onClick={handleHome} sx={{ mb: 2 }}>메인홈</Button>
        </Stack>



         {/*검색바 */}
        <Box component="form"  onSubmit={handleSubmit}  sx={{ mb: 2 }}>
        {/*가로 세로 정렬 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        
        <TextField  
          select
          label="검색조건"
          value={searchType}
          onChange={(event) =>setSearchType(event.target.value as NurseSearchType)}
          sx={{ minWidth: 180 }}
        >
          {/*서치 검색UI */}
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="name">이름</MenuItem>
          <MenuItem value="shiftType">근무형태</MenuItem>
          <MenuItem value="extNo">사내번호</MenuItem>
          <MenuItem value="staffId">사원번호</MenuItem>
          <MenuItem value="dept">부서</MenuItem>
        </TextField>


        <TextField
          label="검색어"
          value={search}
          onChange={(e) => setSearch(e.target.value)} fullWidth/>
        <Button type="submit" variant="contained">
          검색
        </Button>
        </Stack>
        </Box>






              <Table size="small">
              <TableHead>
                <TableRow>
                <TableCell align="center">직원번호</TableCell>
                <TableCell align="center"> 이름   </TableCell>
                <TableCell align="center"> 부서   </TableCell>
                <TableCell align="center">면허번호</TableCell>
            
                <TableCell align="center"> 직업   </TableCell>
                <TableCell align="center">근무형태</TableCell>
                <TableCell align="center">사내번호</TableCell>
                <TableCell align="center">근무상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>



              {nurses.map((nurse) => {
              
        
              return (


              <TableRow key={nurse.staffId}>
                <TableCell  align="center">{nurse.staffId}</TableCell>
                <TableCell  align="center">{nurse.name}</TableCell>
                <TableCell  align="center">{nurse.deptId}</TableCell>
                <TableCell  align="center">{nurse.licenseNo}</TableCell>

                <TableCell  align="center">
                  <NurseFont nurseType={nurse.nurseType} />
                  </TableCell>

                <TableCell  align="center">{nurse.shiftType}</TableCell>
                <TableCell  align="center">{nurse.extNo ?? "-"}</TableCell>

                <TableCell  align="center">
                <StatusBadge status={nurse.status} />
                </TableCell>


                <TableCell  align="center">
                  <Button size="small" onClick={() => NurseDetail(nurse)}>상세</Button>

                  <Button size="small" onClick={() => handleEdit(nurse.staffId)}>수정</Button>
                </TableCell>
              </TableRow>
              );
              })}
            </TableBody>
            </Table>

                {!nurselist.length && !loading && (
                <TableRow>
                <TableCell colSpan={9} align="center">
                  조회된 직원이 없습니다.
                </TableCell>
                </TableRow>
                )}
              



        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" onClick={handleCreate}>등록</Button>
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Paper>
    </Box>
  );
};

export default NurseList;
