"use client";

import { Box } from "@mui/material";

type ReceptionType = "RECEPTION" | string | null | undefined;

type Props = {
  receptionType?: ReceptionType;
};

const getReceptionLabel = (receptionType?: ReceptionType) => {
  switch (receptionType) {
    case "RECEPTION":
      return "원무";
    default:
      return receptionType ?? "-";
  }
};

const getReceptionTypeStyle = (receptionType?: ReceptionType) => {
  switch (receptionType) {
    case "RECEPTION":
      return {
        color: "#c77700",
        backgroundColor: "#fff7e6",
        border: "1px solid #f0b35c",
      };
    default:
      return {
        color: "#64748b",
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
      };
  }
};

const ReceptionFont = ({ receptionType }: Props) => {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 72,
        height: 30,
        px: 1.5,
        fontSize: 12,
        fontWeight: 700,
        borderRadius: 999,
        ...getReceptionTypeStyle(receptionType),
      }}
    >
      {getReceptionLabel(receptionType)}
    </Box>
  );
};

export default ReceptionFont;
