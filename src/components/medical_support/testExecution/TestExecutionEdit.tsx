"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import TestExecutionForm, {
  toTestExecutionFormData,
  toTestExecutionUpdatePayload,
} from "@/components/medical_support/testExecution/TestExecutionForm";
import { TestExecutionActions } from "@/features/medical_support/testExecution/testExecutionSlice";
import { updateTestExecutionApi } from "@/lib/medical_support/testExecutionApi";
import { getTestExecutionStartListPath } from "@/lib/medical_support/testExecutionStart";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type PendingAction = {
  nextPath: string;
  successMessage: string;
};

const normalizeActiveStatus = (value?: string | null) =>
  value?.trim().toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";

export default function TestExecutionEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const testExecutionId = useMemo(() => {
    const value = params?.testExecutionId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<ReturnType<
    typeof toTestExecutionFormData
  > | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const pendingActionRef = useRef<PendingAction | null>(null);
  const { list, selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.testexecutions
  );

  useEffect(() => {
    if (!testExecutionId) return;

    dispatch(TestExecutionActions.fetchTestExecutionRequest(testExecutionId));
  }, [dispatch, testExecutionId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toTestExecutionFormData();
    if (String(selected.testExecutionId) !== String(testExecutionId)) {
      return toTestExecutionFormData();
    }
    return toTestExecutionFormData(selected);
  }, [draftForm, selected, testExecutionId]);

  const currentExecution = useMemo(() => {
    if (!selected) return null;
    if (String(selected.testExecutionId) !== String(testExecutionId)) {
      return null;
    }
    return selected;
  }, [selected, testExecutionId]);

  const currentProgressStatus =
    currentExecution?.progressStatus?.trim().toUpperCase() ?? "";
  const isFormActive = normalizeActiveStatus(form.status) === "ACTIVE";
  const canCancel = currentProgressStatus === "WAITING";
  const canStart =
    isFormActive &&
    (currentProgressStatus === "WAITING" || currentProgressStatus === "IN_PROGRESS");
  const nextStatusLabel =
    normalizeActiveStatus(currentExecution?.status) === "INACTIVE"
      ? "활성화"
      : "비활성화";

  useEffect(() => {
    if (!updateSuccess) return;

    const pendingAction = pendingActionRef.current;
    const nextPath =
      pendingAction?.nextPath ?? "/medical_support/testExecution/list";

    alert(pendingAction?.successMessage ?? "검사 수행 정보가 저장되었습니다.");
    dispatch(TestExecutionActions.resetUpdateSuccess());
    pendingActionRef.current = null;
    router.push(nextPath);
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;

    pendingActionRef.current = null;
    alert(error);
  }, [error]);

  const handleToggleActiveStatus = async () => {
    if (!testExecutionId || !currentExecution || statusUpdating) return;

    const currentStatus = normalizeActiveStatus(currentExecution.status);
    const nextStatus = currentStatus === "INACTIVE" ? "ACTIVE" : "INACTIVE";

    if (
      !window.confirm(
        `활성 여부만 즉시 반영됩니다. 검사 수행을 ${nextStatusLabel}하시겠습니까?`
      )
    ) {
      return;
    }

    setStatusUpdating(true);

    try {
      const updatedItem = await updateTestExecutionApi(testExecutionId, {
        progressStatus: currentExecution.progressStatus ?? null,
        status: nextStatus,
        retryNo: currentExecution.retryNo ?? null,
        patientId: currentExecution.patientId ?? null,
        patientName: currentExecution.patientName ?? null,
        departmentName: currentExecution.departmentName ?? null,
        performerId: currentExecution.performerId ?? null,
      });

      setDraftForm(toTestExecutionFormData(updatedItem));
      dispatch(TestExecutionActions.fetchTestExecutionSuccess(updatedItem));
      dispatch(
        TestExecutionActions.fetchTestExecutionsSuccess(
          list.map((item) =>
            String(item.testExecutionId) === String(updatedItem.testExecutionId)
              ? updatedItem
              : item
          )
        )
      );
      alert(`검사 수행이 ${nextStatusLabel}되었습니다.`);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : `검사 수행 ${nextStatusLabel}에 실패했습니다.`
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading && !form.testExecutionId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <TestExecutionForm
      mode="edit"
      form={form}
      onChange={setDraftForm}
      onToggleActiveStatus={handleToggleActiveStatus}
      toggleActiveStatusLabel={nextStatusLabel}
      toggleActiveStatusDisabled={!currentExecution || statusUpdating}
      onNavigateList={() => router.push("/medical_support/testExecution/list")}
      onCancelExecution={() => {
        if (!testExecutionId || !canCancel) return;

        const payload = toTestExecutionUpdatePayload(form, currentExecution);
        payload.progressStatus = "CANCELLED";

        pendingActionRef.current = {
          nextPath: "/medical_support/testExecution/list",
          successMessage: "검사 수행이 취소되었습니다.",
        };
        dispatch(
          TestExecutionActions.updateTestExecutionRequest({
            testExecutionId,
            form: payload,
          })
        );
      }}
      cancelExecutionDisabled={!canCancel}
      submitDisabled={!canStart}
      onSubmit={() => {
        if (!testExecutionId || !canStart) return;

        const nextPath = getTestExecutionStartListPath(form.executionType);

        if (!nextPath) {
          alert("검사유형을 확인한 뒤 다시 시작해주세요.");
          return;
        }

        const payload = toTestExecutionUpdatePayload(form, currentExecution);
        payload.progressStatus = "IN_PROGRESS";

        pendingActionRef.current = {
          nextPath,
          successMessage:
            "검사 시작을 위해 정보를 저장했고, 해당 검사 목록으로 이동합니다.",
        };
        dispatch(
          TestExecutionActions.updateTestExecutionRequest({
            testExecutionId,
            form: payload,
          })
        );
      }}
      loading={loading || statusUpdating}
    />
  );
}
