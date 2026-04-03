"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { inpatientReceptionActions } from "@/features/InpatientReception/InpatientReceptionSlice";
import type { InpatientReceptionForm as InpatientReceptionFormPayload } from "@/features/InpatientReception/InpatientReceptionTypes";
import InpatientReceptionForm from "@/components/reception/InpatientReceptionForm";

export default function EditInpatientReceptionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.inpatientReceptions);
  const receptionId = params.id;

  React.useEffect(() => {
    dispatch(inpatientReceptionActions.fetchInpatientReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  const current = selected && String(selected.receptionId) === receptionId ? selected : null;

  const onSubmit = (form: InpatientReceptionFormPayload) => {
    dispatch(inpatientReceptionActions.updateInpatientReceptionRequest({ receptionId, form }));
    router.push(`/reception/inpatient/detail/${receptionId}`);
  };

  return (
    <MainLayout>
      <InpatientReceptionForm
        title="입원 접수 수정"
        submitLabel="저장"
        initial={{
          receptionNo: current?.receptionNo ?? "",
          patientId: current?.patientId ? String(current.patientId) : "",
          departmentId: current?.departmentId ? String(current.departmentId) : "",
          doctorId: current?.doctorId ? String(current.doctorId) : "",
          scheduledAt: current?.scheduledAt ?? "",
          arrivedAt: current?.arrivedAt ?? "",
          status: current?.status ?? "WAITING",
          note: current?.note ?? "",
          admissionPlanAt: current?.admissionPlanAt ?? "",
          wardId: current?.wardId ? String(current.wardId) : "",
          roomId: current?.roomId ? String(current.roomId) : "",
        }}
        loading={loading}
        error={error}
        mode="edit"
        onSubmit={onSubmit}
        onCancel={() => router.push(`/reception/inpatient/detail/${receptionId}`)}
      />
    </MainLayout>
  );
}
