import type { RecordFormType } from "@/features/medical_support/record/recordTypes";
import {
  fetchVitalsAndAssessmentFromClinical,
  type AssessmentRes,
  type VitalSignsRes,
} from "@/lib/clinical/clinicalVitalsApi";

const DEFAULT_MEDICAL_SUPPORT_RECORD_BASE = "http://192.168.1.66:8181";

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, "");
}

const overrideBase = (process.env.NEXT_PUBLIC_MEDICAL_SUPPORT_RECORD_API_BASE_URL ?? "").trim();
const nursingBase = (process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "").trim();

const MEDICAL_SUPPORT_RECORD_BASE = normalizeBase(
  overrideBase.length > 0
    ? overrideBase
    : nursingBase.length > 0
      ? nursingBase
      : DEFAULT_MEDICAL_SUPPORT_RECORD_BASE
);

function parseEnvelopeArray(body: unknown): RecordFormType[] | null {
  if (!body || typeof body !== "object") return null;
  const raw =
    (body as { result?: unknown; data?: unknown }).result ??
    (body as { data?: unknown }).data;
  return Array.isArray(raw) ? (raw as RecordFormType[]) : null;
}

function strTrim(v: unknown): string {
  if (v == null || v === "") return "";
  return String(v).trim();
}

function firstNonEmpty(...vals: unknown[]): string {
  for (const v of vals) {
    const s = strTrim(v);
    if (s) return s;
  }
  return "";
}

function normalizeSupportApiRecord(raw: unknown): RecordFormType {
  if (!raw || typeof raw !== "object") return raw as RecordFormType;
  const r = raw as Record<string, unknown>;
  const b = raw as RecordFormType;
  return {
    ...b,
    recordedAt: firstNonEmpty(b.recordedAt, r.recordedAt, r.RECORDED_AT),
    createdAt: firstNonEmpty(b.createdAt, r.createdAt, r.CREATED_AT),
    updatedAt: firstNonEmpty(b.updatedAt, r.updatedAt, r.UPDATED_AT),
    painScore: firstNonEmpty(b.painScore, r.painScore, r.PAIN_SCORE, r.pain_score),
    pastMedicalHistory: firstNonEmpty(
      b.pastMedicalHistory,
      r.pastMedicalHistory,
      r.PAST_MEDICAL_HISTORY,
      r.past_medical_history
    ),
  };
}

function normalizeSupportRecordList(records: RecordFormType[] | null): RecordFormType[] | null {
  if (!records) return null;
  return records.map((row) => normalizeSupportApiRecord(row));
}

function parseEnvelopeSingle(body: unknown): RecordFormType | null {
  if (!body || typeof body !== "object") return null;
  const raw =
    (body as { result?: unknown; data?: unknown }).result ?? (body as { data?: unknown }).data;
  if (raw == null || typeof raw !== "object") return null;
  return normalizeSupportApiRecord(raw);
}

