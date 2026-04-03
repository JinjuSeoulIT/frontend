"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import TestExecutionForm, {
  toTestExecutionPayload,
  toTestExecutionFormData,
} from "@/components/medical_support/testExecution/TestExecutionForm";
import { TestExecutionActions } from "@/features/medical_support/testExecution/testExecutionSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

export default function TestExecutionCreate() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [form, setForm] = useState(toTestExecutionFormData());
  const { loading, error, createSuccess } = useSelector(
    (state: RootState) => state.testexecutions
  );

  useEffect(() => {
    if (!createSuccess) return;

    alert("검사 수행이 등록되었습니다.");
    dispatch(TestExecutionActions.resetCreateSuccess());
    router.push("/medical_support/testExecution/list");
  }, [createSuccess, dispatch, router]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  return (
    <TestExecutionForm
      mode="create"
      form={form}
      onChange={setForm}
      onSubmit={() => {
        dispatch(
          TestExecutionActions.createTestExecutionRequest(
            toTestExecutionPayload(form)
          )
        );
      }}
      loading={loading}
    />
  );
}
