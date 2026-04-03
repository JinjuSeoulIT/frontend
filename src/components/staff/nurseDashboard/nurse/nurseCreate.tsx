"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from "@mui/material";

import { RootState } from "@/store/rootReducer";
import { createNurseRequest, resetSuccessEnd } from "@/features/staff/nurse/nurseSlice";
import { initialNurseCreateForm, type NurseCreateRequest } from "@/features/staff/nurse/nurseTypes";
import { clearBasicDraft } from "@/features/staff/Basiclnfo/BasiclnfoSlict";


const NurseCreatePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { createSuccess, loading, error } = useSelector((state: RootState) => state.nurse);
  const basicInfo = useSelector((state: RootState) => state.staff.BasiclnfoCreate);

  const [form, setForm] = useState<NurseCreateRequest>(initialNurseCreateForm);

  useEffect(() => {
    if (!basicInfo) {
      router.replace("/staff/Basiclnfo/list");
    }
  }, [basicInfo, router]);

  useEffect(() => {
    if (!createSuccess) return;

    dispatch(clearBasicDraft());

    dispatch(resetSuccessEnd());

    router.replace("/staff/nurse/list");
  }, [createSuccess, dispatch, router]);





  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!basicInfo) {
      alert("공통 입력 정보가 없습니다.");
      return;
    }

    const request: NurseCreateRequest = {
      staffId: Number(basicInfo.staffId),
      deptId: basicInfo.deptId.trim(),
      positionId: basicInfo.positionId.trim(),

      name: basicInfo.name.trim(),
      phone: basicInfo.phone.trim(),
      email: basicInfo.email.trim(),
      birthDate: basicInfo.birthDate.trim(),
      genderCode: basicInfo.genderCode.trim(),
      zipCode: basicInfo.zipCode.trim(),
      address1: basicInfo.address1.trim(),
      address2: basicInfo.address2.trim(),
      status: basicInfo.status.trim() || "ACTIVE",


      
      licenseNo: (form.licenseNo ?? "").trim(),
      nurseType: "NURSE",
      shiftType: (form.shiftType ?? "").trim(),
      nurseFileUrl: (form.nurseFileUrl ?? "").trim(),
      extNo: (form.extNo ?? "").trim(),
      education: (form.education ?? "").trim(),
      careerDetail: (form.careerDetail ?? "").trim(),
    };

    dispatch(createNurseRequest(request));
  };


    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



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
            <Typography variant="h6" fontWeight={800}>간호사 생성</Typography>
            <Typography variant="body2" color="text.secondary">
              공통 정보 + 간호사 정보를 마지막에 한 번에 등록합니다.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <TextField
              label="부서 ID"
              value={basicInfo?.deptId ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText="이전 단계 공통 입력폼에서 작성한 값입니다."
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="직원번호(staffId)"
              value={basicInfo?.staffId ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText="최종 등록 시 공통 + 간호사 정보와 함께 전송됩니다."
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
 
           <TextField
              label="직책 ID"
              value={basicInfo?.positionId ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText="이전 단계 공통 입력폼에서 작성한 값입니다."
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
   

            <TextField
              label="이름"
              value={basicInfo?.name ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField label="간호사 면허 *" name="licenseNo" value={form.licenseNo ?? ""} onChange={handleChange} fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="근무 형태 *" name="shiftType" value={form.shiftType ?? ""} onChange={handleChange} fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="사내번호" name="extNo" value={form.extNo ?? ""} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="학력" name="education" value={form.education ?? ""} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="경력 상세" name="careerDetail" value={form.careerDetail ?? ""} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button variant="outlined" onClick={() => router.replace("/staff/nurse/basiclnfocreate")} disabled={loading} fullWidth>
                이전으로
              </Button>

              <Button type="submit" variant="contained" disabled={loading || !basicInfo} sx={{ bgcolor: "#2b5aa9" }} fullWidth>
                {loading ? <CircularProgress size={18} /> : "가입완료"}
              </Button>
            </Stack>

            {createSuccess && <Alert severity="success">등록이 완료되었습니다.</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NurseCreatePage;
