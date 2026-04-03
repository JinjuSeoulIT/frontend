"use client";

import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import {DoctorListRequest, resetSuccessEnd, searchDoctorListRequest } from "@/features/staff/doctor/doctorSlice";


import { DoctorResponse, DoctorSearchType, SearchDoctorPayload } from "@/features/staff/doctor/doctortypes";
import StatusBadge from "../../BasiclnfoDashboard/BasiclnfoStatus";

import DoctorFont from "../DoctorFont";
// import DoctorSearchBar from "./doctorSearchBar";

////의사
const DoctorList = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { doctorList, doctorSearch, loading ,error } = useSelector((state: RootState) => state.doctor);

  //서치바 검색
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<DoctorSearchType>("all");
  


  useEffect(() => {
    dispatch(DoctorListRequest());
  }, [dispatch]);

  //홈  라우팅
  const handleHome = () => router.push("/staff");
  //생성 라우팅
  const handleCreate = () => router.push("/staff/Basiclnfo/list");
  //수정 라우팅
  const handleEdit = (staffId: number) => router.push(`/staff/doctor/${staffId}/edit`);



    {/*🔍🔍검색바🔍🔍 */}
    const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!search.trim()) {
    dispatch(DoctorListRequest());
    dispatch(resetSuccessEnd());
    return;
    }
    const doctorReq: SearchDoctorPayload = {
    search: search.trim(),
    searchType, };

    console.log("doctorReq", doctorReq);

    dispatch(searchDoctorListRequest(doctorReq));
    };
    const doctors = search.trim() ? doctorSearch : doctorList; //리스트를 트림 절삭해서 담음
    {/*🔍🔍검색바🔍🔍 */}




  //상세 분기점
  const DoctorDetail = (doctor: DoctorResponse) => {

   //의사 디테일로
  if (doctor.doctorType) {
  const path = `/staff/doctor/${doctor.staffId}/detail`;

  console.log(path); //테스트 콘솔

  router.push(path);
  return;
  }
}


  return (

  /*MUI 스타일 */

  //박스크기
  <Box sx={{ maxWidth: 1480, mx: "auto", px: 2, py: 2 }}>

  {/*테두리*/}
  <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #0f69fa" }}> 
  {/*제목과 버튼 제목 가로정렬            양쪽끝 벌리기            가운데 맞춤*/}
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          

          <Typography variant="h6" fontWeight={800}>의사 목록</Typography>
          
          <Button variant="contained"  disabled={loading}  onClick={handleHome} sx={{ mb: 2 }}>메인홈
          </Button>
          </Stack>


        {/*🔍🔍검색바🔍🔍 */}
        <Box component="form" onSubmit={handleSubmit}  sx={{ mb: 2 }}>
        {/*가로 세로 정렬 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        
        <TextField  
          select
          label="검색조건"
          value={searchType}
          onChange={(event) =>setSearchType(event.target.value as DoctorSearchType)}
          sx={{ minWidth: 180 }}
        >
          {/*서치 검색UI */}
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="name">이름</MenuItem>
          <MenuItem value="specialty">진료과</MenuItem>
          <MenuItem value="staffId">사원번호</MenuItem>
          <MenuItem value="dept">부서</MenuItem>
          <MenuItem value="extNo">사내번호</MenuItem>
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
        {/*🔍🔍검색바🔍🔍 */}

                {/*테이블 UI */}
                <Table size="small">
                <TableHead>
                <TableRow>
                <TableCell>직원번호</TableCell>
                <TableCell>의사이름</TableCell>
                <TableCell>부서</TableCell>
                <TableCell>면허번호</TableCell>
                <TableCell>직업</TableCell>
                <TableCell>전문분야</TableCell>
                <TableCell>사내번호</TableCell>
                <TableCell>근무상태</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>

                {/*맵핑 UI */}
                {/*🔍🔍검색바🔍🔍 */}
                {doctors.map((doctor:DoctorResponse) => {

        
              return (
                  
                <TableRow key={doctor.staffId}>
                
                <TableCell>{doctor.staffId}</TableCell>
                <TableCell>{doctor.name}</TableCell>
                <TableCell>{doctor.deptId}</TableCell>
                <TableCell>{doctor.licenseNo}</TableCell>


                <TableCell>
                <DoctorFont doctorType= {doctor.doctorType} />
                </TableCell>


                {/* <TableCell>{doctor.doctorType ?? "DOCTOR"}</TableCell> */}
                <TableCell>{doctor.specialtyId}</TableCell>
                <TableCell>{doctor.extNo ?? "-"}</TableCell>
                
                <TableCell>
                  <StatusBadge status= {doctor.status} />
                </TableCell>

    

                <TableCell>
                <Button size="small" onClick={() => DoctorDetail(doctor)}>상세</Button>



                
                <Button size="small" onClick={() => handleEdit(doctor.staffId)}>수정</Button>
                </TableCell>
                </TableRow>
                
                );
                })}
            </TableBody>
            </Table>



          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" onClick={handleCreate}>의사 등록</Button>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
      </Paper>


</Box>


  );
};

export default DoctorList;
