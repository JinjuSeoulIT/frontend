"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { DetailStaffRequest, resetSuccessEnd } from "@/features/staff/Basiclnfo/BasiclnfoSlict";
import { staffIdNumber } from "@/features/staff/Basiclnfo/BasiclnfoType";
import { departmentListRequest } from "@/features/staff/department/departmentSlisct";
import { positionListRequest } from "@/features/staff/position/positionSlice";


//공통
const BasicInfoDetail = ({ staffId }: staffIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { StaffDetail, loading, error } = useSelector((state: RootState) => state.staff);

  //⭐부서 셀렉터값
  const { Departmentlist } = useSelector((state: RootState) => state.department);
  //⭐직책 셀렉터값
  const { positionList   } = useSelector((state: RootState) => state.position);

 //배열 방식 (find)
 //const selectedDepartment = Departmentlist.find((item) => item.deptId === StaffDetail?.deptId);

  //맵 방식 <부서> (Map)
  const departmentMap = new Map(
  Departmentlist.map((item) => [item.deptId, item]));
  const selectedDepartment = StaffDetail 
                            ? departmentMap.get(StaffDetail.deptId)
                            : undefined; //값을 미리 비워놓음 (초기상태)

  //맵 방식 <직책> (Map)
  const positionMap = new Map(
  positionList.map((item) => [item.positionId, item]));
  const selectedPosition = StaffDetail 
                            ? positionMap.get(StaffDetail.positionId)
                            : undefined; //값을 미리 비워놓음 (초기상태)


  useEffect(() => {
    if (staffId) {

      dispatch(DetailStaffRequest(staffId));

      dispatch(departmentListRequest());
      dispatch(positionListRequest());

      dispatch(resetSuccessEnd());
    }
  }, [dispatch, staffId]);



  return (
      <Box sx={{ maxWidth: 820, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight={800}>직원 공통 상세</Typography>
      <Stack direction="row" spacing={1}>
            
      <Button variant="outlined" onClick={() => router.push("/staff/Basiclnfo/list")}>목록</Button>
      
      <Button variant="contained" onClick={() => router.push(`/staff/Basiclnfo/${staffId}/edit`)}>수정</Button>
      
      {/* <Button variant="contained" onClick={() => router.push(`/staff/Basiclnfo/board`)}>직업 등록</Button> */}
      
      </Stack>
      
      </Stack>

        {loading && <Typography>불러오는 중...</Typography>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && !StaffDetail && <Typography>직원 정보를 찾을 수 없습니다.</Typography>}

            {StaffDetail && (
            <Stack spacing={1.25}>
            <Typography>
            <strong>직원번호:
              </strong> {StaffDetail.staffId}
            </Typography>
            
            <Typography>
              <strong>부서 ID:
              </strong> {StaffDetail.deptId}
            </Typography>



            <Typography>
            <strong>부서명:</strong> {selectedDepartment?.deptName ?? "-"}
            </Typography>

            <Typography>
            <strong>부서장:</strong> {selectedDepartment?.headDeptName ?? "-"}
            </Typography>



            <Typography><strong>직책 ID:</strong> {StaffDetail.positionId}
            </Typography>

            <Typography>
              <strong>직책명:</strong> {selectedPosition?.positionName ?? "-"}
              </Typography>


            <Typography>
              <strong> 이름:</strong> {StaffDetail.name}
            </Typography>

            <Typography>
              <strong>연락처:</strong> {StaffDetail.phone}
            </Typography>

            <Typography>
              <strong>이메일:</strong> {StaffDetail.email}
            </Typography>

            <Typography>
              <strong>생년월일:</strong> {StaffDetail.birthDate}
            </Typography>

            <Typography>
              <strong>성별코드:</strong> {StaffDetail.genderCode}
            </Typography>

            <Typography>
              <strong>상태:</strong> {StaffDetail.status}
            </Typography>


            <Divider sx={{ my: 1 }} />
            <Typography><strong>우편번호:</strong> {StaffDetail.zipCode}</Typography>

            <Typography><strong>주소1:</strong> {StaffDetail.address1}</Typography>

            <Typography><strong>주소2:</strong> {StaffDetail.address2}</Typography>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default BasicInfoDetail;
