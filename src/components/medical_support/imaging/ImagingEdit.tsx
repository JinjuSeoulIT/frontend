"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ImagingActions } from "@/features/medical_support/imaging/imagingSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import {
  EXAM_PROGRESS_STATUS_MENU_OPTIONS,
  isExamProgressDropdownLocked,
  isExamProgressTerminalMenuItemDisabled,
} from "@/lib/medical_support/examProgressStatus";

type ImagingEditForm = {
  imagingExamId: string;
  testExecutionId: string;
  detailCode: string;
  patientId: string;
  patientName: string;
  departmentName: string;
  performerId: string;
  performerName: string;
  progressStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const ACTIVE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성화" },
];

const toImagingFormData = (
  item?: Partial<ImagingEditForm>
): ImagingEditForm => ({
  imagingExamId: item?.imagingExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  detailCode: item?.detailCode ?? "",
  patientId: item?.patientId ?? "",
  patientName: item?.patientName ?? "",
  departmentName: item?.departmentName ?? "",
  performerId: item?.performerId ?? "",
  performerName: item?.performerName ?? "",
  progressStatus: item?.progressStatus ?? "",
  status: item?.status ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

export default function ImagingEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const imagingExamId = useMemo(() => {
    const value = params?.imagingExamId;
    if (Array.isArray(value)) {
      return value[0];
    }

    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<ImagingEditForm | null>(null);
  const lastRequestedProgressStatusRef = useRef<string | null>(null);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.imagings
  );

  useEffect(() => {
    if (!imagingExamId) {
      return;
    }

    dispatch(ImagingActions.fetchImagingRequest(imagingExamId));
  }, [dispatch, imagingExamId]);

  const form = useMemo(() => {
    if (draftForm) {
      return draftForm;
    }

    if (!selected) {
      return toImagingFormData();
    }

    if (String(selected.imagingExamId) !== String(imagingExamId)) {
      return toImagingFormData();
    }

    return toImagingFormData({
      imagingExamId: String(selected.imagingExamId ?? ""),
      testExecutionId: String(selected.testExecutionId ?? ""),
      detailCode: selected.detailCode ?? "",
      patientId:
        selected.patientId === null || selected.patientId === undefined
          ? ""
          : String(selected.patientId),
      patientName: selected.patientName ?? "",
      departmentName: selected.departmentName ?? "",
      performerId: String(selected.performerId ?? ""),
      performerName: selected.performerName ?? "",
      progressStatus: selected.progressStatus ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, imagingExamId, selected]);

  useEffect(() => {
    if (!updateSuccess) {
      return;
    }

    const nextPath =
      lastRequestedProgressStatusRef.current === "COMPLETED"
        ? "/medical_support/testResult/list?resultType=IMAGING"
        : "/medical_support/imaging/list";

    lastRequestedProgressStatusRef.current = null;

    alert("영상 검사가 완료되었습니다.");
    dispatch(ImagingActions.resetUpdateSuccess());
    router.push(nextPath);
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) {
      return;
    }

    alert(error);
  }, [error]);

  const handleUpdate = (nextProgressStatus: string) => {
    if (!imagingExamId) {
      return;
    }

    lastRequestedProgressStatusRef.current = nextProgressStatus;

    dispatch(
      ImagingActions.updateImagingRequest({
        imagingExamId,
        form: {
          testExecutionId: form.testExecutionId,
          detailCode: form.detailCode,
          patientId: form.patientId.trim() ? Number(form.patientId) : null,
          patientName: form.patientName,
          departmentName: form.departmentName,
          performerId: form.performerId,
          performerName: form.performerName,
          progressStatus: nextProgressStatus,
          status: form.status,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        },
      })
    );
  };

  if (loading && !form.imagingExamId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      <Box sx={{ maxWidth: 1120, mx: "auto", pb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          gap={1.5}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              영상 검사 등록
            </Typography>
            <Typography color="text.secondary">
              검사 기본 정보와 수행 상태를 확인하고 필요한 값을 등록하세요.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => router.push("/medical_support/testResult/list")}
          >
            목록으로
          </Button>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  검사 기본 정보
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  검사 식별 정보와 기본 코드를 관리합니다.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.75,
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                }}
              >
                <TextField
                  label="영상검사 ID"
                  size="small"
                  value={form.imagingExamId}
                  disabled
                  fullWidth
                />

                <TextField
                  label="검사수행 ID"
                  size="small"
                  value={form.testExecutionId}
                  onChange={(event) =>
                    setDraftForm({
                      ...form,
                      testExecutionId: event.target.value,
                    })
                  }
                  fullWidth
                />

                <TextField
                  label="검사코드"
                  size="small"
                  value={form.detailCode}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2,
              borderBottom: "1px solid",
              borderColor: "grey.200",
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              수행 상태 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              진행 상태는 대기중 또는 검사중만 직접 변경하고 완료/취소는 아래 버튼으로 처리합니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gap: 1.75,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
              }}
            >
              <TextField
                select
                label="진행상태"
                size="small"
                value={form.progressStatus}
                onChange={(event) =>
                  setDraftForm({
                    ...form,
                    progressStatus: event.target.value,
                  })
                }
                fullWidth
                disabled={loading || isExamProgressDropdownLocked(form.progressStatus)}
                helperText="대기중 또는 검사중만 직접 선택합니다."
              >
                {EXAM_PROGRESS_STATUS_MENU_OPTIONS.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    disabled={isExamProgressTerminalMenuItemDisabled(form.progressStatus, option.value)}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="활성 여부"
                size="small"
                value={form.status}
                onChange={(event) =>
                  setDraftForm({
                    ...form,
                    status: event.target.value,
                  })
                }
                fullWidth
              >
                {ACTIVE_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="검사수행자 ID"
                size="small"
                value={form.performerId}
                onChange={(event) =>
                  setDraftForm({
                    ...form,
                    performerId: event.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="검사수행자명"
                size="small"
                value={form.performerName}
                onChange={(event) =>
                  setDraftForm({
                    ...form,
                    performerName: event.target.value,
                  })
                }
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2,
              borderBottom: "1px solid",
              borderColor: "grey.200",
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              환자 및 이력 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              환자 연계 정보와 생성/수정 이력을 조회합니다.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gap: 1.75,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
              }}
            >
              <TextField
                label="환자명"
                size="small"
                value={form.patientName}
                disabled
                fullWidth
              />
              <TextField
                label="환자 ID"
                size="small"
                value={form.patientId}
                disabled
                fullWidth
              />
              <TextField
                label="진료과"
                size="small"
                value={form.departmentName}
                disabled
                fullWidth
              />
              <TextField
                label="생성일시"
                size="small"
                value={form.createdAt}
                disabled
                fullWidth
              />
              <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                <TextField
                  label="수정일시"
                  size="small"
                  value={form.updatedAt}
                  disabled
                  fullWidth
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box
          sx={{
            position: "sticky",
            bottom: 16,
            zIndex: 20,
            mt: 2,
          }}
        >
          <Card
            elevation={6}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
            }}
          >
            <CardContent
              sx={{
                px: { xs: 2, md: 2.5 },
                py: 1.5,
                "&:last-child": { pb: 1.5 },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                gap={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    검사 상태 처리
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    검사의 완료 또는 취소는 아래 버튼으로 처리합니다.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => handleUpdate("CANCELLED")}
                    disabled={loading || form.progressStatus === "CANCELLED"}
                  >
                    검사 취소
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => handleUpdate("COMPLETED")}
                    disabled={loading || form.progressStatus === "COMPLETED"}
                  >
                    {loading ? "처리 중..." : "검사 완료"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </main>
  );
}
