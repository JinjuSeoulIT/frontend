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
import { EndoscopyActions } from "@/features/medical_support/endoscopy/endoscopySlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type EndoscopyEditForm = {
  endoscopyExamId: string;
  testExecutionId: string;
  procedureRoom: string;
  equipment: string;
  sedationYn: string;
  performerId: string;
  procedureAt: string;
  progressStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const toEndoscopyFormData = (
  item?: Partial<EndoscopyEditForm>
): EndoscopyEditForm => ({
  endoscopyExamId: item?.endoscopyExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  procedureRoom: item?.procedureRoom ?? "",
  equipment: item?.equipment ?? "",
  sedationYn: item?.sedationYn ?? "",
  performerId: item?.performerId ?? "",
  procedureAt: item?.procedureAt ?? "",
  progressStatus: item?.progressStatus ?? "",
  status: item?.status ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

export default function EndoscopyEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const endoscopyExamId = useMemo(() => {
    const value = params?.endoscopyExamId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<EndoscopyEditForm | null>(null);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.endoscopies
  );

  useEffect(() => {
    if (!endoscopyExamId) return;
    dispatch(EndoscopyActions.fetchEndoscopyRequest(endoscopyExamId));
  }, [dispatch, endoscopyExamId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toEndoscopyFormData();
    if (String(selected.endoscopyExamId) !== String(endoscopyExamId)) {
      return toEndoscopyFormData();
    }

    return toEndoscopyFormData({
      endoscopyExamId: String(selected.endoscopyExamId ?? ""),
      testExecutionId: String(selected.testExecutionId ?? ""),
      procedureRoom: selected.procedureRoom ?? "",
      equipment: selected.equipment ?? "",
      sedationYn: selected.sedationYn ?? "",
      performerId: String(selected.performerId ?? ""),
      procedureAt: selected.procedureAt ?? "",
      progressStatus: selected.progressStatus ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, selected, endoscopyExamId]);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("내시경 검사가 수정되었습니다.");
    dispatch(EndoscopyActions.resetUpdateSuccess());
    router.push("/medical_support/endoscopy/list");
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  if (loading && !form.endoscopyExamId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 800 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          내시경 검사 수정
        </Typography>

        <Stack spacing={2}>
          <TextField label="내시경검사아이디" value={form.endoscopyExamId} disabled fullWidth />
          <TextField
            label="검사수행아이디"
            value={form.testExecutionId}
            onChange={(e) => setDraftForm({ ...form, testExecutionId: e.target.value })}
            fullWidth
          />
          <TextField
            label="시술실"
            value={form.procedureRoom}
            onChange={(e) => setDraftForm({ ...form, procedureRoom: e.target.value })}
            fullWidth
          />
          <TextField
            label="장비"
            value={form.equipment}
            onChange={(e) => setDraftForm({ ...form, equipment: e.target.value })}
            fullWidth
          />
          <TextField
            label="진정여부"
            value={form.sedationYn}
            onChange={(e) => setDraftForm({ ...form, sedationYn: e.target.value })}
            helperText="Y 또는 N"
            fullWidth
          />
          <TextField
            label="담당자아이디"
            value={form.performerId}
            onChange={(e) => setDraftForm({ ...form, performerId: e.target.value })}
            fullWidth
          />
          <TextField
            label="시술일시"
            value={form.procedureAt}
            onChange={(e) => setDraftForm({ ...form, procedureAt: e.target.value })}
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
              onClick={() => router.push("/medical_support/endoscopy/list")}
            >
              취소
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                if (!endoscopyExamId) return;

                dispatch(
                  EndoscopyActions.updateEndoscopyRequest({
                    endoscopyExamId,
                    form: {
                      testExecutionId: form.testExecutionId,
                      procedureRoom: form.procedureRoom,
                      equipment: form.equipment,
                      sedationYn: form.sedationYn,
                      performerId: form.performerId,
                      procedureAt: form.procedureAt,
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
