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
import { PhysiologicalActions } from "@/features/medical_support/physiological/physiologicalSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type PhysiologicalEditForm = {
  physiologicalExamId: string;
  testExecutionId: string;
  examEquipmentId: string;
  rawData: string;
  reportDocId: string;
  performerId: string;
  progressStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const toPhysiologicalFormData = (
  item?: Partial<PhysiologicalEditForm>
): PhysiologicalEditForm => ({
  physiologicalExamId: item?.physiologicalExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  examEquipmentId: item?.examEquipmentId ?? "",
  rawData: item?.rawData ?? "",
  reportDocId: item?.reportDocId ?? "",
  performerId: item?.performerId ?? "",
  progressStatus: item?.progressStatus ?? "",
  status: item?.status ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

export default function PhysiologicalEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const physiologicalExamId = useMemo(() => {
    const value = params?.physiologicalExamId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<PhysiologicalEditForm | null>(null);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.physiologicals
  );

  useEffect(() => {
    if (!physiologicalExamId) return;
    dispatch(PhysiologicalActions.fetchPhysiologicalRequest(physiologicalExamId));
  }, [dispatch, physiologicalExamId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toPhysiologicalFormData();
    if (String(selected.physiologicalExamId) !== String(physiologicalExamId)) {
      return toPhysiologicalFormData();
    }

    return toPhysiologicalFormData({
      physiologicalExamId: String(selected.physiologicalExamId ?? ""),
      testExecutionId: String(selected.testExecutionId ?? ""),
      examEquipmentId: String(selected.examEquipmentId ?? ""),
      rawData: selected.rawData ?? "",
      reportDocId: String(selected.reportDocId ?? ""),
      performerId: String(selected.performerId ?? ""),
      progressStatus: selected.progressStatus ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, selected, physiologicalExamId]);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("생리 기능 검사가 수정되었습니다.");
    dispatch(PhysiologicalActions.resetUpdateSuccess());
    router.push("/medical_support/physiological/list");
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  if (loading && !form.physiologicalExamId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 800 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          생리 기능 검사 수정
        </Typography>

        <Stack spacing={2}>
          <TextField label="생리기능검사아이디" value={form.physiologicalExamId} disabled fullWidth />
          <TextField
            label="검사수행아이디"
            value={form.testExecutionId}
            onChange={(e) => setDraftForm({ ...form, testExecutionId: e.target.value })}
            fullWidth
          />
          <TextField
            label="검사장비아이디"
            value={form.examEquipmentId}
            onChange={(e) => setDraftForm({ ...form, examEquipmentId: e.target.value })}
            fullWidth
          />
          <TextField
            label="원본데이터"
            value={form.rawData}
            onChange={(e) => setDraftForm({ ...form, rawData: e.target.value })}
            fullWidth
          />
          <TextField
            label="리포트문서아이디"
            value={form.reportDocId}
            onChange={(e) => setDraftForm({ ...form, reportDocId: e.target.value })}
            fullWidth
          />
          <TextField
            label="담당자아이디"
            value={form.performerId}
            onChange={(e) => setDraftForm({ ...form, performerId: e.target.value })}
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
              onClick={() => router.push("/medical_support/physiological/list")}
            >
              취소
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                if (!physiologicalExamId) return;

                dispatch(
                  PhysiologicalActions.updatePhysiologicalRequest({
                    physiologicalExamId,
                    form: {
                      testExecutionId: form.testExecutionId,
                      examEquipmentId: form.examEquipmentId,
                      rawData: form.rawData,
                      reportDocId: form.reportDocId,
                      performerId: form.performerId,
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
