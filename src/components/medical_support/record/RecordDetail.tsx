"use client";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Patient } from "@/features/patients/patientTypes";
import { RecActions } from "@/features/medical_support/record/recordSlice";
import type {
  RecordFormType,
} from "@/features/medical_support/record/recordTypes";
import type {
  AssessmentRes,
  VitalSignsRes,
} from "@/lib/clinical/clinicalVitalsApi";
import { fetchVitalsAndAssessmentWithMedicalSupport } from "@/lib/clinical/medicalSupportRecordBridge";
import { fetchClinicalApi } from "@/lib/clinical/visitApi";
import RecordVisitChartDialog from "@/components/medical_support/record/RecordVisitChartDialog";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";
import dayjs from "dayjs";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
};

const formatValue = (
  value?: string | number | null,
  unit?: string
): string | number => {
  if (value === null || value === undefined || value === "") return "-";
  return unit ? `${value} ${unit}` : value;
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography fontWeight={500}>{value ?? "-"}</Typography>
    </Box>
  );
}

function StatusChip({ status }: { status?: string | null }) {
  if (status === "ACTIVE") {
    return <Chip label="활성" color="success" size="small" />;
  }

  if (status === "INACTIVE") {
    return <Chip label="비활성화" color="default" size="small" />;
  }

  return <Chip label={status || "-"} color="default" size="small" />;
}

function buildChartPatient(record: RecordFormType): Patient | null {
  if (record.patientId == null) return null;

  return {
    patientId: record.patientId,
    name: record.patientName?.trim() || `환자 ${record.patientId}`,
  };
}

