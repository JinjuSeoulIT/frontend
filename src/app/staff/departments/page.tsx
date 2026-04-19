import { cookies } from "next/headers";
import StaffDepartmentsClient from "@/app/staff/departments/StaffDepartmentsClient";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  fetchInitialStaffDepartments,
} from "@/lib/staff/staffServerApi";
import type { StaffDepartmentSummaryItem } from "@/lib/staff/staffSummaryApi";

export const dynamic = "force-dynamic";

export default async function StaffDepartmentsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value?.trim() ?? "";

  let initialRows: StaffDepartmentSummaryItem[] = [];
  let initialError: string | null = null;

  if (accessToken) {
    try {
      initialRows = await fetchInitialStaffDepartments(accessToken);
    } catch (error) {
      initialError = error instanceof Error ? error.message : "부서 목록 조회에 실패했습니다.";
    }
  }

  return <StaffDepartmentsClient initialRows={initialRows} initialError={initialError} />;
}
