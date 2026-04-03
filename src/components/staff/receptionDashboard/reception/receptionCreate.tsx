"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, CircularProgress, Divider, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import { createReceptionRequest, resetReceptionSuccessEnd } from "@/features/staff/reception/receptionSlice";
import { initialReceptionCreateForm, type ReceptionCreateRequest } from "@/features/staff/reception/receptionTypes";
import { clearBasicDraft } from "@/features/staff/Basiclnfo/BasiclnfoSlict";

const ReceptionCreate = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, createSuccess } = useSelector((state: RootState) => state.reception);
  
  const basicInfo = useSelector((state: RootState) => state.staff.BasiclnfoCreate);

  const [form, setForm] = useState<ReceptionCreateRequest>(initialReceptionCreateForm);

  useEffect(() => {
    if (!basicInfo) {
      router.replace("/staff/Basiclnfo/list");
    }
  }, [basicInfo, router]);

  useEffect(() => {
    if (!createSuccess) return;

    dispatch(clearBasicDraft());
    dispatch(resetReceptionSuccessEnd());
    router.replace("/staff/reception/list");
  }, [createSuccess, dispatch, router]);



  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!basicInfo) {
      alert("공통 입력 정보가 없습니다.");
      return;
    }

        const request: ReceptionCreateRequest = {

  
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

        
        jobTypeCd: form.jobTypeCd.trim(),
        deskNo: form.deskNo.trim(),
        shiftType: form.shiftType.trim(),
        // 백엔드 ReceptionRequestDTO.startDate 는 LocalDate
        // 날짜를 안 골랐으면 null 로 내려서 Jackson 바인딩 오류를 막는다.
        startDate: (form.startDate ?? "").trim() || null,
        windowArea: form.windowArea.trim(),
        multiTask: form.multiTask.trim() || "불가",
        rmk: form.rmk.trim(),
        receptionType: form.receptionType.trim() || "RECEPTION",
        extNo: form.extNo.trim(),
  }

        dispatch(createReceptionRequest((request)));
  };


  //이렇게하면 드롭다운메뉴에선 실패시에도 값자동갱신
  const handleChange = (
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
  const { name, value } = event.target;
  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
  };



        return (
        <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #dbe5f5", bgcolor: "white", boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)" }}>
        
        
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        


            <Typography variant="h6" fontWeight={800}>원무 생성</Typography>
            <Typography variant="body2" color="text.secondary">
              공통 정보 + 원무 정보를 마지막에 한 번에 등록합니다.
            </Typography>


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
\

            <TextField
              label="이름"
              value={basicInfo?.name ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
          
          
          
          
          
            <TextField label="직군 타입" 
            name="receptionType" 
            value={form.receptionType} 
            fullWidth InputProps={{ readOnly: true }} 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />



            <TextField label="업무 구분 *" 
            name="jobTypeCd" value={form.jobTypeCd} 
            onChange={handleChange} fullWidth required 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />



            <TextField label="창구 번호 *" 
            name="deskNo" value={form.deskNo} 
            onChange={handleChange} fullWidth required 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />



            <TextField
              label="업무 시작일"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField select 
            label="근무 형태 *" 
            name="shiftType" 
            value={form.shiftType} 
            onChange={handleChange} 
            fullWidth 
            required //이거 이벤트처리 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}>
              <MenuItem value="DAY">주간</MenuItem>
              <MenuItem value="NIGHT">야간</MenuItem>
              <MenuItem value="ROTATION">교대</MenuItem>
            </TextField>


            <TextField label="창구 구역" 
            name="windowArea" value={form.windowArea} 
            onChange={handleChange} fullWidth 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />


            <TextField label="사내번호" 
            name="extNo" value={form.extNo} 
            onChange={handleChange} fullWidth 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />


            <TextField select 
            label="파트타임/멀티태스크" 
            name="multiTask" value={form.multiTask} 
            onChange={handleChange} fullWidth 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}>
              <MenuItem value="가능">가능</MenuItem>
              <MenuItem value="불가">불가</MenuItem>
            </TextField>


            <TextField label="비고" 
            name="rmk" value={form.rmk} 
            onChange={handleChange} 
            fullWidth multiline minRows={3} 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />



            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button variant="outlined" onClick={() => router.replace("/staff/reception/basiclnfocreate")} disabled={loading} fullWidth>
            이전으로
            </Button>
              
            <Button type="submit" variant="contained" disabled={loading || !basicInfo} 
            sx={{ bgcolor: "#2b5aa9" }} fullWidth>
            {loading ? <CircularProgress size={18} /> : "가입완료"}
            </Button>
          


            {createSuccess && <Alert severity="success">등록이 완료되었습니다.</Alert>}
            
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          
            </Stack>
      </Paper>
    </Box>
  );
};

export default ReceptionCreate;
