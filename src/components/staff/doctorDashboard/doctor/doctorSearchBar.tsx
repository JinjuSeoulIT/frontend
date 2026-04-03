// import { useState, type FormEvent } from "react";
// import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
// import type { DoctorSearchType, SearchDoctorPayload } from "@/features/employee/doctor/doctortypes";
// import { useDispatch } from "react-redux";
// import { searchDoctorListRequest } from "@/features/employee/doctor/doctorSlice";



// export default function DoctorSearchBar({ onSearch }: SearchDoctorPayload) {

//   const dispatch = useDispatch();
//   const [search, setSearch] = useState("");
//   const [searchType, setSearchType] = useState<DoctorSearchType>("all");


//   const handleSubmit = (event: FormEvent) => {
//     event.preventDefault();

// const doctorReq: SearchDoctorPayload = {
// search,
// searchType,
// onSearch, //부모한테 받음
// }
  
//   dispatch(searchDoctorListRequest(doctorReq));
  
//   };

//   return (
//     <Box component="form" onSubmit={handleSubmit}>
//       <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
//         <TextField
//           select
//           label="검색조건"
//           value={searchType}
//           onChange={(event) => setSearchType(event.target.value as DoctorSearchType)}
//           sx={{ minWidth: 180 }}
//         >
//           <MenuItem value="all">전체</MenuItem>
//           <MenuItem value="name">이름</MenuItem>
//           <MenuItem value="specialty">진료과</MenuItem>
//           <MenuItem value="staffId">사원번호</MenuItem>
//           <MenuItem value="dept">부서</MenuItem>
//         </TextField>

//         <TextField
//           label="검색어"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           fullWidth
//         />

//         <Button type="submit" variant="contained">
//           검색
//         </Button>
//       </Stack>
//     </Box>
//   );
// }