export default function RecordDetail() {
  const params = useParams<{ recordId?: string | string[] }>();
  const dispatch = useDispatch<AppDispatch>();

  const pendingStatusActionRef = useRef<"ACTIVE" | "INACTIVE" | null>(null);
  const [visitChartOpen, setVisitChartOpen] = useState(false);
  const [visitChartLoading, setVisitChartLoading] = useState(false);
  const [visitChartPatient, setVisitChartPatient] = useState<Patient | null>(
    null
  );
  const [visitChartVitals, setVisitChartVitals] =
    useState<VitalSignsRes | null>(null);
  const [visitChartAssessment, setVisitChartAssessment] =
    useState<AssessmentRes | null>(null);

  const recordId: string | undefined =
    typeof params?.recordId === "string"
      ? params.recordId
      : Array.isArray(params?.recordId)
        ? params.recordId[0]
        : undefined;

  const {
    selected: record,
    loading,
    error,
    statusToggleSuccess,
  } = useSelector((state: RootState) => state.records);

  useEffect(() => {
    if (!recordId) return;
    dispatch(RecActions.fetchRecordRequest(recordId));
  }, [dispatch, recordId]);

  useEffect(() => {
    if (!statusToggleSuccess) return;

    if (pendingStatusActionRef.current === "INACTIVE") {
      window.alert("간호 기록이 비활성화되었습니다.");
    } else if (pendingStatusActionRef.current === "ACTIVE") {
      window.alert("간호 기록이 활성화되었습니다.");
    }

    pendingStatusActionRef.current = null;
    dispatch(RecActions.resetStatusToggleSuccess());

    if (recordId) {
      dispatch(RecActions.fetchRecordRequest(recordId));
    }
  }, [dispatch, recordId, statusToggleSuccess]);

  useEffect(() => {
    if (!error || !record?.recordId || !pendingStatusActionRef.current) return;

    if (error === "Network Error") {
      window.alert("서버에 연결할 수 없습니다.\n잠시 후 다시 시도해주세요.");
    } else {
      window.alert("상태 변경에 실패했습니다.\n다시 시도해주세요.");
    }

    pendingStatusActionRef.current = null;
  }, [error, record]);

  const handleToggleStatus = () => {
    if (!recordId || !record?.recordId) return;

    const isActive = record.status === "ACTIVE";
    const nextStatus = isActive ? "INACTIVE" : "ACTIVE";
    const confirmMessage = isActive
      ? "정말 비활성화하시겠습니까?"
      : "정말 활성화하시겠습니까?";

    if (!window.confirm(confirmMessage)) return;

    pendingStatusActionRef.current = nextStatus;

    dispatch(
      RecActions.toggleRecordStatusRequest({
        recordId,
        status: nextStatus,
      })
    );
  };

  const handleOpenVisitChart = async () => {
    if (!record || visitChartLoading) return;

    if (record.patientId == null || record.receptionId == null) {
      window.alert("진료 차트를 조회할 방문 정보가 없습니다.");
      return;
    }

    setVisitChartLoading(true);
    setVisitChartVitals(null);
    setVisitChartAssessment(null);

    try {
      const visits = await fetchClinicalApi();
      const matchedVisit = visits
        .filter(
          (visit) =>
            visit.patientId === record.patientId &&
            visit.receptionId != null &&
            Number(visit.receptionId) === Number(record.receptionId)
        )
        .sort(
          (a, b) => (b.clinicalId ?? b.id ?? 0) - (a.clinicalId ?? a.id ?? 0)
        )[0];

      if (!matchedVisit) {
        window.alert("동일 방문의 진료 차트를 찾을 수 없습니다.");
        return;
      }

      const visitId = matchedVisit.clinicalId ?? matchedVisit.id;
      if (visitId == null) {
        window.alert("동일 방문의 진료 차트를 찾을 수 없습니다.");
        return;
      }

      const chartData = await fetchVitalsAndAssessmentWithMedicalSupport(
        visitId,
        record.receptionId
      );

      setVisitChartPatient(buildChartPatient(record));
      setVisitChartVitals(chartData.vitals);
      setVisitChartAssessment(chartData.assessment);
      setVisitChartOpen(true);
    } catch (chartError) {
      console.error("[medical_support/record/detail] visit chart fetch failed", chartError);
      window.alert("진료 차트 조회 중 오류가 발생했습니다.");
    } finally {
      setVisitChartLoading(false);
    }
  };

  if (!recordId) {
    return (
      <Typography p={4} color="error">
        recordId가 없습니다.
      </Typography>
    );
  }

  if (loading && !record?.recordId) {
    return (
      <Box p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !record?.recordId) {
    return (
      <Typography p={4} color="error">
        {error}
      </Typography>
    );
  }

  if (!record || !record.recordId) {
    return <Typography p={4}>데이터를 찾을 수 없습니다.</Typography>;
  }

  const isActive = record.status === "ACTIVE";

  return (
    <Box
      sx={{
        px: 2,
        py: 3,
        maxWidth: 1000,
        mx: "auto",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            backgroundColor: "#fafafa",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                간호 기록 상세
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                간호 기록 정보를 확인하고 수정 또는 상태 변경을 할 수 있습니다.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                onClick={() => void handleOpenVisitChart()}
                disabled={visitChartLoading}
              >
                {visitChartLoading ? "조회 중..." : "진료 차트"}
              </Button>

              <Link href="/medical_support/record/list">
                <Button variant="outlined" size="small">
                  목록으로
                </Button>
              </Link>

              <Link href={`/medical_support/record/edit/${recordId}`}>
                <Button variant="outlined" size="small">
                  수정
                </Button>
              </Link>

              <Button
                variant="contained"
                color={isActive ? "error" : "primary"}
                size="small"
                onClick={handleToggleStatus}
                disabled={loading}
              >
                {loading
                  ? "처리 중..."
                  : isActive
                    ? "비활성화"
                    : "활성화"}
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                기본 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                환자 정보와 기록 기본 사항을 확인할 수 있습니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="환자명" value={record.patientName || "-"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="간호사명" value={record.nurseName || "-"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="환자 ID" value={record.patientId ?? "-"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="간호사 ID" value={record.nursingId || "-"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="진료과" value={record.departmentName || "-"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="생성일시"
                    value={formatDateTime(record.createdAt ?? record.recordedAt)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="접수 ID" value={record.receptionId ?? "-"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 500 }}
                    >
                      활성 여부
                    </Typography>
                    <StatusChip status={record.status} />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                신체 정보 및 활력징후
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                키, 몸무게, 혈압, 맥박, 호흡수, 체온, 산소포화도 등을 확인할 수
                있습니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="키" value={formatValue(record.heightCm, "cm")} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="몸무게"
                    value={formatValue(record.weightKg, "kg")}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="수축기 혈압"
                    value={formatValue(record.systolicBp, "mmHg")}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="이완기 혈압"
                    value={formatValue(record.diastolicBp, "mmHg")}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="맥박" value={formatValue(record.pulse, "bpm")} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="호흡수"
                    value={formatValue(record.respiration, "rpm")}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="체온"
                    value={formatValue(record.temperature, "℃")}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="산소포화도"
                    value={formatValue(record.spo2, "%")}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="통증 점수" value={record.painScore ?? "-"} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="의식 수준"
                    value={record.consciousnessLevel || "-"}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                간호 평가 및 상태 정보
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                초기 문진, 과거력, 관찰 내용, 수정일시를 확인할 수 있습니다.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <DetailItem
                    label="초기 문진 요약"
                    value={record.initialAssessment || "-"}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DetailItem label="과거력" value={record.pastMedicalHistory || "-"} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DetailItem
                    label="간호 관찰 내용"
                    value={record.observation || "-"}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem
                    label="수정일시"
                    value={formatDateTime(record.updatedAt)}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <RecordVisitChartDialog
        open={visitChartOpen}
        title="진료 차트"
        subtitle="동일 방문 진료기록"
        patient={visitChartPatient}
        vitals={visitChartVitals}
        assessment={visitChartAssessment}
        loading={visitChartLoading}
        onClose={() => setVisitChartOpen(false)}
      />
    </Box>
  );
}
