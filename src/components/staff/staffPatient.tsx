"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import type { PatientItem } from "@/features/staff/staff.types";

type Props = {
  patients: PatientItem[];
};

const MedicalPatientPanel = ({ patients }: Props) => {
  const router = useRouter();

  return (
    <Card sx={{ borderRadius: 3, minHeight: 320 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          환자 목록
        </Typography>

        <Divider sx={{ mb: 2 }} />
        //환자가 0명이면 처리
        {patients.length === 0 ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              표시할 환자가 없습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              환자 데이터가 연결되면 이 영역에 표시됩니다.
            </Typography>
          </Box>
        ) : (

          //환자용 리스트  (들어오면 여기서 라우팅 푸시)
          <List>
            {patients.map((patient) => (
              <ListItem
                key={patient.receptionId}
                divider
                secondaryAction={
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => router.push(`/patients/${patient.receptionId}`)}
                  >
                    상세보기
                  </Button>
                }
              >
                <ListItemText
                  primary={patient.patientName}
                  secondary={`${patient.receptionNo ?? "환자 지정부서"} / ${patient.status ?? "상태 확인"}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicalPatientPanel;
