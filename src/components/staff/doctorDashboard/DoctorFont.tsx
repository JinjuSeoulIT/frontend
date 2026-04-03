"use client";

import { Box } from "@mui/material";





type doctorType =  "DOCTOR"   |  string | null | undefined;

type Doctor = {

doctorType?: doctorType;
};


const getDoctorLabel = (doctorType?: doctorType) => {
switch (doctorType) {
    case "DOCTOR":
    return "의사";

}
};



const getDoctorStyle = (doctorType?: doctorType) => {
switch (doctorType) {
    case "DOCTOR":
    return {
        color: "#1815db",
        backgroundColor: "#edf7ee",
        border: "1px solid #b7dfba",
    };
}
};







const doctorFont = ({ doctorType }: Doctor) => {
  return (
    <Box
      component="span"
    sx={{display: "inline-flex",alignItems: "center",justifyContent: "center",
        minWidth: 72,
        height: 30,
        px: 1.5,
        fontSize: 12,
        fontWeight: 700, //글자 굵기
...getDoctorStyle(doctorType),
    }}>{getDoctorLabel(doctorType)}
    </Box>


  );
};










export default doctorFont;