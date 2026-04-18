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
import { PathologyActions } from "@/features/medical_support/pathology/pathologySlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type PathologyEditForm = {
  pathologyExamId: string;
  testExecutionId: string;
  detailCode: string;
  patientId: string;
  patientName: string;
  departmentName: string;
  specimenId: string;
  resultSummary: string;
  reportDocId: string;
  tissueStatus: string;
  tissueSite: string;
  tissueType: string;
  collectionMethod: string;
  collectedAt: string;
  performerId: string;
  performerName: string;
  reexamYn: string;
  progressStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const PATHOLOGY_PROGRESS_STATUS_OPTIONS = [
  { value: "WAITING", label: "대기중" },
  { value: "IN_PROGRESS", label: "검사중" },
];

const ACTIVE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성화" },
];

const YES_NO_OPTIONS = [
  { value: "Y", label: "예" },
  { value: "N", label: "아니오" },
];

const toDateTimeInputValue = (value?: string | null) => {
  const normalized = value?.trim();
  if (!normalized) return "";
  return normalized.replace(" ", "T").slice(0, 16);
};

const toNullableText = (value: string) => {
  const normalized = value.trim();
  return normalized ? normalized : null;
};

const toNullableDateTime = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.length === 16 ? `${normalized}:00` : normalized;
};

const toPathologyFormData = (
  item?: Partial<PathologyEditForm>
): PathologyEditForm => ({
  pathologyExamId: item?.pathologyExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  detailCode: item?.detailCode ?? "",
  patientId: item?.patientId ?? "",
  patientName: item?.patientName ?? "",
  departmentName: item?.departmentName ?? "",
  specimenId: item?.specimenId ?? "",
  resultSummary: item?.resultSummary ?? "",
  reportDocId: item?.reportDocId ?? "",
  tissueStatus: item?.tissueStatus ?? "",
  tissueSite: item?.tissueSite ?? "",
  tissueType: item?.tissueType ?? "",
  collectionMethod: item?.collectionMethod ?? "",
  collectedAt: item?.collectedAt ?? "",
  performerId: item?.performerId ?? "",
  performerName: item?.performerName ?? "",
  reexamYn: item?.reexamYn ?? "",
  progressStatus: item?.progressStatus ?? "",
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
  const lastRequestedProgressStatusRef = useRef<string | null>(null);

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
      detailCode: selected.detailCode ?? "",
      patientId:
        selected.patientId === null || selected.patientId === undefined
          ? ""
          : String(selected.patientId),
      patientName: selected.patientName ?? "",
      departmentName: selected.departmentName ?? "",
      specimenId:
        selected.specimenId === null || selected.specimenId === undefined
          ? ""
          : String(selected.specimenId),
      resultSummary: selected.resultSummary ?? "",
      reportDocId:
        selected.reportDocId === null || selected.reportDocId === undefined
          ? ""
          : String(selected.reportDocId),
      tissueStatus: selected.tissueStatus ?? "",
      tissueSite: selected.tissueSite ?? "",
      tissueType: selected.tissueType ?? "",
      collectionMethod: selected.collectionMethod ?? "",
      collectedAt: toDateTimeInputValue(selected.collectedAt),
      performerId: String(selected.performerId ?? ""),
      performerName: selected.performerName ?? "",
      reexamYn: selected.reexamYn ?? "",
      progressStatus: selected.progressStatus ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, selected, pathologyExamId]);

  useEffect(() => {
    if (!updateSuccess) return;
    const nextPath =
      lastRequestedProgressStatusRef.current === "COMPLETED"
        ? "/medical_support/testResult/list?resultType=PATHOLOGY"
        : "/medical_support/pathology/list";
    lastRequestedProgressStatusRef.current = null;

    alert("병리 검사가 완료되었습니다.");
    dispatch(PathologyActions.resetUpdateSuccess());
    router.push(nextPath);
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  const handleUpdate = (nextProgressStatus: string) => {
    if (!pathologyExamId) return;

    lastRequestedProgressStatusRef.current = nextProgressStatus;

    dispatch(
      PathologyActions.updatePathologyRequest({
        pathologyExamId,
        form: {
          testExecutionId: form.testExecutionId,
          detailCode: form.detailCode,
          patientId: form.patientId.trim() ? Number(form.patientId) : null,
          patientName: form.patientName,
          departmentName: form.departmentName,
          specimenId: form.specimenId,
          resultSummary: form.resultSummary,
          reportDocId: form.reportDocId,
          tissueStatus: toNullableText(form.tissueStatus),
          tissueSite: toNullableText(form.tissueSite),
          tissueType: toNullableText(form.tissueType),
          collectionMethod: toNullableText(form.collectionMethod),
          collectedAt: toNullableDateTime(form.collectedAt),
          performerId: form.performerId,
          performerName: form.performerName,
          reexamYn: toNullableText(form.reexamYn),
          progressStatus: nextProgressStatus,
          status: form.status,
        },
      })
    );
  };

  if (loading && !form.pathologyExamId) {
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
              병리 검사 등록
            </Typography>
            <Typography color="text.secondary">
              검사 기본 정보와 조직 채취 정보를 확인하고, 수행 상태를 등록하세요.
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
              검사 기본 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              병리검사 식별 정보와 처방 검사명을 확인합니다.
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
                label="병리검사 ID"
                size="small"
                value={form.pathologyExamId}
                disabled
                fullWidth
              />

              <TextField
                label="검사수행 ID"
                size="small"
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
                label="검사코드"
                size="small"
                value={form.detailCode}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Box>
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
              조직 채취 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              조직상태, 부위, 종류와 채취 관련 정보를 등록합니다.
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
                label="조직상태"
                size="small"
                value={form.tissueStatus}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    tissueStatus: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="조직부위"
                size="small"
                value={form.tissueSite}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    tissueSite: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="조직종류"
                size="small"
                value={form.tissueType}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    tissueType: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="채취방법"
                size="small"
                value={form.collectionMethod}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    collectionMethod: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="채취일시"
                type="datetime-local"
                size="small"
                value={form.collectedAt}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    collectedAt: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                select
                label="재검여부"
                size="small"
                value={form.reexamYn}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    reexamYn: e.target.value,
                  })
                }
                fullWidth
              >
                <MenuItem value="">선택 안 함</MenuItem>
                {YES_NO_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
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
              진행 상태는 대기중 또는 검사중만 직접 변경하고, 완료/취소는 아래 버튼으로 처리합니다.
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
                value={
                  form.progressStatus === "COMPLETED" ||
                  form.progressStatus === "CANCELLED"
                    ? ""
                    : form.progressStatus
                }
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    progressStatus: e.target.value,
                  })
                }
                fullWidth
                helperText="대기중 또는 검사중만 직접 선택합니다."
              >
                {PATHOLOGY_PROGRESS_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="활성 여부"
                size="small"
                value={form.status}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    status: e.target.value,
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
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    performerId: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="검사수행자명"
                size="small"
                value={form.performerName}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    performerName: e.target.value,
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
              환자 식별 정보와 생성/수정 이력은 조회용입니다.
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
                    검사 완료 또는 취소는 아래 버튼으로 처리합니다.
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
