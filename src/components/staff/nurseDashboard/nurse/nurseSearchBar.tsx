// "use client";

// import { useState, type FormEvent } from "react";
// import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
// import type { NurseSearchType } from "@/features/employee/nurse/nurseTypes";

// type Props = {
//   onSearch: (search: string, searchType: NurseSearchType) => void;
// };

// export default function NurseSearchBar({ onSearch }: Props) {
//   const [search, setSearch] = useState("");
//   const [searchType, setSearchType] = useState<NurseSearchType>("all");

//   const handleSubmit = (event: FormEvent) => {
//     event.preventDefault();
//     onSearch(search, searchType);
//   };

//   return (
//     <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
//       <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
//         <TextField
//           select
//           label="검색조건"
//           value={searchType}
//           onChange={(e) => setSearchType(e.target.value as NurseSearchType)}
//           sx={{ minWidth: 180 }}
//         >
//           <MenuItem value="all">전체</MenuItem>
//           <MenuItem value="name">이름</MenuItem>
//           <MenuItem value="staffId">사원번호</MenuItem>
//           <MenuItem value="dept">부서</MenuItem>
//           <MenuItem value="shiftType">근무타입</MenuItem>
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
