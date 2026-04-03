"use client";

import { CircularProgress, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ImagingActions } from "@/features/medical_support/imaging/imagingSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type ImagingEditForm = {
  imagingExamId: string;
  testExecutionId: string;
  imagingType: string;
  examStatusYn: string;
  examAt: string;
  createdAt: string;
  updatedAt: string;
};

const toImagingFormData = (
  item?: Partial<ImagingEditForm>
): ImagingEditForm => ({
  imagingExamId: item?.imagingExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  imagingType: item?.imagingType ?? "",
  examStatusYn: item?.examStatusYn ?? "",
  examAt: item?.examAt ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

export default function ImagingEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const imagingExamId = useMemo(() => {
    const value = params?.imagingExamId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<ImagingEditForm | null>(null);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.imagings
  );

  useEffect(() => {
    if (!imagingExamId) return;
    dispatch(ImagingActions.fetchImagingRequest(imagingExamId));
  }, [dispatch, imagingExamId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toImagingFormData();
    if (String(selected.imagingExamId) !== String(imagingExamId)) {
      return toImagingFormData();
    }

    return toImagingFormData({
      imagingExamId: String(selected.imagingExamId ?? ""),
      testExecutionId: String(selected.testExecutionId ?? ""),
      imagingType: selected.imagingType ?? "",
      examStatusYn: selected.examStatusYn ?? "",
      examAt: selected.examAt ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, selected, imagingExamId]);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("영상 검사가 수정되었습니다.");
    dispatch(ImagingActions.resetUpdateSuccess());
    router.push("/medical_support/imaging/list");
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  if (loading && !form.imagingExamId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 800 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          영상 검사 수정
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="영상검사아이디"
            value={form.imagingExamId}
            disabled
            fullWidth
          />

          <TextField
            label="검사수행아이디"
            value={form.testExecutionId}
            onChange={(e) =>
              setDraftForm({
                ...form,
                testExecutionId: e.target.value,
              })
            }
            fullWidth
          />

          <TextField
            label="영상검사유형"
            value={form.imagingType}
            onChange={(e) =>
              setDraftForm({
                ...form,
                imagingType: e.target.value,
              })
            }
            fullWidth
          />

          <TextField
            label="검사상태여부"
            value={form.examStatusYn}
            onChange={(e) =>
              setDraftForm({
                ...form,
                examStatusYn: e.target.value,
              })
            }
            fullWidth
            helperText="Y 또는 N"
          />

          <TextField
            label="검사일시"
            value={form.examAt}
            onChange={(e) =>
              setDraftForm({
                ...form,
                examAt: e.target.value,
              })
            }
            fullWidth
          />

          <TextField
            label="생성일시"
            value={form.createdAt}
            disabled
            fullWidth
          />

          <TextField
            label="수정일시"
            value={form.updatedAt}
            disabled
            fullWidth
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => router.push("/medical_support/imaging/list")}
            >
              취소
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                if (!imagingExamId) return;

                dispatch(
                  ImagingActions.updateImagingRequest({
                    imagingExamId,
                    form: {
                      testExecutionId: form.testExecutionId,
                      imagingType: form.imagingType,
                      examStatusYn: form.examStatusYn,
                      examAt: form.examAt,
                    },
                  })
                );
              }}
              disabled={loading}
            >
              저장
            </Button>
          </Stack>
        </Stack>
      </Box>
    </main>
  );
}