import {
  choseongLeadToSyllablePrefixes,
  getChoseongString,
} from "@/utils/koreanChoseong";
import { CLINICAL_API_BASE } from "./clinicalApiBase";

export type DrugItemDto = {
  itemSeq?: string | null;
  itemName?: string | null;
  entpName?: string | null;
};

export type DrugSearchResultDto = {
  resultCode?: string;
  resultMsg?: string;
  pageNo?: number;
  numOfRows?: number;
  totalCount?: number;
  items?: DrugItemDto[];
};

type ApiEnvelope<T> = { success?: boolean; message?: string | null; result?: T; data?: T };

const DRUG_PAGE_SIZE = 100;

export function drugSearchParamsFromQuery(raw: string): { itemName?: string; itemSeq?: string } {
  const t = raw.trim();
  if (t.length >= 2 && /^\d+$/.test(t)) {
    return { itemSeq: t };
  }
  if (t.length > 0) {
    return { itemName: t };
  }
  return {};
}
const CHOSEONG_PAGE_BATCH = 5;
const CHOSEONG_MAX_PAGES_PER_PREFIX = 50;
const CHOSEONG_EXTRA_PREFIX_CHUNK = 8;

function dedupeDrugItems(items: DrugItemDto[]): DrugItemDto[] {
  const m = new Map<string, DrugItemDto>();
  for (const it of items) {
    const seq = (it.itemSeq ?? "").trim();
    const name = (it.itemName ?? "").trim();
    const key = seq || name;
    if (!key) continue;
    if (!m.has(key)) m.set(key, it);
  }
  return [...m.values()];
}

function filterByChoseongPrefix(
  items: DrugItemDto[],
  compactChoseong: string
): DrugItemDto[] {
  return items.filter((it) => {
    const name = (it.itemName ?? "").trim();
    return getChoseongString(name).startsWith(compactChoseong);
  });
}

export async function searchDrugsForChoseongMatch(
  visitId: number,
  params: { compactChoseong: string; signal?: AbortSignal }
): Promise<{
  items: DrugItemDto[];
  resultCode?: string;
  resultMsg?: string;
  totalCountMain?: number;
  pagesFetchedMain?: number;
}> {
  const compact = params.compactChoseong;
  const first = compact[0];
  if (!first) {
    return { items: [] };
  }

  const grid = choseongLeadToSyllablePrefixes(first);
  const mainPrefix = grid[0] ?? first;
  const acc: DrugItemDto[] = [];
  let totalCountMain: number | undefined;
  let maxPageMain = CHOSEONG_MAX_PAGES_PER_PREFIX;
  let lastMeta: DrugSearchResultDto | undefined;

  const runPages = async (itemName: string, pageNos: number[]) => {
    return Promise.all(
      pageNos.map((pageNo) =>
        searchDrugsForVisit(visitId, {
          itemName,
          pageNo,
          numOfRows: DRUG_PAGE_SIZE,
          signal: params.signal,
        })
      )
    );
  };

  for (let start = 1; start <= maxPageMain; start += CHOSEONG_PAGE_BATCH) {
    if (params.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const pageNos: number[] = [];
    for (let i = 0; i < CHOSEONG_PAGE_BATCH; i++) {
      const p = start + i;
      if (p > maxPageMain) break;
      pageNos.push(p);
    }
    if (pageNos.length === 0) break;

    const results = await runPages(mainPrefix, pageNos);
    for (const r of results) {
      lastMeta = r;
      if (r.resultCode && r.resultCode !== "00") {
        return {
          items: filterByChoseongPrefix(dedupeDrugItems(acc), compact),
          resultCode: r.resultCode,
          resultMsg: r.resultMsg,
          totalCountMain,
          pagesFetchedMain: start + pageNos.length - 1,
        };
      }
    }

    if (totalCountMain == null && results[0]?.totalCount != null) {
      const tc = results[0]!.totalCount!;
      totalCountMain = tc;
      maxPageMain = Math.min(
        CHOSEONG_MAX_PAGES_PER_PREFIX,
        Math.max(1, Math.ceil(tc / DRUG_PAGE_SIZE))
      );
    }

    for (const r of results) {
      acc.push(...(r.items ?? []));
    }

    if (
      totalCountMain != null &&
      (start + CHOSEONG_PAGE_BATCH - 1) * DRUG_PAGE_SIZE >= totalCountMain
    ) {
      break;
    }
  }

  const mainMatched = filterByChoseongPrefix(dedupeDrugItems(acc), compact);
  const extras = grid.slice(1);
  if (mainMatched.length === 0) {
    for (let i = 0; i < extras.length; i += CHOSEONG_EXTRA_PREFIX_CHUNK) {
      if (params.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      const chunk = extras.slice(i, i + CHOSEONG_EXTRA_PREFIX_CHUNK);
      const results = await Promise.all(
        chunk.map((itemName) =>
          searchDrugsForVisit(visitId, {
            itemName,
            pageNo: 1,
            numOfRows: DRUG_PAGE_SIZE,
            signal: params.signal,
          })
        )
      );
      for (const r of results) {
        lastMeta = r;
        if (r.resultCode && r.resultCode !== "00") {
          return {
            items: filterByChoseongPrefix(dedupeDrugItems(acc), compact),
            resultCode: r.resultCode,
            resultMsg: r.resultMsg,
            totalCountMain,
          };
        }
        acc.push(...(r.items ?? []));
      }
      if (filterByChoseongPrefix(dedupeDrugItems(acc), compact).length > 0) {
        break;
      }
    }
  }

  const merged = dedupeDrugItems(acc);
  return {
    items: filterByChoseongPrefix(merged, compact),
    resultCode: lastMeta?.resultCode,
    resultMsg: lastMeta?.resultMsg,
    totalCountMain,
  };
}

export async function searchDrugsForVisit(
  visitId: number,
  params: {
    itemName?: string;
    itemSeq?: string;
    pageNo?: number;
    numOfRows?: number;
    signal?: AbortSignal;
  }
): Promise<DrugSearchResultDto> {
  const q = new URLSearchParams();
  const seq = (params.itemSeq ?? "").trim();
  const name = (params.itemName ?? "").trim();
  if (seq) q.set("itemSeq", seq);
  else if (name) q.set("itemName", name);
  if (params.pageNo != null) q.set("pageNo", String(params.pageNo));
  if (params.numOfRows != null) q.set("numOfRows", String(params.numOfRows));
  const qs = q.toString();
  const url = `${CLINICAL_API_BASE}/api/visits/${visitId}/drug-search${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store", signal: params.signal });
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error(`약품 검색 응답 파싱 실패 (${res.status})`);
  }
  const body = json as ApiEnvelope<DrugSearchResultDto> & { message?: string };
  if (!res.ok) {
    throw new Error(body?.message || `약품 검색 실패 (${res.status})`);
  }
  if (body.success === false) {
    throw new Error(body.message || "약품 검색 실패");
  }
  const result = body.result ?? body.data;
  if (!result || typeof result !== "object") {
    throw new Error("약품 검색 응답 형식이 올바르지 않습니다.");
  }
  return result;
}
