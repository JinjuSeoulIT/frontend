"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import VaccinesIcon from "@mui/icons-material/Vaccines";

import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";




  const BasiclnfoHub= () => {
  const router = useRouter();



  //의사
  const moveDoctorCreate = () => {   //정보확인요청

  router.push(`/staff/doctor/basiclnfocreate`);
};



  //간호사
  const moveNurseCreate = () => {   //정보확인요청 
 
  router.push(`/staff/nurse/basiclnfocreate`);
  };


  //원무
  const moveReceptionCreate = () => {   //정보확인요청 
  // console.log("moveReceptionCreate staffId =", staffId);

  // if (!staffId) {
    // alert("staffId가 없습니다. 기본정보 상세에서 다시 진입하세요.");
  //   return;
  // }
  router.push(`/staff/reception/basiclnfocreate`);
  };


   //일반
  const moveBasiclnfoCreate = () => {   //정보확인요청 
  // console.log("moveReceptionCreate staffId =", staffId);

  // if (!staffId) {
    // alert("staffId가 없습니다. 기본정보 상세에서 다시 진입하세요.");
  //   return;
  // }
  router.push(`/staff/Basiclnfo/create`);
  };


  //예외처리
  const moveStaffList = () => {
    router.push("/staff/Basiclnfo/list");



  };





  return (
    <Box
      sx={{width: "100%",maxWidth: 900,mx: "auto",mt: 4,mb: 4,}}>
    
    <Card
      sx={{borderRadius: 4,boxShadow: 3,overflow: "hidden",}}>
    
    <Box
      sx={{px: 4,py: 3,color: "#fff",background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",}}>
    
    <Stack direction="row" spacing={1.5} alignItems="center">
    <LocalHospitalIcon />
    <Box>
              
    <Typography variant="h5" fontWeight="bold">
    직원 공통 등록 허브
    </Typography>
    <Typography variant="body2" sx={{ opacity: 0.9 }}>
    공통 직원 등록 후, 역할별 상세 등록으로 이동하는 화면입니다.
    </Typography>
    </Box>
    </Stack>
    </Box>

    <CardContent sx={{ p: 4 }}>
    <Box sx={{mb: 3,p: 2.5,borderRadius: 3,backgroundColor: "#f8fafc",border: "1px solid #e5e7eb",}}>
    
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
    등록 안내
    </Typography>

    <Typography variant="body2" color="text.secondary">
    공통 직원 정보 등록이 완료되었습니다.
    <br />
    다음 단계로 이동하여 직군별 상세 정보를 등록해주세요.
            </Typography>

    {/* {(staffId ) && (<Box sx={{ mt: 2 }}> {staffId && ( <Typography variant="body2">
          <strong>STAFF ID:</strong> {staffId} */}
    {/* </Typography>)} */}
    {/* </Box>)} */}

    </Box> <Divider sx={{ mb: 3 }} />
    <Stack spacing={2.5}>
    


    
    {/*의사 등록 카드*/}
    <Card variant="outlined"sx={{ borderRadius: 3, borderColor: "#bbdefb",}}>
    <CardContent>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
    <Box>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
    
    <MedicationIcon color="primary" />
    <Typography variant="h6" fontWeight="bold">
    의사 등록
    </Typography>
    </Stack>

    <Typography variant="body2" color="text.secondary">
    진료과, 면허번호, 프로필 등 의사 상세 정보를 등록합니다.
    </Typography>
    </Box>


    <Button variant="contained"size="large"onClick={moveDoctorCreate} sx={{minWidth: 160,borderRadius: 2,fontWeight: "bold",}}>
    의사 등록 이동
    </Button>
    </Stack>
    </CardContent>
    </Card>



    {/*간호사 등록 카드*/}
    <Card variant="outlined" sx={{borderRadius: 3,borderColor: "#c8e6c9",}}>
    <CardContent>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}justifyContent="space-between"alignItems={{ xs: "flex-start", md: "center" }}>
    <Box>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
    <VaccinesIcon color="success" />
    <Typography variant="h6" fontWeight="bold">
    간호사 등록
    </Typography>
    </Stack>

    <Typography variant="body2" color="text.secondary">
    근무형태, 배치부서, 자격정보 등 간호사 상세 정보를 등록합니다.
    </Typography>
    </Box>

    <Button variant="contained"color="success"size="large"onClick={moveNurseCreate} 
    sx={{minWidth: 160, borderRadius: 2, fontWeight: "bold", }} >
    간호사 등록 이동
    </Button>
    </Stack>
    </CardContent>
    </Card>




    {/*원무 등록 카드*/}
    <Card variant="outlined" sx={{borderRadius: 3,borderColor: "#c8e6c9",}}>
    <CardContent>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}justifyContent="space-between"alignItems={{ xs: "flex-start", md: "center" }}>
    <Box>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
    <AssignmentIndIcon color="warning" />
    <Typography variant="h6" fontWeight="">
    원무 등록
    </Typography>
    </Stack>

    <Typography variant="body2" color="text.secondary">
    근무형태, 배치부서, 자격정보 등 원무 상세 정보를 등록합니다.
    </Typography>
    </Box>

    <Button variant="contained"color="warning"size="large"onClick={moveReceptionCreate} 
    sx={{minWidth: 160, borderRadius: 2, fontWeight: "bold", }} >
    원무 등록 이동
    </Button>
    </Stack>
    </CardContent>
    </Card>



    {/*일반 등록 카드*/}
    <Card variant="outlined" sx={{borderRadius: 3,borderColor: "#c8e6c9",}}>
    <CardContent>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}justifyContent="space-between"alignItems={{ xs: "flex-start", md: "center" }}>
    <Box>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
    <VaccinesIcon color="success" />
    <Typography variant="h6" fontWeight="bold">
    일반 등록
    </Typography>
    </Stack>

    <Typography variant="body2" color="text.secondary">
    근무형태, 배치부서, 자격정보 등 일반 상세 정보를 등록합니다.
    </Typography>
    </Box>

    <Button variant="contained"color="success"size="large"onClick={moveBasiclnfoCreate} 
    sx={{minWidth: 160, borderRadius: 2, fontWeight: "bold", }} >
    일반 등록 이동
    </Button>
    </Stack>
    </CardContent>
    </Card>



    </Stack>
    <Stack
    direction={{ xs: "column", sm: "row" }}spacing={2}justifyContent="flex-end"sx={{ mt: 4 }}>
    <Button variant="outlined" onClick={moveStaffList}
    sx={{ borderRadius: 2, fontWeight: "bold" }}>
    직원 메인으로
    </Button>
    </Stack>
    </CardContent>
    </Card>
    </Box>
  );
};

export default BasiclnfoHub;