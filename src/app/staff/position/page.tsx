import { cookies } from "next/headers";
import StaffPositionClient from "@/app/staff/position/StaffPositionClient";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  fetchInitialPositionSummary,
} from "@/lib/staff/staffServerApi";
import type { PositionResponse } from "@/features/staff/position/positiontypes";

export const dynamic = "force-dynamic";

export default async function StaffPositionPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value?.trim() ?? "";

  let initialRows: PositionResponse[] = [];
  let initialError: string | null = null;

  if (accessToken) {
    try {
      initialRows = await fetchInitialPositionSummary(accessToken);
    } catch (error) {
      initialError = error instanceof Error ? error.message : "직책 목록 조회에 실패했습니다.";
    }
  }

  return <StaffPositionClient initialRows={initialRows} initialError={initialError} />;
}
