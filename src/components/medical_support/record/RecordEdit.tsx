"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import RecordForm from "./RecordForm";
import { AppDispatch } from "@/store/store";
import { RootState } from "@/store/rootReducer";
import { RecActions } from "@/features/medical_support/record/recordSlice";
import { RecordFormType } from "@/features/medical_support/record/recordTypes";

const RecordEdit = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const recordId = useMemo(() => {
    const value = params?.recordId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.records
  );

  const [draftForm, setDraftForm] = useState<RecordFormType | null>(null);
  const pendingSuccessMessageRef = useRef<string | null>(null);
  const pendingRedirectPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!recordId) return;
    dispatch(RecActions.fetchRecordRequest(recordId));
  }, [dispatch, recordId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected.recordId) return null;
    if (selected.recordId !== recordId) return null;

    return {
      recordId: selected.recordId ?? "",
      receptionId: selected.receptionId ?? null,
      patientId: selected.patientId ?? null,
      nursingId: selected.nursingId ?? "",
      recordedAt: selected.recordedAt ?? "",
      systolicBp: selected.systolicBp ?? "",
      diastolicBp: selected.diastolicBp ?? "",
      pulse: selected.pulse ?? "",
      respiration: selected.respiration ?? "",
      temperature: selected.temperature ?? "",
      spo2: selected.spo2 ?? "",
      observation: selected.observation ?? "",
      painScore: selected.painScore ?? "",
      consciousnessLevel: selected.consciousnessLevel ?? "",
      initialAssessment: selected.initialAssessment ?? "",
      pastMedicalHistory: selected.pastMedicalHistory ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
      patientName: selected.patientName ?? "",
      nurseName: selected.nurseName ?? "",
      departmentName: selected.departmentName ?? "",
      heightCm: selected.heightCm ?? "",
      weightKg: selected.weightKg ?? "",
    };
  }, [draftForm, recordId, selected]);

  useEffect(() => {
    if (!updateSuccess) return;

    const message =
      pendingSuccessMessageRef.current ?? "간호 기록이 수정되었습니다.";
    const nextPath = pendingRedirectPathRef.current;
    pendingSuccessMessageRef.current = null;
    pendingRedirectPathRef.current = null;

    alert(message);
    dispatch(RecActions.resetUpdateSuccess());
    if (nextPath) {
      router.push(nextPath);
    }
  }, [updateSuccess, dispatch, router]);

  useEffect(() => {
    if (!error) return;
    if (!form) return;

    if (error === "Network Error") {
      alert("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    alert("간호 기록 수정에 실패했습니다. 다시 시도해주세요.");
  }, [error, form]);

  const handleSubmit = () => {
    if (!form || !recordId) return;

    const now = dayjs().format("YYYY-MM-DDTHH:mm:ss");
    pendingSuccessMessageRef.current = "간호 기록이 수정되었습니다.";
    pendingRedirectPathRef.current = "/medical_support/record/list";

    dispatch(
      RecActions.updateRecordRequest({
        recordId,
        form: {
          ...form,
          updatedAt: now,
        },
      })
    );
  };

  const handleToggleActiveStatus = () => {
    if (!form || !recordId) return;

    const now = dayjs().format("YYYY-MM-DDTHH:mm:ss");
    const nextStatus =
      String(form.status ?? "").trim().toUpperCase() === "INACTIVE"
        ? "ACTIVE"
        : "INACTIVE";
    const actionLabel = nextStatus === "INACTIVE" ? "비활성화" : "활성화";
    pendingSuccessMessageRef.current = `간호 기록이 ${actionLabel}되었습니다.`;
    pendingRedirectPathRef.current = null;

    dispatch(
      RecActions.updateRecordRequest({
        recordId,
        form: {
          ...form,
          status: nextStatus,
          updatedAt: now,
        },
      })
    );
  };

  if (loading && !form) {
    return (
      <main style={{ padding: 24 }}>
        <CircularProgress />
      </main>
    );
  }

  if (!form) {
    return (
      <main style={{ padding: 24 }}>
        <p>수정할 기록을 불러오는 중입니다.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <RecordForm
        mode="edit"
        form={form}
        onChange={setDraftForm}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/medical_support/record/detail/${recordId}`)}
        onNavigateDetail={() =>
          router.push(`/medical_support/record/detail/${recordId}`)
        }
        onToggleActiveStatus={handleToggleActiveStatus}
        loading={loading}
      />
    </main>
  );
};

export default RecordEdit;
