"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import type { PatientSummary } from "@/features/staff/staff.types";



// export type PatientSummary = {
//   total: number;
//   waiting: number;
//   treating: number;
//   done: number;
// };
type Props = {
  State: PatientSummary;
};

//환자 상태 처리

const MedicalSummaryCards = ({ State }: Props) => {
  const cards = [
    { title: "전체 환자", value: State.total },    //WAITING
    { title: "대기 환자", value: State.waiting },
    { title: "진료중",    value: State.treating },
    { title: "진료 완료", value: State.done },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr",
        },
        gap: 2,
        mb: 3,
      }}
    >
      {cards.map((card) => (
        <Card key={card.title} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {card.title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {card.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default MedicalSummaryCards;