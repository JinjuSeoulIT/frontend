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
import { SpecimenActions } from "@/features/medical_support/specimen/specimenSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import { StaffIdNameSelectFields } from "@/components/medical_support/common/StaffIdNameSelectFields";
import type { StaffOption } from "@/lib/medical_support/staffLookupApi";
import { fetchStaffOptionsApi } from "@/lib/medical_support/staffLookupApi";
import {
  EXAM_PROGRESS_STATUS_MENU_OPTIONS,
  isExamProgressDropdownLocked,
  isExamProgressTerminalMenuItemDisabled,
} from "@/lib/medical_support/examProgressStatus";

type SpecimenEditForm = {
  specimenExamId: string;
  testExecutionId: string;
  detailCode: string;
  patientId: string;
  patientName: string;
  departmentName: string;
  specimenType: string;
  specimenStatus: string;
  collectedAt: string;
  performerId: string;
  performerName: string;
  collectionSite: string;
  recollectionYn: string;
  progressStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const ACTIVE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성화" },
];

const YES_NO_OPTIONS = [
  { value: "Y", label: "예" },
  { value: "N", label: "아니오" },
];

const toSpecimenFormData = (
  item?: Partial<SpecimenEditForm>
): SpecimenEditForm => ({
  specimenExamId: item?.specimenExamId ?? "",
  testExecutionId: item?.testExecutionId ?? "",
  detailCode: item?.detailCode ?? "",
  patientId: item?.patientId ?? "",
  patientName: item?.patientName ?? "",
  departmentName: item?.departmentName ?? "",
  specimenType: item?.specimenType ?? "",
  specimenStatus: item?.specimenStatus ?? "",
  collectedAt: item?.collectedAt ?? "",
  performerId: item?.performerId ?? "",
  performerName: item?.performerName ?? "",
  collectionSite: item?.collectionSite ?? "",
  recollectionYn: item?.recollectionYn ?? "",
  progressStatus: item?.progressStatus ?? "",
  status: item?.status ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

const toDateTimeInputValue = (value?: string | null) => {
  const normalized = value?.trim();
  if (!normalized) return "";
  return normalized.replace(" ", "T").slice(0, 16);
};

const toNullableDateTime = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.length === 16 ? `${normalized}:00` : normalized;
};

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
  const [performerStaffOptions, setPerformerStaffOptions] = useState<
    StaffOption[]
  >([]);
  const pendingSuccessMessageRef = useRef<string | null>(null);
  const pendingRedirectPathRef = useRef<string | null>(null);

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
      detailCode: selected.detailCode ?? "",
      patientId:
        selected.patientId === null || selected.patientId === undefined
          ? ""
          : String(selected.patientId),
      patientName: selected.patientName ?? "",
      departmentName: selected.departmentName ?? "",
      specimenType: selected.specimenType ?? "",
      specimenStatus: selected.specimenStatus ?? "",
      collectedAt: toDateTimeInputValue(selected.collectedAt),
      performerId: String(selected.performerId ?? ""),
      performerName: selected.performerName ?? "",
      collectionSite: selected.collectionSite ?? "",
      recollectionYn: selected.recollectionYn ?? "",
      progressStatus: selected.progressStatus ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [draftForm, selected, specimenExamId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const opts = await fetchStaffOptionsApi({
        role: "EXAM_PERFORMER",
        examType: "SPECIMEN",
      });
      if (!cancelled) {
        setPerformerStaffOptions(opts);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!updateSuccess) return;

    const nextPath = pendingRedirectPathRef.current;
    const message =
      pendingSuccessMessageRef.current ?? "검체 검사가 처리되었습니다.";
    pendingSuccessMessageRef.current = null;
    pendingRedirectPathRef.current = null;

    alert(message);
    dispatch(SpecimenActions.resetUpdateSuccess());
    if (nextPath) {
      router.push(nextPath);
    }
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  const handleUpdate = (nextProgressStatus: string) => {
    if (!specimenExamId) return;

    const normalizedProgressStatus = nextProgressStatus.trim().toUpperCase();
    const isCompleted = normalizedProgressStatus === "COMPLETED";
    pendingSuccessMessageRef.current = isCompleted
      ? "검체 검사가 완료되었습니다."
      : "검체 검사가 취소되었습니다.";
    pendingRedirectPathRef.current = isCompleted
      ? "/medical_support/testResult/list?resultType=SPECIMEN"
      : "/medical_support/specimen/list";

    dispatch(
      SpecimenActions.updateSpecimenRequest({
        specimenExamId,
        form: {
          testExecutionId: form.testExecutionId,
          detailCode: form.detailCode,
          patientId: form.patientId.trim() ? Number(form.patientId) : null,
          patientName: form.patientName,
          departmentName: form.departmentName,
          specimenType: form.specimenType,
          specimenStatus: form.specimenStatus,
          collectedAt: toNullableDateTime(form.collectedAt),
          performerId: form.performerId,
          performerName: form.performerName,
          collectionSite: form.collectionSite,
          recollectionYn: form.recollectionYn,
          progressStatus: nextProgressStatus,
          status: form.status,
        },
      })
    );
  };

  const handleToggleActiveStatus = () => {
    if (!specimenExamId) return;

    const nextStatus = form.status?.trim().toUpperCase() === "INACTIVE" ? "ACTIVE" : "INACTIVE";
    const actionLabel = nextStatus === "INACTIVE" ? "비활성화" : "활성화";
    pendingSuccessMessageRef.current = `검체 검사가 ${actionLabel}되었습니다.`;
    pendingRedirectPathRef.current = null;

    dispatch(
      SpecimenActions.updateSpecimenRequest({
        specimenExamId,
        form: {
          testExecutionId: form.testExecutionId,
          detailCode: form.detailCode,
          patientId: form.patientId.trim() ? Number(form.patientId) : null,
          patientName: form.patientName,
          departmentName: form.departmentName,
          specimenType: form.specimenType,
          specimenStatus: form.specimenStatus,
          collectedAt: toNullableDateTime(form.collectedAt),
          performerId: form.performerId,
          performerName: form.performerName,
          collectionSite: form.collectionSite,
          recollectionYn: form.recollectionYn,
          progressStatus: form.progressStatus,
          status: nextStatus,
        },
      })
    );
  };

  if (loading && !form.specimenExamId) {
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
              검체 검사 등록
            </Typography>
            <Typography color="text.secondary">
              검사 기본 정보와 검체 채취 정보를 확인하고 필요한 값을 등록하세요.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              color={form.status?.trim().toUpperCase() === "INACTIVE" ? "success" : "warning"}
              onClick={handleToggleActiveStatus}
              disabled={loading}
            >
              {form.status?.trim().toUpperCase() === "INACTIVE" ? "활성화" : "비활성화"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/medical_support/testResult/list")}
            >
              목록으로
            </Button>
          </Stack>
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  검사 식별 정보와 검사명을 관리합니다.
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
                  label="검체검사 ID"
                  size="small"
                  value={form.specimenExamId}
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

                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <TextField
                    label="검사코드"
                    size="small"
                    value={form.detailCode}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Box>
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
                value={form.progressStatus}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    progressStatus: e.target.value,
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

              <StaffIdNameSelectFields
                staffOptions={performerStaffOptions}
                staffId={form.performerId}
                fullName={form.performerName}
                onChange={(next) =>
                  setDraftForm({
                    ...form,
                    performerId: next.staffId,
                    performerName: next.fullName,
                  })
                }
                idLabel="검사수행자 ID"
                nameLabel="검사수행자명"
                disabled={loading}
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
              검체 상태 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              검체 종류와 검체 상태를 수정할 수 있습니다.
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
                label="검체종류"
                size="small"
                value={form.specimenType}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    specimenType: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="검체상태"
                size="small"
                value={form.specimenStatus}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    specimenStatus: e.target.value,
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
              검체 채취 정보
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              채취일시와 채취부위, 재채취여부를 수정할 수 있습니다.
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
                label="채취부위"
                size="small"
                value={form.collectionSite}
                onChange={(e) =>
                  setDraftForm({
                    ...form,
                    collectionSite: e.target.value,
                  })
                }
                fullWidth
              />

              <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                <TextField
                  select
                  label="재채취 여부"
                  size="small"
                  value={form.recollectionYn}
                  onChange={(e) =>
                    setDraftForm({
                      ...form,
                      recollectionYn: e.target.value,
                    })
                  }
                  fullWidth
                >
                  {YES_NO_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mt: 2,
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
