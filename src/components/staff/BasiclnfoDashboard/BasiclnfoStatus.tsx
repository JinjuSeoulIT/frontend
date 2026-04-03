"use client";

//리스트 상태바 
import { Box } from "@mui/material";

type StatusCode = "ACTIVE" | "INACTIVE" | "LEAVE" | "RETIRE" | string | null | undefined;

type Props = {
  status?: StatusCode;
};







const getStatusLabel = (status?: StatusCode) => {
  switch (status) {
    case "ACTIVE":
      return "근무중";
    case "INACTIVE":
      return "비활성";
    case "LEAVE":
      return "휴직";
    case "RETIRE":
      return "퇴직";
    default:
      return "미정";
  }
};



const getStatusStyle = (status?: StatusCode) => {
  switch (status) {
    case "ACTIVE":
      return {
        color: "#1b5e20",
        backgroundColor: "#edf7ee",
        border: "1px solid #b7dfba",
      };
    case "INACTIVE":
      return {
        color: "#555555",
        backgroundColor: "#f3f4f6",
        border: "1px solid #d6d9de",
      };
    case "LEAVE":
      return {
        color: "#255cc9",
        backgroundColor: "#f5f5f5",
        border: "1px solid #d1d5db",
      };
    case "RETIRE":
      return {
        color: "#b42318",
        backgroundColor: "#fef3f2",
        border: "1px solid #f3b5ae",
      };
    default:
      return {
        color: "#4b5563",
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
      };
  }
};

const StatusBadge = ({ status }: Props) => {
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
  borderRadius: "999px",
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: "-0.01em",
  boxSizing: "border-box",
  boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
  ...getStatusStyle(status),
      }}
    >
      {getStatusLabel(status)}
    </Box>
  );
};

export default StatusBadge;