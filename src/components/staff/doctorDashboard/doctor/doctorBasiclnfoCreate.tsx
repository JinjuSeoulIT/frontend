"use client";


//일반 입력폼 컴포넌트
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  formatPhoneKR,
  sanitizeBirthDate,
  sanitizeGenderCode,
} from "@/components/staff/BasiclnfoDashboard/BasiclnfoUtils";
import { initialstaffCreateForm, staffCreateRequest } from "@/features/staff/Basiclnfo/BasiclnfoType";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@/store/rootReducer";
import { departmentListRequest } from "@/features/staff/department/departmentSlisct";
import { positionListRequest } from "@/features/staff/position/positionSlice";
import { BasiclnfoDraft } from "@/features/staff/Basiclnfo/BasiclnfoSlict";





//의사
export default function DoctorBasicInfoCreate() {

  const dispatch = useDispatch();
  const router = useRouter();

  const address = useRef<HTMLInputElement | null>(null);

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

    //생년 월일 앞모듈 (공통) 
    if (name === "birthDate") {
      setForm((prev) => ({
        ...prev,
        birthDate: sanitizeBirthDate(value),
      }));
      return;
    }
    //생년 월일 뒤모듈 (공통)
    if (name === "genderCode") {
      setForm((prev) => ({
        ...prev,
        genderCode: sanitizeGenderCode(value),
      }));
      return;
    }
    //전화 모듈 
    if (name === "phone") {
      setForm((prev) => ({
        ...prev,
        phone: formatPhoneKR(value),
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };




  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const doctorBasiclnfo: staffCreateRequest = {
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
    // 임시저장
    dispatch(BasiclnfoDraft(doctorBasiclnfo));

    router.push("/staff/doctor/create"); //그후 의사쪽으로 라우팅
  };






   //주소 모듈
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

        setTimeout(() => address.current?.focus(), 0);
      },
    }).open();
  };



  return (


    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />

      <Box sx={{ maxWidth: 820, mx: "auto", px: 2, py: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            의사 공통 정보 작성
          </Typography>

          <Box component="form" onSubmit={handleNext}>

            
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="직원번호"
                  name="staffId"
                  value={form.staffId}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              
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
                <TextField
                  label="이름"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="연락처"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                />
              </Stack>

              <TextField
                label="이메일"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />

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

              <TextField
                select
                label="상태"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>

              <div>
                <TextField
                  label="우편번호"
                  name="zipCode"
                  value={form.zipCode}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                />
                <Button type="button" variant="contained" onClick={openPostcode}>
                  🔍 주소 검색
                </Button>
              </div>

              <TextField
                label="주소1"
                name="address1"
                value={form.address1}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />

              <TextField
                inputRef={address}
                label="주소2"
                name="address2"
                value={form.address2}
                onChange={handleChange}
                fullWidth
              />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => router.push("/staff/doctor/list")}
                >
                  목록
                </Button>

                <Button type="submit" variant="contained">
                  작성완료
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </>
  );
}