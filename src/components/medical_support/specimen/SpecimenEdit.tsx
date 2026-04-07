"use client";

import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { SpecimenActions } from "@/features/medical_support/specimen/specimenSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type SpecimenEditForm = {
  specimenExamId: string;
  testExecutionId: string;
  specimenType: string;
  specimenStatus: string;
  collectedAt: string;
  performerId: string;
  collectionSite: string;
  recollectionYn: string;
  progressStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const toSpecimenFormData = (
  item?: Partial<SpecimenEditForm>
): SpecimenEditForm => ({
  specimenExamId: item?.specimenExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  specimenType: item?.specimenType ?? "",
  specimenStatus: item?.specimenStatus ?? "",
  collectedAt: item?.collectedAt ?? "",
  performerId: item?.performerId ?? "",
  collectionSite: item?.collectionSite ?? "",
  recollectionYn: item?.recollectionYn ?? "",
  progressStatus: item?.progressStatus ?? "",
  status: item?.status ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

export default function SpecimenEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const specimenExamId = useMemo(() => {
    const value = params?.specimenExamId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<SpecimenEditForm | null>(null);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.specimens
  );

  useEffect(() => {
    if (!specimenExamId) return;
    dispatch(SpecimenActions.fetchSpecimenRequest(specimenExamId));
  }, [dispatch, specimenExamId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toSpecimenFormData();
    if (String(selected.specimenExamId) !== String(specimenExamId)) {
      return toSpecimenFormData();
    }

    return toSpecimenFormData({
      specimenExamId: String(selected.specimenExamId ?? ""),
      testExecutionId: String(selected.testExecutionId ?? ""),
      specimenType: selected.specimenType ?? "",
      specimenStatus: selected.specimenStatus ?? "",
      collectedAt: selected.collectedAt ?? "",
      performerId: String(selected.performerId ?? ""),
      collectionSite: selected.collectionSite ?? "",
      recollectionYn: selected.recollectionYn ?? "",
      progressStatus: selected.progressStatus ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, selected, specimenExamId]);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("검체 검사가 수정되었습니다.");
    dispatch(SpecimenActions.resetUpdateSuccess());
    router.push("/medical_support/specimen/list");
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  if (loading && !form.specimenExamId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 800 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          검체 검사 수정
        </Typography>

        <Stack spacing={2}>
          <TextField label="검체검사아이디" value={form.specimenExamId} disabled fullWidth />
          <TextField
            label="검사수행아이디"
            value={form.testExecutionId}
            onChange={(e) => setDraftForm({ ...form, testExecutionId: e.target.value })}
            fullWidth
          />
          <TextField
            label="검체종류"
            value={form.specimenType}
            onChange={(e) => setDraftForm({ ...form, specimenType: e.target.value })}
            fullWidth
          />
          <TextField
            label="검체상태"
            value={form.specimenStatus}
            onChange={(e) => setDraftForm({ ...form, specimenStatus: e.target.value })}
            fullWidth
          />
          <TextField
            label="채취일시"
            value={form.collectedAt}
            onChange={(e) => setDraftForm({ ...form, collectedAt: e.target.value })}
            fullWidth
          />
          <TextField
            label="담당자아이디"
            value={form.performerId}
            onChange={(e) => setDraftForm({ ...form, performerId: e.target.value })}
            fullWidth
          />
          <TextField
            label="채취부위"
            value={form.collectionSite}
            onChange={(e) => setDraftForm({ ...form, collectionSite: e.target.value })}
            fullWidth
          />
          <TextField
            label="재채취여부"
            value={form.recollectionYn}
            onChange={(e) => setDraftForm({ ...form, recollectionYn: e.target.value })}
            helperText="Y 또는 N"
            fullWidth
          />
          <TextField
            select
            label="진행상태"
            value={form.progressStatus}
            onChange={(e) => setDraftForm({ ...form, progressStatus: e.target.value })}
            fullWidth
          >
            <MenuItem value="WAITING">대기중</MenuItem>
            <MenuItem value="IN_PROGRESS">검사중</MenuItem>
            <MenuItem value="COMPLETED">검사완료</MenuItem>
          </TextField>
          <TextField
            select
            label="활성 여부"
            value={form.status}
            onChange={(e) => setDraftForm({ ...form, status: e.target.value })}
            helperText="활성 여부는 활성화 또는 비활성화입니다."
            fullWidth
          >
            <MenuItem value="ACTIVE">활성화</MenuItem>
            <MenuItem value="INACTIVE">비활성화</MenuItem>
          </TextField>
          <TextField label="생성일시" value={form.createdAt} disabled fullWidth />
          <TextField label="수정일시" value={form.updatedAt} disabled fullWidth />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => router.push("/medical_support/specimen/list")}
            >
              취소
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                if (!specimenExamId) return;

                dispatch(
                  SpecimenActions.updateSpecimenRequest({
                    specimenExamId,
                    form: {
                      testExecutionId: form.testExecutionId,
                      specimenType: form.specimenType,
                      specimenStatus: form.specimenStatus,
                      collectedAt: form.collectedAt,
                      performerId: form.performerId,
                      collectionSite: form.collectionSite,
                      recollectionYn: form.recollectionYn,
                      progressStatus: form.progressStatus,
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
