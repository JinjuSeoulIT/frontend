"use client";

import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import EmergencyOutlinedIcon from "@mui/icons-material/EmergencyOutlined";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PatientFormModal from "@/components/patient/PatientFormModal";
import React from "react";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import { createPatientApi } from "@/lib/reception/patientApi";
import { createConsentApi } from "@/lib/patient/consentApi";
import { patientActions } from "@/features/patients/patientSlice";
import { resolveErrorMessage } from "@/components/patient/detail/PatientDetailUtils";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

const menus = [
  {
    title: "외래 접수",
    desc: "일반 접수 목록/처리",
    href: "/reception/outpatient/list",
    icon: <LocalHospitalOutlinedIcon />,
    accent: "#0b5b8f",
    tone: "linear-gradient(140deg, rgba(11, 91, 143, 0.18), rgba(11, 91, 143, 0.04))",
  },
  {
    title: "응급 접수",
    desc: "응급 환자 접수 관리",
    href: "/reception/emergency/list",
    icon: <EmergencyOutlinedIcon />,
    accent: "#b54708",
    tone: "linear-gradient(140deg, rgba(181, 71, 8, 0.18), rgba(181, 71, 8, 0.04))",
  },
  {
    title: "입원 접수",
    desc: "입원 접수/병실 배정",
    href: "/reception/inpatient/list",
    icon: <BedOutlinedIcon />,
    accent: "#006d77",
    tone: "linear-gradient(140deg, rgba(0, 109, 119, 0.2), rgba(0, 109, 119, 0.04))",
  },
  {
    title: "예약 접수",
    desc: "예약 목록/처리",
    href: "/reception/reservation/list",
    icon: <EventAvailableOutlinedIcon />,
    accent: "#7c3aed",
    tone: "linear-gradient(140deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.04))",
  },
];

export default function ReceptionHubPage() {
  const [registrationOpen, setRegistrationOpen] = React.useState(false);
    const [registrationSubmitting, setRegistrationSubmitting] = React.useState(false);
    const [registrationError, setRegistrationError] = React.useState<string | null>(null);
    const [registrationInitialName, setRegistrationInitialName] = React.useState("");
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleRegistrationSubmit = async (form: PatientFormPayload) => {
        try {
          setRegistrationSubmitting(true);
          setRegistrationError(null);
          const created = await createPatientApi(form);
          await createConsentsForPatient(created.patientId, form);
          dispatch(patientActions.fetchPatientsRequest());
          setRegistrationOpen(false);
        } catch (err: unknown) {
          setRegistrationError(resolveErrorMessage(err, "환자 등록 실패"));
        } finally {
          setRegistrationSubmitting(false);
        }
      };

      const createConsentsForPatient = async (
          patientId: number,
          form: PatientFormPayload
        ) => {
          const consentTypes: { code: string; checked: boolean }[] = [
            { code: "PRIVACY", checked: !!form.consentRequired },
            { code: "MARKETING", checked: !!form.consentOptional },
          ];
          for (const { code, checked } of consentTypes) {
            if (checked) {
              await createConsentApi(patientId, {
                patientId,
                consentType: code,
              });
            }
          }
        };
    
      const handleRegistrationSubmitAndReception = async (form: PatientFormPayload) => {
        try {
          setRegistrationSubmitting(true);
          setRegistrationError(null);
          const created = await createPatientApi(form);
          await createConsentsForPatient(created.patientId, form);
          dispatch(patientActions.fetchPatientsRequest());
          setRegistrationOpen(false);
          const patientName = (created.name ?? form.name ?? "").trim();
          router.push(`/reception/outpatient/create?patientName=${encodeURIComponent(patientName)}&patientId=${created.patientId}`);
        } catch (err: unknown) {
          setRegistrationError(resolveErrorMessage(err, "등록 후 접수 처리 실패"));
        } finally {
          setRegistrationSubmitting(false);
        }
      };
  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(11, 91, 143, 0.2)",
            boxShadow: "0 12px 28px rgba(11, 91, 143, 0.12)",
            background:
              "linear-gradient(125deg, rgba(11, 91, 143, 0.16), rgba(11, 91, 143, 0.02) 55%)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={1}>
              <Chip
                label="Reception Workspace"
                size="small"
                sx={{
                  width: "fit-content",
                  bgcolor: "rgba(11, 91, 143, 0.14)",
                  color: "#0b5b8f",
                  fontWeight: 800,
                }}
              />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4" fontWeight={900}>
                접수 메인
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRegistrationOpen(true)}
              
              sx={{
                      mt: 0.25,
                      alignSelf: "flex-start",
                      borderRadius: 2,
                      px: 2,
                      py: 0.8,
                      fontWeight: 800,
                      color: "white",
                    }}>
              
                            신규 환자 등록
                            
                          </Button>
                    </Stack>
              <Typography color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>
                접수 업무를 빠르게 선택해 바로 처리하세요.
              </Typography>
              
              
              
                          
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2.25}>
          {menus.map((menu) => (
            <Grid key={menu.href} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  boxShadow: "0 14px 26px rgba(15, 23, 42, 0.08)",
                  background: menu.tone,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 18px 30px rgba(15, 23, 42, 0.14)",
                    borderColor: `${menu.accent}66`,
                  },
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: `${menu.accent}1A`,
                        color: menu.accent,
                      }}
                    >
                      {menu.icon}
                    </Box>
                    <Typography fontWeight={900} sx={{ fontSize: 24, lineHeight: 1.1 }}>
                      {menu.title}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" fontWeight={700} sx={{ minHeight: 24 }}>
                    {menu.desc}
                  </Typography>
                  <Button
                    component={Link}
                    href={menu.href}
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      mt: 0.25,
                      alignSelf: "flex-start",
                      borderRadius: 2,
                      px: 2,
                      py: 0.8,
                      fontWeight: 800,
                      bgcolor: menu.accent,
                      color: "white",
                      "&:hover": { bgcolor: menu.accent, filter: "brightness(0.94)" },
                    }}
                  >
                    바로 이동
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
          <PatientFormModal
                    open={registrationOpen}
                    onClose={() => {
                      setRegistrationOpen(false);
                      setRegistrationError(null);
                    }}
                    mode="create"
                    loading={registrationSubmitting}
                    error={registrationError}
                    initialName={registrationInitialName}
                    onSubmit={handleRegistrationSubmit}
                    onSubmitAndReception={handleRegistrationSubmitAndReception}
                  />
        </Grid>
      </Stack>
    </MainLayout>
  );
}
