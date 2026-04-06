"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import {
  formatPhoneKR,
  sanitizeBirthDate,
  sanitizeGenderCode,
} from "@/components/staff/BasiclnfoDashboard/BasiclnfoUtils";
import {
  initialstaffCreateForm,
  type staffCreateRequest,
} from "@/features/staff/Basiclnfo/BasiclnfoType";
import { BasiclnfoDraft } from "@/features/staff/Basiclnfo/BasiclnfoSlict";
import { RootState } from "@/store/rootReducer";
import { departmentListRequest } from "@/features/staff/department/departmentSlisct";
import { positionListRequest } from "@/features/staff/position/positionSlice";

export default function ReceptionBasicInfoCreate() {
  const dispatch = useDispatch();
  const router = useRouter();
  const addressDetailRef = useRef<HTMLInputElement | null>(null);


  
  //⭐부서 셀렉터값
  const { Departmentlist } = useSelector((state: RootState) => state.department);
    
  //⭐직책 셀렉터값
  const { positionList   } = useSelector((state: RootState) => state.position);
  

  const [form, setForm] = useState<staffCreateRequest>(initialstaffCreateForm);





//재요청 X

useEffect(() => {
  if (Departmentlist.length === 0) {
    dispatch(departmentListRequest());
  }

  if (positionList.length === 0) {
    dispatch(positionListRequest());
  }
}, [dispatch, Departmentlist.length, positionList.length]);


  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "birthDate") {
      setForm((prev) => ({ ...prev, birthDate: sanitizeBirthDate(value) }));
      return;
    }

    if (name === "genderCode") {
      setForm((prev) => ({ ...prev, genderCode: sanitizeGenderCode(value) }));
      return;
    }

    if (name === "phone") {
      setForm((prev) => ({ ...prev, phone: formatPhoneKR(value) }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openPostcode = () => {
    const daum = (window as any).daum;
    if (!daum?.Postcode) {
      alert("주소 검색 모듈을 불러오는 중입니다.");
      return;
    }

    new daum.Postcode({
      oncomplete: (data: any) => {
        const address = data.roadAddress || data.jibunAddress || "";

        setForm((prev) => ({
          ...prev,
          zipCode: data.zonecode ?? "",
          address1: address,
        }));

        setTimeout(() => addressDetailRef.current?.focus(), 0);
      },
    }).open();
  };

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const basicInfo: staffCreateRequest = {
      staffId: Number(form.staffId),
      deptId: form.deptId.trim(),
      positionId: form.positionId.trim(),

      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate.trim(),
      genderCode: form.genderCode.trim(),
      zipCode: form.zipCode.trim(),
      address1: form.address1.trim(),
      address2: form.address2.trim(),
      status: form.status.trim() || "ACTIVE",
    };

    dispatch(BasiclnfoDraft(basicInfo));
    router.push("/staff/reception/create");
  };

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />

        <Box sx={{ maxWidth: 820, mx: "auto", px: 2, py: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            원무 공통 정보 작성
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            공통 직원 정보를 먼저 저장한 뒤, 다음 단계에서 원무 상세 정보를 등록합니다.
          </Typography>

          <Box component="form" onSubmit={handleNext}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="직원번호" name="staffId" 
                value={form.staffId} onChange={handleChange} fullWidth required />

              

      <TextField
      select
      label="부서"
      name="deptId"
      value={form.deptId}
      onChange={handleChange}
      fullWidth
      required>
      <MenuItem value="">부서를 선택하세요</MenuItem>
      {Departmentlist.map((dept) => (
      <MenuItem key={dept.deptId} value={dept.deptId}>
      {dept.deptName} ({dept.deptId})
      </MenuItem>
      ))}
      </TextField>

          <TextField
      select
      label="직책"
      name="positionId"
      value={form.positionId}
      onChange={handleChange}
      fullWidth
      required>
      <MenuItem value="">직책를 선택하세요</MenuItem>
      {positionList.map((position) => (
      <MenuItem key={position.positionId} value={position.positionId}>
      {position.positionName} ({position.positionId})
      </MenuItem>
      ))}
      </TextField>
              </Stack>




              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="이름" name="name" value={form.name} onChange={handleChange} fullWidth required />
                <TextField label="연락처" name="phone" value={form.phone} onChange={handleChange} fullWidth />
              </Stack>

              <TextField label="이메일" name="email" value={form.email} onChange={handleChange} fullWidth />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="생년월일(주민 앞 6자리)"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  fullWidth
                  placeholder="예: 900101"
                  inputProps={{ maxLength: 6, inputMode: "numeric" }}
                  autoComplete="off"
                />

                <TextField
                  label="성별코드(1자리)"
                  name="genderCode"
                  value={form.genderCode}
                  onChange={handleChange}
                  fullWidth
                  placeholder="예: 1"
                  inputProps={{ maxLength: 1, inputMode: "numeric" }}
                  autoComplete="off"
                  helperText="2000년생 미만 남1/여2, 2000년생 이상 남3/여4"
                />
              </Stack>

              <TextField select label="상태" name="status" value={form.status} onChange={handleChange} fullWidth>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
                <TextField label="우편번호" name="zipCode" value={form.zipCode} fullWidth slotProps={{ input: { readOnly: true } }} />
                <Button type="button" variant="contained" onClick={openPostcode} sx={{ minWidth: 140 }}>
                  주소 검색
                </Button>
              </Stack>

              <TextField label="주소1" name="address1" value={form.address1} fullWidth slotProps={{ input: { readOnly: true } }} />

              <TextField
                inputRef={addressDetailRef}
                label="주소2"
                name="address2"
                value={form.address2}
                onChange={handleChange}
                fullWidth
              />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => router.push("/staff/reception/list")}>목록</Button>
                <Button type="submit" variant="contained">작성완료</Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
