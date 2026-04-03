import { CLINICAL_API_BASE } from "./clinicalApiBase";

type ApiEnvelope<T> = { success?: boolean; message?: string | null; data?: T; result?: T };

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T> | T;
  if (body && typeof body === "object" && ("data" in body || "result" in body))
    return ((body as ApiEnvelope<T>).data ?? (body as ApiEnvelope<T>).result) as T;
  return body as T;
}

export type MasterDiagnosisItem = {
  code: string;
  name: string;
};

export type MasterDiagnosisDiseaseType = "SICK_NM" | "SICK_CD";

export async function searchMasterDiagnosesApi(
  query: string,
  opts?: { diseaseType?: MasterDiagnosisDiseaseType }
): Promise<MasterDiagnosisItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const q = new URLSearchParams();
  q.set("query", trimmed);
  if (opts?.diseaseType) q.set("diseaseType", opts.diseaseType);
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/master-diagnoses?${q.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("표준 상병 검색 실패");
  const data = await parseJson<MasterDiagnosisItem[]>(res);
  return Array.isArray(data) ? data : [];
}
