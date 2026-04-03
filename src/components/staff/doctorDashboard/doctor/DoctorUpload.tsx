"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/rootReducer";
import { resetSuccessEnd, uploadDoctorFileRequest } from "@/features/staff/doctor/doctorSlice";
import type { AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { DoctorIdNumber } from "@/features/staff/doctor/doctortypes";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from "@mui/material";

//// 의사
export default function DoctorUpload({ staffId }: DoctorIdNumber) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { uploadLoading, uploadSuccess, error } = useSelector((state: RootState) => state.doctor);

  // 업로드 스테이트 값
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 미리보기 스테이트 값 랜더링용
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // 미리보기
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!uploadSuccess) return;

    setSelectedFile(null);
    setPreviewUrl("");

    dispatch(resetSuccessEnd());
  }, [uploadSuccess, dispatch]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    // ✅ 업로드 직전 한 번 더 숫자 검사
    if (!Number.isFinite(staffId)) {
      alert("유효하지 않은 staffId 입니다.");
      return;
    }

    dispatch(uploadDoctorFileRequest({ staffId, file: selectedFile }));
  };

  // 성공하면
  useEffect(() => {
    if (!uploadSuccess) return;
    router.replace("/staff/doctor/list");

    dispatch(resetSuccessEnd());
  }, [uploadSuccess, router, dispatch]);

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
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>의사 프로필 이미지 업로드</Typography>
          </Stack>
          <Divider />

          <Stack spacing={2}>
            <Box
              sx={{
                width: 250,
                height: 250,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid #dbe5f5",
                bgcolor: "#f4f7fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
              }}
            >
              {previewUrl ? (
                <Box component="img" src={previewUrl} alt="의사 프로필 미리보기" sx={{ width: "80%", height: "80%", objectFit: "cover", justifyContent: "flex-end" }} />
              ) : (
                <Typography variant="body2" color="text.secondary" fontWeight={600}>이미지 없음</Typography>
              )}
            </Box>

            <Button variant="outlined" component="label">
              파일 선택
              <input hidden type="file" accept="image/*" onChange={handleFileChange} />
            </Button>

            <Button variant="contained" onClick={handleUpload} disabled={!selectedFile || uploadLoading}>
              {uploadLoading ? <CircularProgress size={18} /> : "업로드"}
            </Button>

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
