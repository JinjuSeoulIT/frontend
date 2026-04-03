"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import TestExecutionForm, {
  toTestExecutionPayload,
  toTestExecutionFormData,
} from "@/components/medical_support/testExecution/TestExecutionForm";
import { TestExecutionActions } from "@/features/medical_support/testExecution/testExecutionSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

export default function TestExecutionEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const testExecutionId = useMemo(() => {
    const value = params?.testExecutionId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<ReturnType<typeof toTestExecutionFormData> | null>(null);
  const { selected, loading, error, updateSuccess } = useSelector(
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

  useEffect(() => {
    if (!updateSuccess) return;

    alert("검사 수행이 수정되었습니다.");
    dispatch(TestExecutionActions.resetUpdateSuccess());
    router.push("/medical_support/testExecution/list");
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  if (loading && !form.testExecutionId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <TestExecutionForm
      mode="edit"
      form={form}
      onChange={setDraftForm}
      onSubmit={() => {
        if (!testExecutionId) return;

        dispatch(
          TestExecutionActions.updateTestExecutionRequest({
            testExecutionId,
            form: toTestExecutionPayload(form),
          })
        );
      }}
      loading={loading}
    />
  );
}
