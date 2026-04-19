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
    <BillingDashboardClient
      initialStats={initialStats}
      initialError={initialError}
    />
  );
}
