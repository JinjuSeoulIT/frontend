"use client";

import { Box, Stack, TextField } from "@mui/material";

export const MedicalSearchBar = () => {
  return (
    <Box sx={{ mb: 2 }}>
      <TextField fullWidth placeholder="메지컬 검색" />
    </Box>
  );
};

export const SpecialtySearchBar = () => {
  return (
    <Box sx={{ mb: 2 }}>
      <TextField fullWidth placeholder="스페셜티 검색" />
    </Box>
  );
};

const MedicalSpecialtySearchBar = () => {
  return (
    <Stack spacing={2}>
      <MedicalSearchBar />
      <SpecialtySearchBar />
    </Stack>
  );
};

export default MedicalSpecialtySearchBar;
