import { cookies } from "next/headers";
import CodeAdminClient from "@/app/admin/codes/CodeAdminClient";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/staff/staffServerApi";
import {
  fetchInitialCodeDetails,
  fetchInitialCodeGroups,
} from "@/lib/admin/codeAdminServerApi";
import type { CodeDetailItem, CodeGroupItem } from "@/lib/admin/codeAdminApi";

export const dynamic = "force-dynamic";

export default async function CodeAdminPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value?.trim() ?? "";

  let initialGroups: CodeGroupItem[] = [];
  let initialDetails: CodeDetailItem[] = [];
  let initialError: string | null = null;

  if (accessToken) {
    try {
      [initialGroups, initialDetails] = await Promise.all([
        fetchInitialCodeGroups(accessToken, false),
        fetchInitialCodeDetails(accessToken, undefined, false),
      ]);
    } catch (error) {
      initialError =
        error instanceof Error ? error.message : "코드 관리 초기 조회에 실패했습니다.";
    }
  }

  return (
    <CodeAdminClient
      initialGroups={initialGroups}
      initialDetails={initialDetails}
      initialError={initialError}
    />
  );
}
