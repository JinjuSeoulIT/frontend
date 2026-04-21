import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export type StaffOption = {
  staffId: string;
  fullName: string;
  dutyCode: string;
};

export type FetchStaffOptionsParams = {
  role: string;
  examType?: string;
  keyword?: string;
  /** 고정 20 권장 — 기본값 20 */
  limit?: number;
};

const DEFAULT_LIMIT = 20;

export async function fetchStaffOptionsApi(
  params: FetchStaffOptionsParams
): Promise<StaffOption[]> {
  const limit = params.limit ?? DEFAULT_LIMIT;

  try {
    const res = await api.get<
      ApiResponse<Array<{ staffId: string; fullName: string; dutyCode: string }>>
    >("/api/staffs/options", {
      params: {
        role: params.role,
        ...(params.examType?.trim()
          ? { examType: params.examType.trim() }
          : {}),
        ...(params.keyword?.trim()
          ? { keyword: params.keyword.trim() }
          : {}),
        limit,
      },
    });

    const data = res.data;
    if (!data?.success || !Array.isArray(data.result)) {
      console.error(
        "[staffLookupApi] Staff options request failed:",
        data?.message ?? res.statusText
      );
      return [];
    }

    return data.result.map((row) => ({
      staffId: String(row.staffId ?? "").trim(),
      fullName: String(row.fullName ?? "").trim(),
      dutyCode: String(row.dutyCode ?? "").trim(),
    }));
  } catch (err) {
    console.error("[staffLookupApi] Staff options request error:", err);
    return [];
  }
}
