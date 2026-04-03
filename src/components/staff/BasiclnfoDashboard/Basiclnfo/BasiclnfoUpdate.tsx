"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import Script from "next/script";
import type { RootState } from "@/store/rootReducer";
import { DetailStaffRequest, updateStaffRequest } from "@/features/staff/Basiclnfo/BasiclnfoSlict";
import { initialstaffUpdateForm, staffIdNumber, staffResponse, type staffUpdateRequest } from "@/features/staff/Basiclnfo/BasiclnfoType";
import { resetSuccessEnd } from "@/features/staff/doctor/doctorSlice";
import { departmentListRequest } from "@/features/staff/department/departmentSlisct";
import { positionListRequest } from "@/features/staff/position/positionSlice";


//공통
const BasicInfoUpdate = ({ staffId }: staffIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const address = useRef<HTMLInputElement | null>(null);

  const { StaffDetail, updateSuccess, loading, error } = useSelector((state: RootState) => state.staff);

  const [form, setForm] = useState<staffUpdateRequest>(initialstaffUpdateForm);
  //상세조회 데이터가져올때  form 초기값 세팅을 딱 1번
  const loadedRef = useRef(false);


  //부서데이터 값
  const { Departmentlist } = useSelector((state: RootState) => state.department);

  //⭐직책 셀렉터값
  const { positionList   } = useSelector((state: RootState) => state.position);


  
  //맵 방식 (Map)
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



   //상세조회
    useEffect(() => {
    dispatch(departmentListRequest());
    dispatch(positionListRequest());
    if (staffId) 
      
      
    {
      dispatch(DetailStaffRequest(staffId));
      dispatch(resetSuccessEnd());
    }
    }, [dispatch, staffId]);

    useEffect(() => {
    if (!StaffDetail || loadedRef.current) return;

    setForm({
      staffId: StaffDetail.staffId ?? "",
      deptId: StaffDetail.deptId ?? "",
      positionId: StaffDetail.positionId ?? "",

      name: StaffDetail.name ?? "",
      phone: StaffDetail.phone ?? "",
      email: StaffDetail.email ?? "",
      birthDate: StaffDetail.birthDate ?? "",
      genderCode: StaffDetail.genderCode ?? "",
      zipCode: StaffDetail.zipCode ?? "",
      address1: StaffDetail.address1 ?? "",
      address2: StaffDetail.address2 ?? "",
      status: StaffDetail.status ?? "ACTIVE",
    });


    loadedRef.current = true;

  }, [StaffDetail]);





  //입력값

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const staffReq: staffUpdateRequest = {
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

    }
       dispatch(updateStaffRequest({staffId, staffReq}));
    };

    useEffect(() => {
    if (!updateSuccess || !StaffDetail) return;

    handleDetail(StaffDetail);

    dispatch(resetSuccessEnd());
    }, [dispatch, StaffDetail, updateSuccess]);



    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    };
  




    //분기점 라우팅
    const handleDetail = (staff: staffResponse) => {
    if (staff.doctorType) return router.push(`/staff/doctor/${staff.staffId}/detail`);

    if (staff.nurseType) return router.push(`/staff/nurse/${staff.staffId}/detail`);

    if (staff.receptionType) return router.push(`/staff/reception/${staff.staffId}/detail`);

    return router.push(`/staff/Basiclnfo/${staff.staffId}/detail`);
    };





    //주소
    const openPostcode = () => {
    const daum = (window as any).daum;
    if (!daum?.Postcode) {
      alert("주소 검색 모듈을 불러오는 중입니다.");
      return;
    }

    new daum.Postcode({
      oncomplete: (data: any) => {
        const selectedAddress = data.roadAddress || data.jibunAddress || "";
        setForm((prev) => ({ ...prev, zipCode: data.zonecode ?? "", address1: selectedAddress }));
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
    직원 공통 정보 수정
    </Typography>

          <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>


            {/* 1행: 부서 + 직책 */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              

              {/*부서*/}
              <TextField
                select
                label="부서"
                name="deptId"
                value={form.deptId}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="">부서를 선택하세요</MenuItem>
                {Departmentlist.map((dept) => (
                <MenuItem key={dept.deptId} value={dept.deptId}>
                {dept.deptName} ({dept.deptId})
                </MenuItem>
                ))}
              </TextField>

              {/*직책*/}
              <TextField
                select
                label="직책"
                name="positionId"
                value={form.positionId}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="">직책을 선택하세요</MenuItem>
                {positionList.map((pos) => (
                 <MenuItem key={pos.positionId} value={pos.positionId}>
                {pos.positionName} ({pos.positionId})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>



            {selectedDepartment && (
              <Alert severity="info">
                선택 부서: {selectedDepartment.deptName}
              </Alert>
            )}

            {selectedPosition && (
              <Alert severity="info">
                선택 직책: {selectedPosition.positionName}
              </Alert>
            )}




            {/* 2행: 이름 + 연락처 */}
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


            {/* 3행: 이메일 */}
            <TextField
              label="이메일"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
            />

            {/* 4행: 생년월일 + 성별코드 */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="생년월일"
                name="birthDate"
                value={form.birthDate}
                onChange={handleChange}
                fullWidth
                placeholder="YYMMDD"
              />

              <TextField
                label="성별코드"
                name="genderCode"
                value={form.genderCode}
                onChange={handleChange}
                fullWidth
              />
            </Stack>

            {/* 5행: 상태 */}
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

            {/* 6행: 우편번호 + 주소검색 버튼 */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="우편번호"
                name="zipCode"
                value={form.zipCode ?? ""}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />

              <Button
                type="button"
                variant="contained"
                onClick={openPostcode}
                sx={{ minWidth: 140 }}
              >
                🔍 주소 검색
              </Button>
            </Stack>

            {/* 7행: 주소1 */}
            <TextField
              label="주소1"
              name="address1"
              value={form.address1}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />

            {/* 8행: 주소2 */}
            <TextField
              inputRef={address}
              label="주소2"
              name="address2"
              value={form.address2}
              onChange={handleChange}
              fullWidth
            />

              {/* 버튼 */}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => router.replace("/staff/Basiclnfo/list")}
                disabled={loading}
              >
                뒤로
              </Button>

              <Button type="submit" variant="contained" disabled={loading}>
                수정
          </Button>
          </Stack>
          </Stack>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      </Box>
      </>
      );
      }
export default BasicInfoUpdate;
