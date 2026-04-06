"use client";

/* ================================
   수정: NEW 배지 상태 관리를 위해 useState 추가
================================ */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
  CircularProgress,
  Button,
  Chip, // 추가: NEW 배지 표시용
} from "@mui/material";

import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SyncIcon from "@mui/icons-material/Sync";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { fetchBillingStatsRequest } from "@/features/billing/billingSlice";
import {
  getBillingStatusLabel,
  getBillingStatusDescription,
} from "@/lib/billing/billingStatus";

export default function BillingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { billingStats, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const refundRate =
    billingStats && billingStats.totalCompletedAmount > 0
      ? Math.round(
          (billingStats.totalRefundedAmount /
            billingStats.totalCompletedAmount) *
            100
        )
      : 0;

  /* ================================
     추가: 신규 청구 대기 NEW 배지 판단용 storage key / polling 시간
  ================================= */
  const READY_SEEN_COUNT_STORAGE_KEY = "billing:readySeenCount";
  const BILLING_STATS_POLLING_MS = 10000;

  /* ================================
     추가: READY 카드 NEW 배지 표시 여부
  ================================= */
  const [hasNewReadyBadge, setHasNewReadyBadge] = useState(false);

  /* ================================
     수정: 최초 진입 + 주기적 polling 으로 stats 재조회
  ================================= */
  useEffect(() => {
    dispatch(fetchBillingStatsRequest());

    const intervalId = window.setInterval(() => {
      dispatch(fetchBillingStatsRequest());
    }, BILLING_STATS_POLLING_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dispatch]);

  /* ================================
     추가: 현재 READY 개수와 마지막 확인 개수를 비교해서
     신규 청구 대기 NEW 배지 표시 여부 결정
  ================================= */
  useEffect(() => {
    if (!billingStats) return;

    const savedSeenReadyCount = window.localStorage.getItem(
      READY_SEEN_COUNT_STORAGE_KEY
    );

    // 최초 진입 시에는 현재 값을 기준값으로 저장하고 NEW는 띄우지 않음
    if (savedSeenReadyCount === null) {
      window.localStorage.setItem(
        READY_SEEN_COUNT_STORAGE_KEY,
        String(billingStats.readyCount)
      );
      setHasNewReadyBadge(false);
      return;
    }

    const seenReadyCount = Number(savedSeenReadyCount);

    if (billingStats.readyCount > seenReadyCount) {
      setHasNewReadyBadge(true);
    } else {
      setHasNewReadyBadge(false);
    }
  }, [billingStats]);

  /* ================================
     추가: 신규 청구 대기 카드를 열어보면
     현재 READY 개수를 확인 완료 상태로 저장
  ================================= */
  const handleReadyCardClick = () => {
    if (billingStats) {
      window.localStorage.setItem(
        READY_SEEN_COUNT_STORAGE_KEY,
        String(billingStats.readyCount)
      );
    }

    setHasNewReadyBadge(false);
    router.push("/billing/list?status=READY");
  };

  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 3 }}>
        {billingStats && (
          <Card
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
              color: "white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                현재 총 순수납 (Net Revenue)
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {billingStats.totalNetAmount.toLocaleString()} 원
                </Typography>
              </Stack>

              <Typography sx={{ opacity: 0.85, mt: 1, fontSize: 14 }}>
                결제 금액에서 환불 금액을 차감한 실제 병원 매출 기준입니다.
              </Typography>

              <Box
                sx={{ mt: 3, display: "flex", alignItems: "center", gap: 3 }}
              >
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={80}
                    thickness={4}
                    sx={{ color: "rgba(255,255,255,0.2)" }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={refundRate}
                    size={80}
                    thickness={4}
                    sx={{
                      position: "absolute",
                      left: 0,
                      color:
                        refundRate > 50
                          ? "#ff6b6b"
                          : refundRate > 30
                          ? "#ffa726"
                          : "#66bb6a",
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {refundRate}%
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 14, opacity: 0.9 }}>
                    환불 비율
                  </Typography>
                  <Typography sx={{ fontSize: 13, opacity: 0.7 }}>
                    총 결제 대비 환불 비중
                  </Typography>
                </Box>
              </Box>

              <Stack
                direction="row"
                spacing={3}
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                    총 결제
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {billingStats.totalCompletedAmount.toLocaleString()} 원
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                    총 환불
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {billingStats.totalRefundedAmount.toLocaleString()} 원
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(245, 158, 11, 0.14)",
                  color: "#b45309",
                }}
              >
                <MonetizationOnOutlinedIcon />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
                  수납 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>
                  결제 / 환불 / 순수납 흐름을 관리합니다.
                </Typography>
              </Box>
            </Stack>

            {loading && <Typography>로딩 중...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            {billingStats && (
              <>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  빠른 작업
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 320px))",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <QuickActionCard
                    icon={<ReceiptLongIcon />}
                    title="청구 요청 생성"
                    description="신규 청구 요청 입력 화면으로 이동합니다."
                    buttonText="바로가기"
                    onClick={() => router.push("/billing/claims")}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  청구 상태
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <StatCard
                    icon={<HourglassEmptyIcon />}
                    title={getBillingStatusLabel("READY")}
                    description={getBillingStatusDescription("READY")}
                    value={billingStats.readyCount}
                    /* ================================
                       추가: NEW 배지 표시 여부 전달
                    ================================= */
                    isNew={hasNewReadyBadge}
                    /* ================================
                       수정: 클릭 시 확인 처리 후 이동
                    ================================= */
                    onClick={handleReadyCardClick}
                  />

                  <StatCard
                    icon={<SyncIcon />}
                    title={getBillingStatusLabel("CONFIRMED")}
                    description={getBillingStatusDescription("CONFIRMED")}
                    value={billingStats.confirmedCount}
                    onClick={() => router.push("/billing/list?status=CONFIRMED")}
                  />

                  <StatCard
                    icon={<CheckCircleIcon />}
                    title={getBillingStatusLabel("PAID")}
                    description={getBillingStatusDescription("PAID")}
                    value={billingStats.paidCount}
                    onClick={() => router.push("/billing/list?status=PAID")}
                  />

                  <StatCard
                    icon={<AccountBalanceWalletIcon />}
                    title="미수금"
                    description="미수금 상태"
                    value=" "
                    onClick={() => router.push("/billing/outstanding")}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  오늘 수납 흐름
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <StatCard
                    icon={<TrendingUpIcon />}
                    title="오늘 결제"
                    description="오늘 결제 상태"
                    value={`${billingStats.todayCompletedAmount.toLocaleString()} 원`}
                    color="#1976d2"
                  />
                  <StatCard
                    icon={<TrendingDownIcon />}
                    title="오늘 환불"
                    description="오늘 환불 상태"
                    value={`${billingStats.todayRefundedAmount.toLocaleString()} 원`}
                    color="#d32f2f"
                  />
                  <StatCard
                    icon={<AccountBalanceWalletIcon />}
                    title="오늘 순수납"
                    description="오늘 순수납 상태"
                    value={`${billingStats.todayNetAmount.toLocaleString()} 원`}
                    highlight
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  누적 수납 흐름
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 2,
                  }}
                >
                  <StatCard
                    icon={<TrendingUpIcon />}
                    title="총 결제"
                    description="총 결제 상태"
                    value={`${billingStats.totalCompletedAmount.toLocaleString()} 원`}
                    color="#1976d2"
                  />
                  <StatCard
                    icon={<TrendingDownIcon />}
                    title="총 환불"
                    description="총 환불 상태"
                    value={`${billingStats.totalRefundedAmount.toLocaleString()} 원`}
                    color="#d32f2f"
                  />
                  <StatCard
                    icon={<AccountBalanceWalletIcon />}
                    title="총 순수납"
                    description="총 순수납 상태"
                    value={`${billingStats.totalNetAmount.toLocaleString()} 원`}
                    highlight
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(123, 31, 162, 0.14)",
        boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.10)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(123, 31, 162, 0.10)",
                color: "#7b1fa2",
              }}
            >
              {icon}
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
                {description}
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
              onClick={onClick}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                color: "#7b1fa2",
                borderColor: "rgba(123, 31, 162, 0.3)",
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  title,
  description,
  value,
  highlight = false,
  color,
  onClick,
  isNew = false, // 추가: NEW 배지 표시 여부
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string | number;
  highlight?: boolean;
  color?: string;
  onClick?: () => void;
  isNew?: boolean; // 추가
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: 3,
        p: 1.5,
        height: "100%",
        background: highlight
          ? "linear-gradient(135deg, #e8f5e9, #c8e6c9)"
          : "white",
        border: highlight
          ? "2px solid #2e7d32"
          : "1px solid rgba(0,0,0,0.08)",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              backgroundColor: "rgba(0,0,0,0.05)",
            }}
          >
            {icon}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography
              variant="subtitle2"
              sx={{ color: "rgba(0,0,0,0.6)", fontWeight: 600 }}
            >
              {title}
            </Typography>

            {/* ================================
               추가: 신규 청구 감지 시 NEW 배지 표시
            ================================= */}
            {isNew && (
              <Chip
                label="NEW"
                size="small"
                color="error"
                sx={{
                  fontWeight: 800,
                  height: 22,
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            )}
          </Stack>
        </Stack>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mt: 2,
            color: highlight ? "#1b5e20" : color || "inherit",
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            mt: 1,
            color: "rgba(0,0,0,0.4)",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}