"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { reservationActions } from "@/features/Reservations/ReservationSlice";
import type { ReservationForm as ReservationFormPayload } from "@/features/Reservations/ReservationTypes";
import ReservationForm from "@/components/reception/ReservationForm";

export default function NewReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.reservations);
  const patientName = (searchParams.get("patientName") ?? "").trim();
  const patientIdParam = (searchParams.get("patientId") ?? "").trim();

  const onSubmit = (form: ReservationFormPayload) => {
    dispatch(reservationActions.createReservationRequest(form));
    router.push("/reception/reservation/list");
  };

  return (
    <MainLayout>
      <ReservationForm
        title="신규 예약 등록"
        submitLabel="등록"
        initial={{
          reservationNo: "",
          patientId: patientIdParam,
          patientName,
          departmentId: "",
          departmentName: "",
          doctorId: "",
          doctorName: "",
          reservedAt: "",
          status: "RESERVED",
          note: "",
        }}
        loading={loading}
        error={error}
        mode="create"
        onSubmit={onSubmit}
        onCancel={() => router.push("/reception/reservation/list")}
      />
    </MainLayout>
  );
}