async function fetchSupportRecordDetailById(recordId: string): Promise<RecordFormType | null> {
  const id = recordId.trim();
  if (!id) return null;
  try {
    const res = await fetch(
      `${MEDICAL_SUPPORT_RECORD_BASE}/api/record/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return parseEnvelopeSingle(body);
  } catch {
    return null;
  }
}

function supportRecordInstant(record: RecordFormType): string {
  return firstNonEmpty(record.recordedAt, record.createdAt, record.updatedAt);
}

async function fetchSupportRecordSearch(receptionId: number): Promise<RecordFormType[] | null> {
  try {
    const u = new URL(`${MEDICAL_SUPPORT_RECORD_BASE}/api/record/search`);
    u.searchParams.set("searchType", "receptionId");
    u.searchParams.set("searchValue", String(receptionId));
    const res = await fetch(u.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return normalizeSupportRecordList(parseEnvelopeArray(body));
  } catch {
    return null;
  }
}

async function fetchSupportRecordList(): Promise<RecordFormType[] | null> {
  try {
    const res = await fetch(`${MEDICAL_SUPPORT_RECORD_BASE}/api/record`, { cache: "no-store" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return normalizeSupportRecordList(parseEnvelopeArray(body));
  } catch {
    return null;
  }
}

function visitIdMatches(record: RecordFormType, clinicalVisitId: number): boolean {
  const v = (record as RecordFormType & { visitId?: string | number | null }).visitId;
  if (v == null) return false;
  const s = String(v).trim();
  if (!s) return false;
  const n = Number(s);
  return Number.isFinite(n) && n === clinicalVisitId;
}

function pickLatestSupportRecord(
  records: RecordFormType[],
  clinicalVisitId: number,
  receptionId: number | null
): RecordFormType | null {
  const filtered = records.filter((r) => {
    const byRec =
      receptionId != null &&
      r.receptionId != null &&
      Number(r.receptionId) === Number(receptionId);
    const byVisit = visitIdMatches(r, clinicalVisitId);
    return byRec || byVisit;
  });
  if (filtered.length === 0) return null;
  filtered.sort((a, b) => {
    const ta = Date.parse(supportRecordInstant(a)) || 0;
    const tb = Date.parse(supportRecordInstant(b)) || 0;
    return tb - ta;
  });
  return filtered[0] ?? null;
}

async function fetchLatestSupportRecord(
  clinicalVisitId: number,
  receptionId: number | null
): Promise<RecordFormType | null> {
  let pool: RecordFormType[] | null = null;
  if (receptionId != null) {
    pool = await fetchSupportRecordSearch(receptionId);
  }
  if (!pool || pool.length === 0) {
    pool = await fetchSupportRecordList();
  }
  if (!pool || pool.length === 0) return null;
  const picked = pickLatestSupportRecord(pool, clinicalVisitId, receptionId);
  if (!picked) return null;
  const rid = String(picked.recordId ?? "").trim();
  if (!rid) return picked;
  const detail = await fetchSupportRecordDetailById(rid);
  if (!detail) return picked;
  return normalizeSupportApiRecord({ ...picked, ...detail });
}

function parseNum(v: string | number | undefined | null): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

function trimPresent(v: string | number | null | undefined): boolean {
  return v != null && String(v).trim() !== "";
}

function supportRecordToVitals(
  record: RecordFormType,
  clinicalVisitId: number
): VitalSignsRes | null {
  const temperature = parseNum(record.temperature);
  const pulse = parseNum(record.pulse);
  const bpSystolic = parseNum(record.systolicBp);
  const bpDiastolic = parseNum(record.diastolicBp);
  const respiratoryRate = parseNum(record.respiration);
  const hasCore =
    temperature != null ||
    pulse != null ||
    bpSystolic != null ||
    bpDiastolic != null ||
    respiratoryRate != null;

  const heightCm = trimPresent(record.heightCm) ? record.heightCm! : null;
  const weightKg = trimPresent(record.weightKg) ? record.weightKg! : null;
  const spo2Num = parseNum(record.spo2);
  const spo2: string | number | null =
    spo2Num != null ? spo2Num : String(record.spo2 ?? "").trim() || null;
  const painRaw = String(record.painScore ?? "").trim();
  const painScore = painRaw || null;
  const consciousnessRaw = String(record.consciousnessLevel ?? "").trim();
  const consciousnessLevel = consciousnessRaw || null;

  const hasExt =
    heightCm != null ||
    weightKg != null ||
    spo2 != null ||
    painScore != null ||
    consciousnessLevel != null;

  if (!hasCore && !hasExt) return null;

  const measuredRaw = supportRecordInstant(record);
  const measuredAt = measuredRaw || null;
  return {
    vitalSignsId: 0,
    clinicalId: clinicalVisitId,
    temperature,
    pulse,
    bpSystolic,
    bpDiastolic,
    respiratoryRate,
    measuredAt,
    createdAt: null,
    updatedAt: null,
    heightCm: heightCm ?? undefined,
    weightKg: weightKg ?? undefined,
    spo2: spo2 ?? undefined,
    painScore: painScore ?? undefined,
    consciousnessLevel: consciousnessLevel ?? undefined,
  };
}

function nonEmpty(s: string | null | undefined): string | null {
  const t = (s ?? "").trim();
  return t ? t : null;
}

function supportRecordToAssessment(
  record: RecordFormType,
  clinicalVisitId: number
): AssessmentRes | null {
  const chunks: string[] = [];
  const push = (label: string, v: string | number | undefined | null) => {
    if (v == null) return;
    const t = String(v).trim();
    if (t) chunks.push(`${label}: ${t}`);
  };
  push("초기사정", record.initialAssessment);
  push("관찰", record.observation);
  push("SpO2", record.spo2);
  push("통증", record.painScore);
  push("의식", record.consciousnessLevel);
  push("신장(cm)", record.heightCm);
  push("체중(kg)", record.weightKg);
  const block = chunks.join("\n");
  const pastHistory = nonEmpty(record.pastMedicalHistory);
  if (!block && !pastHistory) return null;
  return {
    assessmentId: 0,
    clinicalId: clinicalVisitId,
    chiefComplaint: null,
    visitReason: null,
    historyPresentIllness: block || null,
    pastHistory,
    familyHistory: null,
    allergy: null,
    currentMedication: null,
    assessedAt: supportRecordInstant(record) || null,
    createdAt: null,
    updatedAt: null,
  };
}

function mergeVitals(
  clinical: VitalSignsRes | null,
  support: VitalSignsRes | null
): VitalSignsRes | null {
  if (!support) return clinical;
  if (!clinical) return support;
  return {
    vitalSignsId: clinical.vitalSignsId,
    clinicalId: clinical.clinicalId,
    temperature: clinical.temperature ?? support.temperature,
    pulse: clinical.pulse ?? support.pulse,
    bpSystolic: clinical.bpSystolic ?? support.bpSystolic,
    bpDiastolic: clinical.bpDiastolic ?? support.bpDiastolic,
    respiratoryRate: clinical.respiratoryRate ?? support.respiratoryRate,
    measuredAt: clinical.measuredAt ?? support.measuredAt,
    createdAt: clinical.createdAt ?? support.createdAt,
    updatedAt: clinical.updatedAt ?? support.updatedAt,
    heightCm: trimPresent(clinical.heightCm) ? clinical.heightCm! : support.heightCm,
    weightKg: trimPresent(clinical.weightKg) ? clinical.weightKg! : support.weightKg,
    spo2: trimPresent(clinical.spo2) ? clinical.spo2! : support.spo2,
    painScore: trimPresent(clinical.painScore) ? clinical.painScore! : support.painScore,
    consciousnessLevel: nonEmpty(clinical.consciousnessLevel) ?? nonEmpty(support.consciousnessLevel) ?? undefined,
  };
}

function mergeAssessmentText(
  clinical: string | null | undefined,
  support: string | null | undefined
): string | null {
  const c = nonEmpty(clinical);
  const s = nonEmpty(support);
  if (c && s && c !== s) return `${c}\n\n—— 진료지원 ——\n${s}`;
  return c ?? s ?? null;
}

function mergeAssessments(
  clinical: AssessmentRes | null,
  support: AssessmentRes | null
): AssessmentRes | null {
  if (!support) return clinical;
  if (!clinical) return support;
  return {
    assessmentId: clinical.assessmentId,
    clinicalId: clinical.clinicalId,
    chiefComplaint: mergeAssessmentText(clinical.chiefComplaint, support.chiefComplaint),
    visitReason: mergeAssessmentText(clinical.visitReason, support.visitReason),
    historyPresentIllness: mergeAssessmentText(
      clinical.historyPresentIllness,
      support.historyPresentIllness
    ),
    pastHistory: mergeAssessmentText(clinical.pastHistory, support.pastHistory),
    familyHistory: mergeAssessmentText(clinical.familyHistory, support.familyHistory),
    allergy: mergeAssessmentText(clinical.allergy, support.allergy),
    currentMedication: mergeAssessmentText(
      clinical.currentMedication,
      support.currentMedication
    ),
    assessedAt: clinical.assessedAt ?? support.assessedAt,
    createdAt: clinical.createdAt ?? support.createdAt,
    updatedAt: clinical.updatedAt ?? support.updatedAt,
  };
}

export async function fetchVitalsAndAssessmentWithMedicalSupport(
  clinicalVisitId: number,
  receptionId: number | null
): Promise<{ vitals: VitalSignsRes | null; assessment: AssessmentRes | null }> {
  const [clinicalPair, supportRec] = await Promise.all([
    fetchVitalsAndAssessmentFromClinical(clinicalVisitId),
    fetchLatestSupportRecord(clinicalVisitId, receptionId),
  ]);
  const clinicalV = clinicalPair.vitals;
  const clinicalA = clinicalPair.assessment;
  if (!supportRec) {
    return { vitals: clinicalV, assessment: clinicalA };
  }
  const sv = supportRecordToVitals(supportRec, clinicalVisitId);
  const sa = supportRecordToAssessment(supportRec, clinicalVisitId);
  return {
    vitals: mergeVitals(clinicalV, sv),
    assessment: mergeAssessments(clinicalA, sa),
  };
}
