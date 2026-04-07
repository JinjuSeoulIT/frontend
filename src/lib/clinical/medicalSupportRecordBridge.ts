import type { RecordFormType } from "@/features/medical_support/record/recordTypes";
import {
  fetchAssessmentApi,
  fetchVitalsApi,
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

async function fetchSupportRecordSearch(receptionId: number): Promise<RecordFormType[] | null> {
  try {
    const u = new URL(`${MEDICAL_SUPPORT_RECORD_BASE}/api/record/search`);
    u.searchParams.set("searchType", "receptionId");
    u.searchParams.set("searchValue", String(receptionId));
    const res = await fetch(u.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return parseEnvelopeArray(body);
  } catch {
    return null;
  }
}

async function fetchSupportRecordList(): Promise<RecordFormType[] | null> {
  try {
    const res = await fetch(`${MEDICAL_SUPPORT_RECORD_BASE}/api/record`, { cache: "no-store" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return parseEnvelopeArray(body);
  } catch {
    return null;
  }
}

function visitIdMatches(record: RecordFormType, clinicalVisitId: number): boolean {
  const v = record.visitId;
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
    const ta = new Date(a.recordedAt || a.updatedAt || 0).getTime();
    const tb = new Date(b.recordedAt || b.updatedAt || 0).getTime();
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
  return pickLatestSupportRecord(pool, clinicalVisitId, receptionId);
}

function parseNum(v: string | number | undefined | null): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
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
  const has =
    temperature != null ||
    pulse != null ||
    bpSystolic != null ||
    bpDiastolic != null ||
    respiratoryRate != null;
  if (!has) return null;
  const measuredAt = record.recordedAt?.trim() ? record.recordedAt : null;
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
  if (!block) return null;
  return {
    assessmentId: 0,
    clinicalId: clinicalVisitId,
    chiefComplaint: null,
    visitReason: null,
    historyPresentIllness: block,
    pastHistory: null,
    familyHistory: null,
    allergy: null,
    currentMedication: null,
    assessedAt: record.recordedAt?.trim() ? record.recordedAt : null,
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
  const [clinicalV, clinicalA, supportRec] = await Promise.all([
    fetchVitalsApi(clinicalVisitId),
    fetchAssessmentApi(clinicalVisitId),
    fetchLatestSupportRecord(clinicalVisitId, receptionId),
  ]);
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
