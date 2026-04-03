"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Reception/ReceptionSlice";
import type { ReceptionForm as ReceptionFormPayload } from "@/features/Reception/ReceptionTypes";
import { Button, Stack } from "@mui/material";
import ReceptionForm from "@/components/reception/ReceptionForm";

export default function ReceptionEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.receptions);
  const [submitRequested, setSubmitRequested] = React.useState(false);

  const receptionId = params.id;
  const current = selected && String(selected.receptionId) === receptionId ? selected : null;

  React.useEffect(() => {
    dispatch(receptionActions.fetchReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  React.useEffect(() => {
    if (!submitRequested) return;
    if (loading) return;
    if (error) {
      setSubmitRequested(false);
      return;
    }
    router.push(`/reception/outpatient/detail/${receptionId}`);
  }, [submitRequested, loading, error, router, receptionId]);

  
  const onSubmit = (form: ReceptionFormPayload) => {
    if (!current) return;
    setSubmitRequested(true);
    dispatch(receptionActions.updateReceptionRequest({ receptionId, form }));
  };
 // 저장버튼을 눌렀을때 호출하는 함수
  

  return (
    <MainLayout>
      <ReceptionForm
        title="접수 정보 수정"
        submitLabel="저장"
        initial={{
          receptionNo: current?.receptionNo ?? "",
          patientId: current?.patientId ?? null,
          patientName: current?.patientName ?? "",
          departmentId: current?.departmentId ? String(current.departmentId) : "",
          doctorId: current?.doctorId ? String(current.doctorId) : "",
          visitType: current?.visitType ?? "OUTPATIENT",
          scheduledAt: current?.scheduledAt ?? "",
          arrivedAt: current?.arrivedAt ?? "",
          status: current?.status ?? "WAITING",
          note: current?.note ?? "",
        }}
        loading={loading}
        error={error}
        mode="edit"
        showScheduledAt={false}
        onSubmit={onSubmit}
        onCancel={() => router.push(`/reception/outpatient/detail/${receptionId}`)}
      />
     
    </MainLayout>
  );
}
