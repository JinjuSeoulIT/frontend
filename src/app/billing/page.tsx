import { cookies } from "next/headers";
import BillingDashboardClient from "@/app/billing/BillingDashboardClient";
import {
  ACCESS_TOKEN_COOKIE_NAME,
} from "@/lib/staff/staffServerApi";
import {
  fetchInitialBillingStats,
  type ServerBillingStats,
} from "@/lib/billing/billingServerApi";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value?.trim() ?? "";

  let initialStats: ServerBillingStats | null = null;
  let initialError: string | null = null;

  if (accessToken) {
    try {
      initialStats = await fetchInitialBillingStats(accessToken);
    } catch (error) {
      initialError =
        error instanceof Error ? error.message : "수납 통계 조회에 실패했습니다.";
    }
  }

  return (
<<<<<<< HEAD
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

            {statsLoading && <Typography>로딩 중...</Typography>}
            {statsError && <Typography color="error">{statsError}</Typography>}

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

                  <QuickActionCard
                    icon={<AccountBalanceWalletIcon />}
                    title="선수금 등록"
                    description="환자 선수금을 등록하고 목록을 조회합니다."
                    buttonText="바로가기"
                    onClick={() => router.push("/billing/deposits")}
                  />

                  <QuickActionCard
                    icon={<MonetizationOnOutlinedIcon />}
                    title="미수금 목록"
                    description="미수금 대상 청구를 확인하고 즉시 정산합니다."
                    buttonText="바로가기"
                    onClick={() => router.push("/billing/outstanding")}
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
                    isNew={hasNewReadyBadge}
                    onClick={handleReadyCardClick}
                  />

                  <StatCard
                    icon={<SyncIcon />}
                    title="부분 수납"
                    description="부분 수납 상태"
                    value={billingStats.confirmedCount}
                    onClick={() =>
                      router.push("/billing/list?status=CONFIRMED&partialOnly=true")
                    }
                  />

                  <StatCard
                    icon={<CheckCircleIcon />}
                    title={getBillingStatusLabel("PAID")}
                    description={getBillingStatusDescription("PAID")}
                    value={billingStats.paidCount}
                    onClick={() => router.push("/billing/list?status=PAID")}
                  />

                  <StatCard
                    icon={<ReceiptLongIcon />}
                    title="청구 확정"
                    description="완납 후 청구 확정 상태"
                    value={billingStats.finalConfirmedCount}
                    onClick={() =>
                      router.push("/billing/list?status=CONFIRMED&confirmedOnly=true")
                    }
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
=======
    <BillingDashboardClient
      initialStats={initialStats}
      initialError={initialError}
    />
>>>>>>> develop
  );
}
