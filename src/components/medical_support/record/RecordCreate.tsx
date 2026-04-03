"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import type { AppDispatch } from "../../../store/store";
import { RootState } from "@/store/rootReducer";
import RecordForm from "./RecordForm";
import { RecActions } from "@/features/medical_support/record/recordSlice";
import { RecordFormType } from "@/features/medical_support/record/recordTypes";

const emptyForm: RecordFormType = {
  recordId: "",
  visitId: "",
  nursingId: "",
  recordedAt: "",
  createdAt: "",
  updatedAt: "",
  systolicBp: "",
  diastolicBp: "",
  pulse: "",
  respiration: "",
  temperature: "",
  spo2: "",
  observation: "",
  painScore: "",
  consciousnessLevel: "",
  initialAssessment: "",
  status: "ACTIVE",
  patientName: "",
  nurseName: "",
  departmentName: "",
  heightCm: "",
  weightKg: "",
};

const RecordCreate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialForm = useMemo<RecordFormType>(
    () => ({
      ...emptyForm,
      visitId: searchParams.get("visitId") ?? "",
      nursingId: searchParams.get("nursingId") ?? "",
      patientName: searchParams.get("patientName") ?? "",
      nurseName: searchParams.get("nurseName") ?? "",
      departmentName: searchParams.get("departmentName") ?? "",
      status: "ACTIVE",
    }),
    [searchParams]
  );
  const [form, setForm] = useState<RecordFormType>(initialForm);

  const { loading, error, createSuccess } = useSelector(
    (state: RootState) => state.records
  );

  useEffect(() => {
    if (!createSuccess) return;

    alert("간호 기록이 저장되었습니다.");
    dispatch(RecActions.resetCreateSuccess());
    router.push("/medical_support/record/list");
  }, [createSuccess, dispatch, router]);

  useEffect(() => {
    if (!error) return;

    if (error === "Network Error") {
      alert("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    alert("간호 기록 등록에 실패했습니다. 다시 시도해주세요.");
  }, [error]);

  const handleSubmit = () => {
    const now = dayjs().format("YYYY-MM-DDTHH:mm:ss");

    const payload: RecordFormType = {
      ...form,
      recordId: "",
      createdAt: now,
      updatedAt: now,
      status: form.status || "ACTIVE",
    };

    dispatch(RecActions.createRecordRequest(payload));
  };

  return (
    <main style={{ padding: 24 }}>
      <RecordForm
        mode="create"
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </main>
  );
};

export default RecordCreate;
