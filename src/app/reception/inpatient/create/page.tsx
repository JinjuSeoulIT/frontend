"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { inpatientReceptionActions } from "@/features/InpatientReception/InpatientReceptionSlice";
import type { InpatientReceptionForm as InpatientReceptionFormPayload } from "@/features/InpatientReception/InpatientReceptionTypes";
import InpatientReceptionForm from "@/components/reception/InpatientReceptionForm";

export default function NewInpatientReceptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.inpatientReceptions);
  const patientIdParam = (searchParams.get("patientId") ?? "").trim();

  const onSubmit = (form: InpatientReceptionFormPayload) => {
    dispatch(inpatientReceptionActions.createInpatientReceptionRequest(form));
    router.push("/reception/inpatient/list");
  };

  return (
    <MainLayout>
      <InpatientReceptionForm
        title="입원 접수 등록"
        submitLabel="등록"
        initial={{
          receptionNo: "",
          patientId: patientIdParam,
          departmentId: "",
          doctorId: "",
          scheduledAt: "",
          arrivedAt: "",
          status: "WAITING",
          note: "",
          admissionPlanAt: "",
          wardId: "",
          roomId: "",
        }}
        loading={loading}
        error={error}
        mode="create"
        onSubmit={onSubmit}
        onCancel={() => router.push("/reception/inpatient/list")}
      />
    </MainLayout>
  );
}
