"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { reservationActions } from "@/features/Reservations/ReservationSlice";
import type { ReservationForm as ReservationFormPayload } from "@/features/Reservations/ReservationTypes";
import ReservationForm from "@/components/reception/ReservationForm";

export default function EditReservationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.reservations);
  const reservationId = params.id;

  React.useEffect(() => {
    dispatch(reservationActions.fetchReservationRequest({ reservationId }));
  }, [dispatch, reservationId]);

  const current = selected && String(selected.reservationId) === reservationId ? selected : null;
  const formLoading = loading && !current;

  const onSubmit = (form: ReservationFormPayload) => {
    dispatch(reservationActions.updateReservationRequest({ reservationId, form }));
    router.push(`/reception/reservation/detail/${reservationId}`);
  };

  return (
    <MainLayout>
      <ReservationForm
        title="예약 정보 수정"
        submitLabel="저장"
        initial={{
          reservationNo: current?.reservationNo ?? "",
          patientId: current?.patientId ? String(current.patientId) : "",
          patientName: current?.patientName ?? "",
          departmentId: current?.departmentId ? String(current.departmentId) : "",
          departmentName: current?.departmentName ?? "",
          doctorId: current?.doctorId ? String(current.doctorId) : "",
          doctorName: current?.doctorName ?? "",
          reservedAt: current?.reservedAt ?? "",
          status: current?.status ?? "RESERVED",
          note: current?.note ?? "",
        }}
        loading={formLoading}
        error={error}
        mode="edit"
        onSubmit={onSubmit}
        onCancel={() => router.push(`/reception/reservation/detail/${reservationId}`)}
      />
    </MainLayout>
  );
}
