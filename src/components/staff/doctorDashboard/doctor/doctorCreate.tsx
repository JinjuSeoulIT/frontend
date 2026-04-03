"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { RootState } from "@/store/rootReducer";
import {
  createDoctorRequest,
  resetSuccessEnd,
} from "@/features/staff/doctor/doctorSlice";

import { DoctorCreateRequest, initialDoctorCreateForm } from "@/features/staff/doctor/doctortypes";
import { clearBasicDraft } from "@/features/staff/Basiclnfo/BasiclnfoSlict";




//의사
export default function DoctorCreate() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error, createSuccess } = useSelector((state: RootState) => state.doctor);

//⭐이게 기존 저장소 (가져옴)
const doctorBasiclnfo = useSelector((state: RootState) => state.staff.BasiclnfoCreate);

const [form, setForm] = useState(initialDoctorCreateForm);


  //기본정보 없으면 리턴
  useEffect(() => {
    if (!doctorBasiclnfo) {
  
      router.replace("/staff/Basiclnfo/list");
    }
  }, [doctorBasiclnfo, router]);




  


  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!doctorBasiclnfo) {
      alert("공통 입력 정보가 없습니다.");
      return;
    }
    const doctorReq: DoctorCreateRequest = {
      //⭐ 공통 (기존값)
      staffId: Number(doctorBasiclnfo.staffId),
      deptId: doctorBasiclnfo.deptId.trim(),
      positionId: doctorBasiclnfo.positionId.trim(),

      name: doctorBasiclnfo.name.trim(),
      phone: doctorBasiclnfo.phone.trim(),
      email: doctorBasiclnfo.email.trim(),
      birthDate: doctorBasiclnfo.birthDate.trim(),
      genderCode: doctorBasiclnfo.genderCode.trim(),
      zipCode: doctorBasiclnfo.zipCode.trim(),
      address1: doctorBasiclnfo.address1.trim(),
      address2: doctorBasiclnfo.address2.trim(),
      status: doctorBasiclnfo.status.trim() || "ACTIVE",


      // 의사
      licenseNo: form.licenseNo.trim(),
      specialtyId: form.specialtyId.trim(),
      doctorType: "DOCTOR",
      doctorFileUrl: (form.doctorFileUrl ?? "").trim(),
      profileSummary: form.profileSummary.trim(),
      education: form.education.trim(),
      careerDetail: form.careerDetail.trim(),
      extNo: form.extNo.trim(),
    };

    dispatch(createDoctorRequest(doctorReq));
  };





    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };




  //의사 정보 없으면 리턴
  useEffect(() => {
    if (!createSuccess) return;

    dispatch(clearBasicDraft());
    dispatch(resetSuccessEnd());
    router.replace("/staff/doctor/list");
  }, [createSuccess, dispatch, router]);




  return (
      <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          bgcolor: "white",
          boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
        }}
      >
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>
              의사 생성
            </Typography>
            <Typography variant="body2" color="text.secondary">
              공통 정보 + 의사 정보를 마지막에 한 번에 등록합니다.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <TextField
              label="부서 ID"
              value={doctorBasiclnfo?.deptId ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText="이전 단계 공통 입력폼에서 작성한 값입니다."
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="직원번호(staffId)"
              value={doctorBasiclnfo?.staffId ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText="최종 등록 시 공통 + 의사 정보와 함께 전송됩니다."
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="직책 ID"
              value={doctorBasiclnfo?.positionId ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText="이전 단계 공통 입력폼에서 작성한 값입니다."
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />


            <TextField
              label="이름"
              value={doctorBasiclnfo?.name ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />





            <TextField
              label="의사 면허 *"
              name="licenseNo"
              value={form.licenseNo}
              onChange={handleChange}
              fullWidth
              required
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="전문 과목 *"
              name="specialtyId"
              value={form.specialtyId}
              onChange={handleChange}
              fullWidth
              required
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="사내번호"
              name="extNo"
              value={form.extNo}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="한줄 소개"
              name="profileSummary"
              value={form.profileSummary}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="학력"
              name="education"
              value={form.education}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="경력 상세"
              name="careerDetail"
              value={form.careerDetail}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                onClick={() => router.push("/staff/doctor/basiclnfocreate")}
                disabled={loading}
                fullWidth
              >
                이전으로
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !doctorBasiclnfo}
                sx={{ bgcolor: "#2b5aa9" }}
                fullWidth
              >
                {loading ? <CircularProgress size={18} /> : "가입완료"}
              </Button>
            </Stack>

            {createSuccess && (
              <Alert severity="success">등록이 완료되었습니다.</Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}