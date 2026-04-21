"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Box, CircularProgress, Stack, Typography, Button } from "@mui/material";
import { fetchBillsByPatientApi } from "@/lib/billing/billingApi";

const DEFAULT_RETURN = "/billing/deposits";

function LatestBillRedirectInner() {
  const params = useParams<{ patientId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = Number(params.patientId);
  useEffect(() => {
    if (!patientId || Number.isNaN(patientId)) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const bills = await fetchBillsByPatientApi(patientId);
        if (cancelled) return;
        if (bills.length === 0) return;
        const latest = [...bills].sort((a, b) => b.billId - a.billId)[0];
        const explicitReturn = searchParams.get("returnTo")?.trim();
        const returnTo =
          !explicitReturn || explicitReturn === DEFAULT_RETURN
            ? `/billing/deposits?billId=${latest.billId}`
            : explicitReturn;
        router.replace(
          `/billing/${latest.billId}?returnTo=${encodeURIComponent(returnTo)}`
        );
      } catch {
        // keep fallback UI
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [patientId, router, searchParams]);

  return (
    <MainLayout>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          청구 상세로 이동 중입니다
        </Typography>
        <Typography color="text.secondary">
          해당 환자의 청구가 없으면 환자 청구 목록을 이용해주세요.
        </Typography>
        <Button variant="outlined" onClick={() => router.push(`/billing/patients/${patientId}`)}>
          환자 청구 목록 보기
        </Button>
      </Stack>
    </MainLayout>
  );
}

export default function LatestBillRedirectPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <Box sx={{ minHeight: 260, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        </MainLayout>
      }
    >
      <LatestBillRedirectInner />
    </Suspense>
  );
}
