"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { Patient, PatientSearchPayload, PatientMultiSearchPayload } from "@/features/patients/patientTypes";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import { createPatientApi } from "@/lib/reception/patientApi";
import { createConsentApi } from "@/lib/patient/consentApi";
import MainLayout from "@/components/layout/MainLayout";
import PatientSearchCard from "@/components/patient/PatientSearchCard";
import PatientTable from "@/components/patient/PatientTable";
import PatientFormModal from "@/components/patient/PatientFormModal";

function resolveErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function PatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector((s: RootState) => s.patients);

  const [registrationOpen, setRegistrationOpen] = React.useState(false);
  const [registrationSubmitting, setRegistrationSubmitting] = React.useState(false);
  const [registrationError, setRegistrationError] = React.useState<string | null>(null);
  const [registrationInitialName, setRegistrationInitialName] = React.useState("");

  React.useEffect(() => {
    const open = searchParams.get("open");
    const name = searchParams.get("name") ?? "";
    if (open === "registration") {
      setRegistrationInitialName(decodeURIComponent(name));
      setRegistrationOpen(true);
      router.replace("/patient/list");
    }
  }, [searchParams, router]);

  const [searchType, setSearchType] = React.useState<PatientSearchPayload["type"]>("patientNo");
  const [keyword, setKeyword] = React.useState("");
  const [multiName, setMultiName] = React.useState("");
  const [multiBirthDate, setMultiBirthDate] = React.useState("");
  const [multiPhone, setMultiPhone] = React.useState("");

  React.useEffect(() => {
    dispatch(patientActions.fetchPatientsRequest());
  }, [dispatch]);

  const prioritizedList = React.useMemo(
    () => [...list].sort((a, b) => b.patientId - a.patientId),
    [list]
  );

  React.useEffect(() => {
    if (!prioritizedList.length) return;
    if (selected) {
      const still = prioritizedList.find((p) => p.patientId === selected.patientId);
      if (still) return;
    }
    dispatch(patientActions.fetchPatientSuccess(prioritizedList[0]));
  }, [prioritizedList, selected, dispatch]);

  const onSelect = (p: Patient) => {
    dispatch(patientActions.fetchPatientSuccess(p));
  };

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) return alert("검색어를 입력하세요.");
    dispatch(patientActions.searchPatientsRequest({ type: searchType, keyword: kw }));
  };

  const onReset = () => {
    setKeyword("");
    setSearchType("patientNo");
    dispatch(patientActions.fetchPatientsRequest());
  };

  const onMultiSearch = () => {
    const payload: PatientMultiSearchPayload = {
      name: multiName.trim() || undefined,
      birthDate: multiBirthDate.trim() || undefined,
      phone: multiPhone.trim() || undefined,
    };
    if (!payload.name && !payload.birthDate && !payload.phone) {
      return alert("검색 조건을 입력하세요.");
    }
    dispatch(patientActions.searchPatientsMultiRequest(payload));
  };

  const onMultiReset = () => {
    setMultiName("");
    setMultiBirthDate("");
    setMultiPhone("");
    dispatch(patientActions.fetchPatientsRequest());
  };

  const onDeactivate = (patientId: number) => {
    if (!confirm("환자를 비활성 처리하시겠습니까?")) return;
    dispatch(patientActions.deletePatientRequest(patientId));
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

  const primary = selected ?? prioritizedList[0] ?? null;
  const totalCount = prioritizedList.length;
  const vipCount = prioritizedList.filter((p) => p.isVip).length;

  return (
    <MainLayout>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 20 }}>환자관리</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.25 }}>
              검색, 목록, 상세를 한 화면에서 처리하는 원무/접수용 워크벤치
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRegistrationOpen(true)}>
              신규 등록
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onReset} disabled={loading}>
              새로고침
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip label={`전체 ${totalCount}`} color="primary" />
          <Chip label={`VIP ${vipCount}`} variant="outlined" />
          {error && <Chip label={`에러: ${error}`} color="error" variant="outlined" />}
          {loading && <Chip label="조회 중…" variant="outlined" />}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            alignItems: "start",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1fr) 380px",
            },
          }}
        >
          <Box sx={{ width: "100%", mx: "auto" }}>
            <PatientTable
              list={prioritizedList}
              selected={primary}
              onSelect={onSelect}
              onDeactivate={onDeactivate}
              onNavigateToDetail={(id) => router.push(`/patient/${id}`)}
            />
          </Box>

          <PatientSearchCard
            searchType={searchType}
            onSearchTypeChange={setSearchType}
            keyword={keyword}
            onKeywordChange={setKeyword}
            multiName={multiName}
            multiBirthDate={multiBirthDate}
            multiPhone={multiPhone}
            onMultiNameChange={setMultiName}
            onMultiBirthDateChange={setMultiBirthDate}
            onMultiPhoneChange={setMultiPhone}
            onSearch={onSearch}
            onReset={onReset}
            onMultiSearch={onMultiSearch}
            onMultiReset={onMultiReset}
            loading={loading}
          />
        </Box>

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
      </Box>
    </MainLayout>
  );
}
