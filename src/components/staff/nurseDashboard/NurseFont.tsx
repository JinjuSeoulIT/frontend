import { Box } from "@mui/material";



type nurseType  =  "NURSE"    |  string | null | undefined;



type Nurse = {
nurseType?: nurseType;

};



const getNurseLabel = (nurseType?: nurseType) => {
switch (nurseType) {
    case "NURSE":
    return "간호사";

}
};

const getNurseStyle = (nurseType?: nurseType) => {
switch (nurseType) {
    case "NURSE":
    return {
        color: "#db15d1",
        backgroundColor: "#edf7ee",
        border: "1px solid #b7dfba",
    };

}
};


const NurseStyle = ({ nurseType }: Nurse) => {
  return (
    <Box
      component="span"
    sx={{display: "inline-flex",alignItems: "center",justifyContent: "center",
        minWidth: 72,
        height: 30,
        
        fontWeight: 700, //글자 굵기
        px: 1.5,
        fontSize: 12,
...getNurseStyle(nurseType),
    }}>{getNurseLabel(nurseType)}
    </Box>


  );
};

export default NurseStyle;



