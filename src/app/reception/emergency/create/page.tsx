"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { emergencyReceptionActions } from "@/features/EmergencyReception/EmergencyReceptionSlice";
import type { EmergencyReceptionForm as EmergencyReceptionFormPayload } from "@/features/EmergencyReception/EmergencyReceptionTypes";
import EmergencyReceptionForm from "@/components/reception/EmergencyReceptionForm";

export default function NewEmergencyReceptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, lastCreated } = useSelector((s: RootState) => s.emergencyReceptions);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedForm, setSubmittedForm] =
    React.useState<EmergencyReceptionFormPayload | null>(null);
  const patientIdParam = (searchParams.get("patientId") ?? "").trim();
  const patientNameParam = (searchParams.get("patientName") ?? "").trim();

  const onSubmit = (form: EmergencyReceptionFormPayload) => {
    setSubmittedForm(form);
    dispatch(emergencyReceptionActions.createEmergencyReceptionRequest(form));
    setSubmitted(true);
  };

  React.useEffect(() => {
    if (!submitted || loading) return;
    if (error) {
      setSubmitted(false);
      return;
    }

    const params = new URLSearchParams();

    const visitId = lastCreated?.receptionId;
    if (visitId != null) {
      params.set("visitId", String(visitId));
    }

    const patientId = lastCreated?.patientId ?? submittedForm?.patientId ?? null;
    if (patientId != null) {
      params.set("patientId", String(patientId));
    }

    const patientName = patientNameParam.trim();
    if (patientName) {
      params.set("patientName", patientName);
    }

    params.set("departmentName", "EMERGENCY");
    params.set("source", "emergency_reception");

    router.push(`/medical_support/record/create?${params.toString()}`);
  }, [submitted, loading, error, lastCreated, submittedForm, patientNameParam, router]);

  return (
    <MainLayout>
      <EmergencyReceptionForm
        title="응급 접수 등록"
        submitLabel="등록"
        initial={{
          receptionNo: "",
          patientId: patientIdParam,
          patientName: patientNameParam,
          departmentId: "",
          doctorId: "",
          scheduledAt: "",
          arrivedAt: "",
          status: "WAITING",
          note: "",
          triageNote: "",
          triageLevel: "",
          chiefComplaint: "",
          vitalTemp: "",
          vitalBpSystolic: "",
          vitalBpDiastolic: "",
          vitalHr: "",
          vitalRr: "",
          vitalSpo2: "",
          arrivalMode: "",
        }}
        loading={loading}
        error={error}
        mode="create"
        onSubmit={onSubmit}
        onCancel={() => router.push("/reception/emergency/list")}
      />
    </MainLayout>
  );
}
