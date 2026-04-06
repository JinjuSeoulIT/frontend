"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from "@mui/material";

import { DetailNurseRequest, resetSuccessEnd, updateNursedRequest } from "@/features/staff/nurse/nurseSlice";
import { initialNurseUpdateForm,  NurseIdNumber,  NurseUpdateRequest } from "@/features/staff/nurse/nurseTypes";

const NurseUpdate = ({ staffId }: NurseIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { nurseDetail, updateSuccess, loading, error } = useSelector((state: RootState) => state.nurse);
  const [form, setForm] = useState<NurseUpdateRequest>(initialNurseUpdateForm);

    
    useEffect(() => {
    if (!staffId) return;
    dispatch(DetailNurseRequest( staffId ));
  }, [dispatch, staffId]);


    useEffect(() => {
    if (!nurseDetail) return;
    setForm({
      staffId: nurseDetail.staffId ?? staffId,
      licenseNo: nurseDetail.licenseNo ?? "",
      shiftType: nurseDetail.shiftType ?? "",
      nurseFileUrl: nurseDetail.nurseFileUrl ?? null,
      extNo: nurseDetail.extNo ?? "",
      education: nurseDetail.education ?? "",
      careerDetail: nurseDetail.careerDetail ?? "",
    });
  }, [nurseDetail, staffId]);



      const handleSubmit = (event: FormEvent) => {

      event.preventDefault();

      const nurseReq: NurseUpdateRequest = {

        
      staffId: Number(String(form.staffId ?? staffId).trim()),
      licenseNo: (form.licenseNo ?? "").trim(),
      shiftType: (form.shiftType ?? "").trim(),
      nurseFileUrl: form.nurseFileUrl ?? null,
      extNo: (form.extNo ?? "").trim(),
      education: (form.education ?? "").trim(),
      careerDetail: (form.careerDetail ?? "").trim(),
    };
    dispatch(updateNursedRequest({ staffId, nurseReq }));
  };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


    useEffect(() => {
    if (!updateSuccess) return;
    router.replace("/staff/nurse/list");
    dispatch(resetSuccessEnd());
  }, [updateSuccess, router, dispatch]);



  return (
      <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, 
      border: "1px solid #dbe5f5", 
      bgcolor: "white", 
      boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)" }}>
        
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>간호사 상세정보 수정</Typography>
            <Typography color="text.secondary" fontWeight={600}>staffId 기준으로 간호사 상세를 수정합니다.</Typography>
          </Stack>
                  
          <Divider />

          <Stack spacing={2}>
            <TextField label="직원번호(staffId) *"
            name="staffId" value={form.staffId ?? ""} 
            onChange={handleChange} 
            fullWidth required InputProps={{ readOnly: true }} sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="간호사 면허 *" 
            name="licenseNo" value={form.licenseNo ?? ""} 
            onChange={handleChange} 
            fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="근무 형태 *"
            name="shiftType" value={form.shiftType ?? ""} 
            onChange={handleChange} fullWidth required 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
          
            <TextField label="사내번호" name="extNo" value={form.extNo ?? ""}
            onChange={handleChange} fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
          
            <TextField label="학력" name="education" value={form.education ?? ""}
            onChange={handleChange} fullWidth 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="경력 상세" name="careerDetail" value={form.careerDetail ?? ""} 
            onChange={handleChange} fullWidth 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />





            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              
            <Button variant="outlined" onClick={() => router.replace("/staff/nurse/list")} disabled={loading} 
            fullWidth>목록으로</Button>
              
            <Button type="submit" variant="contained" sx={{ bgcolor: "#2b5aa9" }} 
            fullWidth>{loading ? <CircularProgress size={18} /> : "수정 완료"}</Button>
          
            </Stack>

          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
        
      </Paper>
      
    </Box>
  );
};

export default NurseUpdate;
