"use client";

import { useEffect, useState, ChangeEvent, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from "@mui/material";

import { DetailDoctorRequest, updateDoctorRequest, resetSuccessEnd } from "@/features/staff/doctor/doctorSlice";
import { DoctorIdNumber, DoctorUpdateRequest, initialDoctorUpdateForm } from "@/features/staff/doctor/doctortypes";

//// 의사
const DoctorUpdate = ({ staffId }: DoctorIdNumber) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { doctorDetail, updateSuccess, loading, error } = useSelector((state: RootState) => state.doctor);
  const [form, setForm] = useState<DoctorUpdateRequest>(initialDoctorUpdateForm);

  // 상세조회 데이터를 form 초기값으로 딱 1번만 세팅
  const loadedRef = useRef(false);

  useEffect(() => {
    // ✅ 수정 화면도 숫자 staffId가 준비된 뒤에만 상세조회
    if (!Number.isFinite(staffId)) return;

    dispatch(DetailDoctorRequest(staffId));
  }, [dispatch, staffId]);

  useEffect(() => {
    if (!doctorDetail || loadedRef.current) return;

    setForm({
      staffId:        doctorDetail.staffId,
      licenseNo:      doctorDetail.licenseNo ?? "",
      specialtyId:    doctorDetail.specialtyId ?? "",
      doctorFileUrl:  doctorDetail.doctorFileUrl ?? null,
      extNo:          doctorDetail.extNo ?? "",
      profileSummary: doctorDetail.profileSummary ?? "",
      education:      doctorDetail.education ?? "",
      careerDetail:   doctorDetail.careerDetail ?? "",
    });

    loadedRef.current = true;
  }, [doctorDetail, staffId]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // ✅ submit 직전에도 staffId 숫자 방어
    if (!Number.isFinite(staffId)) {
      alert("유효하지 않은 staffId 입니다.");
      return;
    }

    const doctorReq: DoctorUpdateRequest = {
      staffId: form.staffId,
      licenseNo: (form.licenseNo ?? "").trim(),
      specialtyId: String(form.specialtyId ?? "").trim(),
      doctorFileUrl: form.doctorFileUrl ?? null,
      extNo: (form.extNo ?? "").trim(),
      profileSummary: (form.profileSummary ?? "").trim(),
      education: (form.education ?? "").trim(),
      careerDetail: (form.careerDetail ?? "").trim(),
    };

    dispatch(updateDoctorRequest({ staffId, doctorReq }));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!updateSuccess) return;
    router.replace("/staff/doctor/list");
    dispatch(resetSuccessEnd());
  }, [updateSuccess, router, dispatch]);

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #dbe5f5", bgcolor: "white", boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)" }}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>의사 상세정보 수정</Typography>
            <Typography color="text.secondary" fontWeight={600}>staffId 기준으로 의사 상세를 수정합니다.</Typography>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <TextField label="의료진 번호 *" name="staffId" value={form.staffId} onChange={handleChange} fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="의사 면허 *" name="licenseNo" value={form.licenseNo ?? ""} onChange={handleChange} fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="전문 과목 *" name="specialtyId" value={form.specialtyId ?? ""} onChange={handleChange} fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="사내번호" name="extNo" value={form.extNo ?? ""} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="한줄 소개" name="profileSummary" value={form.profileSummary ?? ""} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="학력" name="education" value={form.education ?? ""} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="경력 상세" name="careerDetail" value={form.careerDetail ?? ""} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button variant="outlined" onClick={() => router.replace("/staff/doctor/list")} disabled={loading} fullWidth>뒤로가기</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: "#2b5aa9" }} fullWidth>{loading ? <CircularProgress size={18} /> : "상세정보 수정 완료"}</Button>
            </Stack>
          </Stack>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
      </Paper>
    </Box>
  );
};

export default DoctorUpdate;
