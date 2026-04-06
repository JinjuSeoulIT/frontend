"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { emergencyReceptionActions } from "@/features/EmergencyReception/EmergencyReceptionSlice";
import type { EmergencyReceptionForm as EmergencyReceptionFormPayload } from "@/features/EmergencyReception/EmergencyReceptionTypes";
import EmergencyReceptionForm from "@/components/reception/EmergencyReceptionForm";

export default function EditEmergencyReceptionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.emergencyReceptions);
  const receptionId = params.id;

  React.useEffect(() => {
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  const current = selected && String(selected.receptionId) === receptionId ? selected : null;
  const currentWithName = current as (typeof current & {
    patientName?: string | null;
    name?: string | null;
    patient?: { name?: string | null } | null;
  }) | null;
  const initialPatientName =
    currentWithName?.patientName?.trim() ||
    currentWithName?.name?.trim() ||
    currentWithName?.patient?.name?.trim() ||
    "";

  const onSubmit = (form: EmergencyReceptionFormPayload) => {
    dispatch(emergencyReceptionActions.updateEmergencyReceptionRequest({ receptionId, form }));
    router.push("/reception/emergency/list");
  };

  return (
    <MainLayout>
      <EmergencyReceptionForm
        title="응급 접수 수정"
        submitLabel="저장"
        receptionId={receptionId}
        initial={{
          receptionNo: current?.receptionNo ?? "",
          patientId: current?.patientId ? String(current.patientId) : "",
          patientName: initialPatientName,
          departmentId: current?.departmentId ? String(current.departmentId) : "5",
          doctorId: current?.doctorId ? String(current.doctorId) : "",
          scheduledAt: current?.scheduledAt ?? "",
          arrivedAt: current?.arrivedAt ?? "",
          status: current?.status ?? "WAITING",
          note: current?.note ?? "",
          triageNote: current?.triageNote ?? "",
          triageLevel: current?.triageLevel ? String(current.triageLevel) : "",
          chiefComplaint: current?.chiefComplaint ?? "",
          vitalTemp: current?.vitalTemp != null ? String(current.vitalTemp) : "",
          vitalBpSystolic: current?.vitalBpSystolic != null ? String(current.vitalBpSystolic) : "",
          vitalBpDiastolic: current?.vitalBpDiastolic != null ? String(current.vitalBpDiastolic) : "",
          vitalHr: current?.vitalHr != null ? String(current.vitalHr) : "",
          vitalRr: current?.vitalRr != null ? String(current.vitalRr) : "",
          vitalSpo2: current?.vitalSpo2 != null ? String(current.vitalSpo2) : "",
          arrivalMode: current?.arrivalMode ?? "WALK_IN",
        }}
        loading={loading}
        error={error}
        mode="edit"
        onSubmit={onSubmit}
        onCancel={() => router.push("/reception/emergency/list")}
      />
    </MainLayout>
  );
}
