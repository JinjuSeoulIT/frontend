"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { EndoscopyActions } from "@/features/medical_support/endoscopy/endoscopySlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type EndoscopyEditForm = {
  endoscopyExamId: string;
  testExecutionId: string;
  detailCode: string;
  patientId: string;
  patientName: string;
  departmentName: string;
  procedureRoom: string;
  equipment: string;
  sedationYn: string;
  performerId: string;
  performerName: string;
  procedureAt: string;
  progressStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const ENDOSCOPY_PROGRESS_STATUS_OPTIONS = [
  { value: "WAITING", label: "대기중" },
  { value: "IN_PROGRESS", label: "검사중" },
];

const ACTIVE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성화" },
];

const SEDATION_OPTIONS = [
  { value: "Y", label: "예" },
  { value: "N", label: "아니오" },
];

const toEndoscopyFormData = (
  item?: Partial<EndoscopyEditForm>
): EndoscopyEditForm => ({
  endoscopyExamId: item?.endoscopyExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  detailCode: item?.detailCode ?? "",
  patientId: item?.patientId ?? "",
  patientName: item?.patientName ?? "",
  departmentName: item?.departmentName ?? "",
  procedureRoom: item?.procedureRoom ?? "",
  equipment: item?.equipment ?? "",
  sedationYn: item?.sedationYn ?? "",
  performerId: item?.performerId ?? "",
  performerName: item?.performerName ?? "",
  procedureAt: item?.procedureAt ?? "",
  progressStatus: item?.progressStatus ?? "",
  status: item?.status ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

const formatProgressStatus = (value: string) => {
  switch (value) {
    case "WAITING":
      return "대기중";
    case "IN_PROGRESS":
      return "검사중";
    case "COMPLETED":
      return "검사완료";
    case "CANCELLED":
      return "취소";
    default:
      return displayValue(value);
  }
};

const formatActiveStatus = (value: string) => {
  switch (value) {
    case "ACTIVE":
      return "활성";
    case "INACTIVE":
      return "비활성화";
    default:
      return displayValue(value);
  }
};

const formatSedationYn = (value: string) => {
  switch (value) {
    case "Y":
      return "예";
    case "N":
      return "아니오";
    default:
      return displayValue(value);
  }
};

const getProgressStatusColor = (
  value: string
): "default" | "warning" | "info" | "success" | "error" => {
  switch (value) {
    case "WAITING":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const getActiveStatusColor = (
  value: string
): "default" | "success" | "error" => {
  switch (value) {
    case "ACTIVE":
      return "success";
    case "INACTIVE":
      return "error";
    default:
      return "default";
  }
};

type SummaryItemProps = {
  label: string;
  value: React.ReactNode;
  truncate?: boolean;
};

function SummaryItem({ label, value, truncate = false }: SummaryItemProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>

      {typeof value === "string" || typeof value === "number" ? (
        <Typography
          variant="body2"
          fontWeight={700}
          sx={
            truncate
              ? {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }
              : undefined
          }
        >
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  );
}

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
  const lastRequestedProgressStatusRef = useRef<string | null>(null);

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
      detailCode: selected.detailCode ?? "",
      patientId:
        selected.patientId === null || selected.patientId === undefined
          ? ""
          : String(selected.patientId),
      patientName: selected.patientName ?? "",
      departmentName: selected.departmentName ?? "",
      procedureRoom: selected.procedureRoom ?? "",
      equipment: selected.equipment ?? "",
      sedationYn: selected.sedationYn ?? "",
      performerId: String(selected.performerId ?? ""),
      performerName: selected.performerName ?? "",
      procedureAt: selected.procedureAt ?? "",
      progressStatus: selected.progressStatus ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, selected, endoscopyExamId]);

  useEffect(() => {
    if (!updateSuccess) return;

    const nextPath =
      lastRequestedProgressStatusRef.current === "COMPLETED"
        ? "/medical_support/testResult/list?resultType=ENDOSCOPY"
        : "/medical_support/endoscopy/list";
    lastRequestedProgressStatusRef.current = null;

    alert("내시경 검사가 완료되었습니다.");
    dispatch(EndoscopyActions.resetUpdateSuccess());
    router.push(nextPath);
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  const handleUpdate = (nextProgressStatus: string) => {
    if (!endoscopyExamId) return;

    lastRequestedProgressStatusRef.current = nextProgressStatus;

    dispatch(
      EndoscopyActions.updateEndoscopyRequest({
        endoscopyExamId,
        form: {
          testExecutionId: form.testExecutionId,
          patientId: form.patientId.trim() ? Number(form.patientId) : null,
          patientName: form.patientName,
          departmentName: form.departmentName,
          procedureRoom: form.procedureRoom,
          equipment: form.equipment,
          sedationYn: form.sedationYn,
          performerId: form.performerId,
          performerName: form.performerName,
          procedureAt: form.procedureAt,
          progressStatus: nextProgressStatus,
          status: form.status,
        },
      })
    );
  };

  if (loading && !form.endoscopyExamId) {
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
              내시경 검사 등록
            </Typography>
            <Typography color="text.secondary">
              환자 정보와 검사 상태를 먼저 확인하고, 시술 및 수행 정보를 등록하세요.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => router.push("/medical_support/endoscopy/list")}
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
          <CardContent sx={{ px: { xs: 2, md: 3 }, py: 2.25 }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                gap={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: 0.8 }}
                  >
                    환자 정보
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    <Typography variant="h6" fontWeight={800}>
                      {displayValue(form.patientName)}
                    </Typography>
                    <Chip
                      label={`환자 ID ${displayValue(form.patientId)}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={displayValue(form.departmentName)}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <Chip
                    label={formatProgressStatus(form.progressStatus)}
                    color={getProgressStatusColor(form.progressStatus)}
                  />
                  <Chip
                    label={formatActiveStatus(form.status)}
                    color={getActiveStatusColor(form.status)}
                    variant="outlined"
                  />
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.75,
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    lg: "repeat(5, minmax(0, 1fr))",
                  },
                }}
              >
                <SummaryItem
                  label="내시경검사 ID"
                  value={displayValue(form.endoscopyExamId)}
                />
                <SummaryItem
                  label="검사수행 ID"
                  value={displayValue(form.testExecutionId)}
                  truncate
                />
                <SummaryItem
                  label="검사수행자 ID"
                  value={displayValue(form.performerId)}
                />
                <SummaryItem
                  label="검사수행자명"
                  value={displayValue(form.performerName)}
                />
                <SummaryItem
                  label="진정 여부"
                  value={formatSedationYn(form.sedationYn)}
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
              수행 정보
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
                {ENDOSCOPY_PROGRESS_STATUS_OPTIONS.map((option) => (
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
                label="검사명"
                size="small"
                value={form.detailCode}
                fullWidth
                InputProps={{ readOnly: true }}
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
              시술 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              내시경 시술과 관련된 주요 정보를 수정할 수 있습니다.
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
                label="시술실"
                size="small"
                value={form.procedureRoom}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    procedureRoom: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="장비"
                size="small"
                value={form.equipment}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    equipment: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                select
                label="진정 여부"
                size="small"
                value={form.sedationYn}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    sedationYn: e.target.value,
                  })
                }
                fullWidth
              >
                {SEDATION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="시술일시"
                size="small"
                value={form.procedureAt}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    procedureAt: e.target.value,
                  })
                }
                fullWidth
                helperText="백엔드 포맷에 맞는 일시 값을 입력하세요."
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
              참고 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              조회용 정보입니다.
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
