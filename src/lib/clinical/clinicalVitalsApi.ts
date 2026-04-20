import { CLINICAL_API_BASE } from "./clinicalApiBase";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  result?: T;
};

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T> | T;
  if (body && typeof body === "object" && ("data" in body || "result" in body)) {
    const v = (body as ApiEnvelope<T>).data ?? (body as ApiEnvelope<T>).result;
    return v as T;
  }
  return body as T;
}

async function readErrorMessage(res: Response): Promise<string> {
  const raw = (await res.json().catch(() => ({}))) as ApiEnvelope<unknown> & { message?: string };
  if (typeof raw?.message === "string" && raw.message.trim()) {
    return raw.message.trim();
  }
  return `요청 실패 (${res.status})`;
}

export type ClinicalVitalAssessApiRes = {
  vitalAssessId: number;
  visitId: number;
  receptionId?: number | null;
  recordedAt?: string | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  pulse?: number | null;
  respiration?: number | null;
  temperature?: number | string | null;
  spo2?: number | null;
  painScore?: number | null;
  consciousnessLevel?: string | null;
  heightCm?: string | null;
  weightKg?: string | null;
  chiefComplaint?: string | null;
  visitReason?: string | null;
  historyPresentIllness?: string | null;
  pastHistory?: string | null;
  familyHistory?: string | null;
  allergy?: string | null;
  currentMedication?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type VitalAssessSavePayload = {
  visitId?: number | null;
  receptionId?: number | null;
  recordedAt?: string | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  pulse?: number | null;
  respiration?: number | null;
  temperature?: number | null;
  spo2?: number | null;
  painScore?: number | null;
  consciousnessLevel?: string | null;
  heightCm?: string | null;
  weightKg?: string | null;
  chiefComplaint?: string | null;
  visitReason?: string | null;
  historyPresentIllness?: string | null;
  pastHistory?: string | null;
  familyHistory?: string | null;
  allergy?: string | null;
  currentMedication?: string | null;
  status?: string | null;
};

export type VitalSignsRes = {
  vitalSignsId: number;
  clinicalId: number;
  temperature?: number | null;
  pulse?: number | null;
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  respiratoryRate?: number | null;
  measuredAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  heightCm?: string | number | null;
  weightKg?: string | number | null;
  spo2?: string | number | null;
  painScore?: string | number | null;
  consciousnessLevel?: string | null;
};

export type AssessmentRes = {
  assessmentId: number;
  clinicalId: number;
  chiefComplaint?: string | null;
  visitReason?: string | null;
  historyPresentIllness?: string | null;
  pastHistory?: string | null;
  familyHistory?: string | null;
  allergy?: string | null;
  currentMedication?: string | null;
  assessedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function mapRowToVitals(r: ClinicalVitalAssessApiRes): VitalSignsRes {
  return {
    vitalSignsId: r.vitalAssessId,
    clinicalId: r.visitId,
    temperature: r.temperature != null && r.temperature !== "" ? Number(r.temperature) : null,
    pulse: r.pulse ?? null,
    bpSystolic: r.systolicBp ?? null,
    bpDiastolic: r.diastolicBp ?? null,
    respiratoryRate: r.respiration ?? null,
    measuredAt: r.recordedAt ?? null,
    createdAt: r.createdAt ?? null,
    updatedAt: r.updatedAt ?? null,
    heightCm: r.heightCm ?? null,
    weightKg: r.weightKg ?? null,
    spo2: r.spo2 ?? null,
    painScore: r.painScore ?? null,
    consciousnessLevel: r.consciousnessLevel ?? null,
  };
}

function mapRowToAssessment(r: ClinicalVitalAssessApiRes): AssessmentRes {
  return {
    assessmentId: r.vitalAssessId,
    clinicalId: r.visitId,
    chiefComplaint: r.chiefComplaint ?? null,
    visitReason: r.visitReason ?? null,
    historyPresentIllness: r.historyPresentIllness ?? null,
    pastHistory: r.pastHistory ?? null,
    familyHistory: r.familyHistory ?? null,
    allergy: r.allergy ?? null,
    currentMedication: r.currentMedication ?? null,
    assessedAt: r.recordedAt ?? r.updatedAt ?? null,
    createdAt: r.createdAt ?? null,
    updatedAt: r.updatedAt ?? null,
  };
}

async function fetchVitalAssessRow(visitId: number): Promise<ClinicalVitalAssessApiRes | null> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/vital-assess`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  const data = await parseJson<ClinicalVitalAssessApiRes | null>(res);
  return data ?? null;
}

export async function fetchVitalsAndAssessmentFromClinical(
  visitId: number
): Promise<{ vitals: VitalSignsRes | null; assessment: AssessmentRes | null }> {
  const row = await fetchVitalAssessRow(visitId);
  if (!row) {
    return { vitals: null, assessment: null };
  }
  return {
    vitals: mapRowToVitals(row),
    assessment: mapRowToAssessment(row),
  };
}

export async function fetchVitalsApi(clinicalId: number): Promise<VitalSignsRes | null> {
  const row = await fetchVitalAssessRow(clinicalId);
  return row ? mapRowToVitals(row) : null;
}

export async function fetchAssessmentApi(clinicalId: number): Promise<AssessmentRes | null> {
  const row = await fetchVitalAssessRow(clinicalId);
  return row ? mapRowToAssessment(row) : null;
}

export async function saveVitalAssessApi(
  visitId: number,
  payload: VitalAssessSavePayload
): Promise<ClinicalVitalAssessApiRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/vital-assess`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return parseJson<ClinicalVitalAssessApiRes>(res);
}
