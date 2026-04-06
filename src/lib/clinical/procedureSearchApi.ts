import { CLINICAL_API_BASE } from "./clinicalApiBase";

export type HiraProcedureItemDto = {
  mdfeeCd?: string | null;
  korNm?: string | null;
  mdfeeDivNo?: string | null;
};

export type HiraProcedureSearchResultDto = {
  resultCode?: string;
  resultMsg?: string;
  pageNo?: number;
  numOfRows?: number;
  totalCount?: number;
  items?: HiraProcedureItemDto[];
};

type ApiEnvelope<T> = { success?: boolean; message?: string | null; result?: T; data?: T };

export async function searchProceduresForVisit(
  visitId: number,
  params: { q: string; pageNo?: number; numOfRows?: number; signal?: AbortSignal }
): Promise<HiraProcedureSearchResultDto> {
  const sp = new URLSearchParams();
  sp.set("q", params.q.trim());
  if (params.pageNo != null) sp.set("pageNo", String(params.pageNo));
  if (params.numOfRows != null) sp.set("numOfRows", String(params.numOfRows));
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/visits/${visitId}/procedure-search?${sp.toString()}`,
    { cache: "no-store", signal: params.signal }
  );
  const json = (await res.json()) as ApiEnvelope<HiraProcedureSearchResultDto>;
  if (!res.ok) {
    throw new Error(json?.message || `진료수가 검색 실패 (${res.status})`);
  }
  if (json.success === false) {
    throw new Error(json.message || "진료수가 검색 실패");
  }
  const result = json.result ?? json.data;
  if (!result || typeof result !== "object") {
    throw new Error("진료수가 검색 응답 형식이 올바르지 않습니다.");
  }
  return result;
}
