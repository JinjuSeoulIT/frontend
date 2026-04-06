"use client";

import { CircularProgress, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { PathologyActions } from "@/features/medical_support/pathology/pathologySlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type PathologyEditForm = {
  pathologyExamId: string;
  testExecutionId: string;
  tissueStatus: string;
  collectionMethod: string;
  tissueSite: string;
  tissueType: string;
  collectedAt: string;
  collectedById: string;
  reexamYn: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const toPathologyFormData = (
  item?: Partial<PathologyEditForm>
): PathologyEditForm => ({
  pathologyExamId: item?.pathologyExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  tissueStatus: item?.tissueStatus ?? "",
  collectionMethod: item?.collectionMethod ?? "",
  tissueSite: item?.tissueSite ?? "",
  tissueType: item?.tissueType ?? "",
  collectedAt: item?.collectedAt ?? "",
  collectedById: item?.collectedById ?? "",
  reexamYn: item?.reexamYn ?? "",
  status: item?.status ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

export default function PathologyEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const pathologyExamId = useMemo(() => {
    const value = params?.pathologyExamId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<PathologyEditForm | null>(null);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.pathologies
  );

  useEffect(() => {
    if (!pathologyExamId) return;
    dispatch(PathologyActions.fetchPathologyRequest(pathologyExamId));
  }, [dispatch, pathologyExamId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toPathologyFormData();
    if (String(selected.pathologyExamId) !== String(pathologyExamId)) {
      return toPathologyFormData();
    }

    return toPathologyFormData({
      pathologyExamId: String(selected.pathologyExamId ?? ""),
      testExecutionId: String(selected.testExecutionId ?? ""),
      tissueStatus: selected.tissueStatus ?? "",
      collectionMethod: selected.collectionMethod ?? "",
      tissueSite: selected.tissueSite ?? "",
      tissueType: selected.tissueType ?? "",
      collectedAt: selected.collectedAt ?? "",
      collectedById: String(selected.collectedById ?? ""),
      reexamYn: selected.reexamYn ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, selected, pathologyExamId]);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("병리 검사가 수정되었습니다.");
    dispatch(PathologyActions.resetUpdateSuccess());
    router.push("/medical_support/pathology/list");
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  if (loading && !form.pathologyExamId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 800 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          병리 검사 수정
        </Typography>

        <Stack spacing={2}>
          <TextField label="병리검사아이디" value={form.pathologyExamId} disabled fullWidth />
          <TextField
            label="검사수행아이디"
            value={form.testExecutionId}
            onChange={(e) => setDraftForm({ ...form, testExecutionId: e.target.value })}
            fullWidth
          />
          <TextField
            label="검체상태"
            value={form.tissueStatus}
            onChange={(e) => setDraftForm({ ...form, tissueStatus: e.target.value })}
            fullWidth
          />
          <TextField
            label="채취방법"
            value={form.collectionMethod}
            onChange={(e) => setDraftForm({ ...form, collectionMethod: e.target.value })}
            fullWidth
          />
          <TextField
            label="조직부위"
            value={form.tissueSite}
            onChange={(e) => setDraftForm({ ...form, tissueSite: e.target.value })}
            fullWidth
          />
          <TextField
            label="검체종류"
            value={form.tissueType}
            onChange={(e) => setDraftForm({ ...form, tissueType: e.target.value })}
            fullWidth
          />
          <TextField
            label="채취일시"
            value={form.collectedAt}
            onChange={(e) => setDraftForm({ ...form, collectedAt: e.target.value })}
            fullWidth
          />
          <TextField
            label="채취담당아이디"
            value={form.collectedById}
            onChange={(e) => setDraftForm({ ...form, collectedById: e.target.value })}
            fullWidth
          />
          <TextField
            label="재검여부"
            value={form.reexamYn}
            onChange={(e) => setDraftForm({ ...form, reexamYn: e.target.value })}
            helperText="Y 또는 N"
            fullWidth
          />
          <TextField
            label="상태"
            value={form.status}
            onChange={(e) => setDraftForm({ ...form, status: e.target.value })}
            helperText="ACTIVE 또는 INACTIVE"
            fullWidth
          />
          <TextField label="생성일시" value={form.createdAt} disabled fullWidth />
          <TextField label="수정일시" value={form.updatedAt} disabled fullWidth />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => router.push("/medical_support/pathology/list")}
            >
              취소
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                if (!pathologyExamId) return;

                dispatch(
                  PathologyActions.updatePathologyRequest({
                    pathologyExamId,
                    form: {
                      testExecutionId: form.testExecutionId,
                      tissueStatus: form.tissueStatus,
                      collectionMethod: form.collectionMethod,
                      tissueSite: form.tissueSite,
                      tissueType: form.tissueType,
                      collectedAt: form.collectedAt,
                      collectedById: form.collectedById,
                      reexamYn: form.reexamYn,
                      status: form.status,
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