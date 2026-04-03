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
};

export type VitalSignsCreatePayload = {
  temperature?: number | null;
  pulse?: number | null;
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  respiratoryRate?: number | null;
  measuredAt?: string | null;
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

export type AssessmentCreatePayload = {
  chiefComplaint?: string | null;
  visitReason?: string | null;
  historyPresentIllness?: string | null;
  pastHistory?: string | null;
  familyHistory?: string | null;
  allergy?: string | null;
  currentMedication?: string | null;
  assessedAt?: string | null;
};

export async function fetchVitalsApi(clinicalId: number): Promise<VitalSignsRes | null> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/vitals`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await parseJson<VitalSignsRes | null>(res);
  return data ?? null;
}

export async function saveVitalsApi(
  clinicalId: number,
  payload: VitalSignsCreatePayload
): Promise<VitalSignsRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/vitals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? `활력징후 저장 실패 (${res.status})`);
  }
  return parseJson<VitalSignsRes>(res);
}

export async function fetchAssessmentApi(clinicalId: number): Promise<AssessmentRes | null> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/assessment`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await parseJson<AssessmentRes | null>(res);
  return data ?? null;
}

export async function saveAssessmentApi(
  clinicalId: number,
  payload: AssessmentCreatePayload
): Promise<AssessmentRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/assessment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? `문진 저장 실패 (${res.status})`);
  }
  return parseJson<AssessmentRes>(res);
}
