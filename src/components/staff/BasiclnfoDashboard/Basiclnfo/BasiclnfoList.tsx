"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { resetSuccessEnd, searchStaffListRequest, StafflistRequest } from "@/features/staff/Basiclnfo/BasiclnfoSlict";
import { staffResponse, staffSearchType } from "@/features/staff/Basiclnfo/BasiclnfoType";
import { departmentListRequest } from "@/features/staff/department/departmentSlisct";
import BasicInfoDelete from "./BasiclnfoDelete";
import StatusBadge from "../BasiclnfoStatus";
import NurseFont from "../../nurseDashboard/NurseFont";
import DoctorFont from "../../doctorDashboard/DoctorFont";
import ReceptionFont from "../../receptionDashboard/ReceptionFont";
import { DEPT_ID } from "@/features/staff/department/departmentType";




//공통
const BasicInfoList = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { Stafflist, StaffSearch, loading, error } = useSelector((state: RootState) => state.staff);
  

  //⭐삭제 (모달)                                number | undefined //undefined는 “값이 아직 없음 / 안 정해짐”
  const [staffDelete, setstaffDelete] = useState<number | null>(null); //널도 포함

  //검색 스테이트
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<staffSearchType>("all");



  
  useEffect(() => {
 

    dispatch(StafflistRequest());
    dispatch(departmentListRequest());
  }, [dispatch]);



  //여긴 분기점
  const handleDetail = (staff: staffResponse) => {
    if (staff.doctorType) return router.push(`/staff/doctor/${staff.staffId}/detail`);

    if (staff.nurseType) return router.push(`/staff/nurse/${staff.staffId}/detail`);

    if (staff.receptionType) return router.push(`/staff/reception/${staff.staffId}/detail`);
    
    {return router.push(`/staff/Basiclnfo/${staff.staffId}/detail`);}
  };



  //수정
  const handleEdit = (staff: staffResponse) => router.push(`/staff/Basiclnfo/${staff.staffId}/edit`);

  //⭐삭제 (모달형)
  const handleOpenDeleteDialog = (staffId: number) => setstaffDelete(staffId);

  const handleCloseDeleteDialog = () => setstaffDelete(null);




  //검색 슈미터
  const handleSubmit = (event: FormEvent) => {

    event.preventDefault();
    const keyword = search.trim();
    if (!keyword) {

    dispatch(StafflistRequest());
    dispatch(resetSuccessEnd());
    return;
    }
    dispatch(searchStaffListRequest({ search: keyword, searchType }));
  };
  const staffs = search.trim() ? StaffSearch : Stafflist;






  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight={800}>직원 공통 목록</Typography>



      <Stack direction="row" spacing={1}>






            {/* 분기별 라우팅*/}
            <Button variant="outlined" onClick={() => router.push("/staff")}>직원 홈</Button>

            <Button variant="contained" onClick={() => router.push("/staff/department/list")}>+ 부서목록</Button>

            <Button variant="contained" onClick={() => router.push(`/staff/location/list`)} sx={{ bgcolor: "#1a38e2" }}>+ 직원배치</Button>

            <Button variant="contained" onClick={() => router.push(`/staff/position/list`)} sx={{ bgcolor: "#da342f" }}>+ 직책목록</Button>

            <Button variant="contained"onClick={() => router.push("/staff/Basiclnfo/hub")}sx={{ bgcolor: "#da342f" }}> + 직원등록</Button>
            
            <Button variant="contained" onClick={() => router.push(`/staff/doctor/medical/list`)} sx={{ bgcolor: "#da342f" }}>+ 과목목록</Button>

        </Stack>
        </Stack>


        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

        <TextField select label="검색조건" 
        value={searchType} 
        onChange={(event) => setSearchType(event.target.value as staffSearchType)} sx={{ minWidth: 180 }}>
            
        <MenuItem value="all">전체</MenuItem>
        </TextField>
        <TextField label="검색어" 
        value={search} 
        onChange={(event) => setSearch(event.target.value)} fullWidth />
        <Button type="submit" variant="contained">검색</Button>
        </Stack>
        </Box>




        <Table size="small">
          <TableHead>
            <TableRow>
            <TableCell>직원번호</TableCell>
            <TableCell align="center">부서</TableCell>
            <TableCell >이름</TableCell>
            <TableCell align="center">연락처</TableCell>
            <TableCell align="center">상태</TableCell>
            <TableCell align="center">직업</TableCell>
            <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            
            {staffs.map((staff: staffResponse) => {const deptId = DEPT_ID.find((option) => option.value === staff.deptId);
            ////부서 아이디   한글로 변환해서 가져옴


            return (
            <TableRow key={staff.staffId} hover>
            <TableCell>   {staff.staffId}</TableCell>

            <TableCell>
            {/* //?  부서앞에 값이 있으면 라벨로 접근
                //?? 없으면 스테프 부서아이디로 (staff.deptId)*/}  
            {deptId?.label ?? staff.deptId}
            </TableCell>

                  
            <TableCell>{staff.name}</TableCell>
            <TableCell>{staff.phone}</TableCell>

            <TableCell>
            {/*StatusBadge 액션 스테이트마다 분기별로 나눠놨음 */}  
            <StatusBadge status={staff.status} /></TableCell>
                  
                  
            <TableCell align="center">
            {staff.doctorType ?    <DoctorFont doctorType={staff.doctorType} /> :
            //타입분기점     및    폰트지정
            staff.nurseType ?     <NurseFont nurseType={staff.nurseType} /> :

            staff.receptionType ? <ReceptionFont receptionType={staff.receptionType} /> : "미등록"}
            </TableCell>
                
                
            <TableCell align="center">
            <Button size="small" onClick={() => handleDetail(staff)}>상세</Button>

            <Button size="small" onClick={() => handleEdit(staff)}>수정</Button>

            <Button color="error" onClick={() => handleOpenDeleteDialog(staff.staffId)}>삭제</Button>
            </TableCell>
            </TableRow>
            );
            })}




            {!staffs.length && !loading && (
            <TableRow>
            <TableCell colSpan={8} align="center">조회된 직원이 없습니다.</TableCell>
            </TableRow>
            )}
          </TableBody>
          </Table>
          </Paper>

      <BasicInfoDelete open={!!staffDelete} staffId={staffDelete!}  //널이아님 보장
      onClose={handleCloseDeleteDialog} />
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
  );
};

export default BasicInfoList;
