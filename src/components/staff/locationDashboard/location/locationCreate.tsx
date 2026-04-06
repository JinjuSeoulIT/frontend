"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  departmentListRequest,
} from "@/features/staff/department/departmentSlisct";

import { initialLocationCreateForm, LocationCreateRequest } from "@/features/staff/location/locationtypes";
import { locationCreateRequest, resetLocationState } from "@/features/staff/location/locationSlice";





  const LocationCreate = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error, createSuccess } = useSelector((state: RootState) => state.location);

  //부서 셀렉터값
  const { Departmentlist } = useSelector((state: RootState) => state.department);


  const [form, setForm] = useState<LocationCreateRequest>(initialLocationCreateForm);


  //부서목록조회 값 가져오기   부서 select 옵션 채우기용 (드롭다운용)
  useEffect(() => {dispatch(departmentListRequest());}, [dispatch]);
  


  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const locationReq: LocationCreateRequest= {
        deptId: form.deptId.trim(),
        buildingName: form.buildingName.trim(),
        floorNo: form.floorNo.trim(),
        roomNo: form.roomNo.trim(),
        dayPhone: form.dayPhone?.trim() || "",
        nightPhone: form.nightPhone?.trim() || "",
        mainPhone: form.mainPhone?.trim() || "",
        locationDesc: form.locationDesc?.trim() || "",
     
    }
     dispatch(locationCreateRequest(locationReq)
    );
    };

    

  const handleChange =(event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name] :value,
      
    }));
    };

   
       useEffect(() => {
    if (createSuccess) {
      alert("부서 등록이 완료되었습니다.");
      dispatch(resetLocationState());
      router.push("/staff/location/list");
    }
    }, [createSuccess, dispatch, router]);




  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        배치 등록
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        부서와 장소를 함께 등록합니다.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
         






          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            
            <TextField
              select
              label="부서 *"
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
              label="본관 *"
              name="buildingName"
              value={form?.buildingName ??""}
              onChange={handleChange}
              fullWidth
              required
            />
          </Stack>

          <TextField
            label="층 *"
            name="floorNo"
            value={form.floorNo}
            onChange={handleChange}
            fullWidth
            required
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="호실"
              name="roomNo"
              value={form.roomNo}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="주간 대표 번호"
              name="dayPhone"
              value={form.dayPhone}
              onChange={handleChange}
              fullWidth
            
            />
           
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="야간 전화 번호"
              name="nightPhone"
              value={form.nightPhone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="대표 전화 번호"
              name="mainPhone"
              value={form.mainPhone}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <TextField
            label="위치 설명"
            name="locationDesc"
            value={form.locationDesc}
            onChange={handleChange}
            fullWidth
       
          />
          
          

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push("/staff/department/list")}>
              취소
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "등록 중..." : "등록"}
            </Button>
          </Stack>
        </Stack>
         {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </Paper>
  );
};

export default LocationCreate;
