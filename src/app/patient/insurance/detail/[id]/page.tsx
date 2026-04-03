import MainLayout from "@/components/layout/MainLayout";
import { Box, Card, CardContent, Typography } from "@mui/material";

type Props = {
  params: { id: string };
};

export default function InsuranceDetailPage({ params }: Props) {
  return (
    <MainLayout>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          boxShadow: "0 12px 24px rgba(23, 52, 97, 0.12)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>
            보험 관리
          </Typography>
          <Box sx={{ color: "#7b8aa9", fontSize: 14 }}>
            환자 ID: {params.id}
          </Box>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
