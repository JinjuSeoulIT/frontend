import { CLINICAL_API_BASE } from "./clinicalApiBase";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  result?: T;
};

export type VisitMedicationRecordCreatePayload = {
  administeredAt?: string | null;
  doseNumber: number;
  doseUnit: string;
  doseKind?: string | null;
  nursingId?: string | null;
  status?: string | null;
  patientName?: string | null;
  departmentName?: string | null;
};

export type VisitTreatmentResultCreatePayload = {
  detail: string;
  nursingId?: string | null;
  status?: string | null;
  patientName?: string | null;
  departmentName?: string | null;
};

async function readEnvelope(res: Response): Promise<ApiEnvelope<unknown>> {
  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<unknown> | unknown;
  if (body && typeof body === "object" && ("success" in body || "result" in body || "data" in body)) {
    return body as ApiEnvelope<unknown>;
  }
  return {};
}

export async function createVisitMedicationRecordApi(
  visitId: number,
  payload: VisitMedicationRecordCreatePayload
): Promise<void> {
  const body: Record<string, unknown> = {
    doseNumber: payload.doseNumber,
    doseUnit: payload.doseUnit,
  };
  if (payload.administeredAt != null && payload.administeredAt !== "") {
    body.administeredAt = payload.administeredAt;
  }
  if (payload.nursingId != null && payload.nursingId !== "") {
    body.nursingId = payload.nursingId;
  }
  if (payload.status != null && payload.status !== "") {
    body.status = payload.status;
  }
  if (payload.patientName != null && payload.patientName !== "") {
    body.patientName = payload.patientName;
  }
  if (payload.departmentName != null && payload.departmentName !== "") {
    body.departmentName = payload.departmentName;
  }
  if (payload.doseKind != null && payload.doseKind !== "") {
    body.doseKind = payload.doseKind;
  }
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/medication-records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const env = await readEnvelope(res);
  if (!res.ok || env.success === false) {
    throw new Error(env.message ?? `투약 기록 등록 실패 (${res.status})`);
  }
}

export async function createVisitTreatmentResultApi(
  visitId: number,
  payload: VisitTreatmentResultCreatePayload
): Promise<void> {
  const body: Record<string, unknown> = {
    detail: payload.detail,
  };
  if (payload.nursingId != null && payload.nursingId !== "") {
    body.nursingId = payload.nursingId;
  }
  if (payload.status != null && payload.status !== "") {
    body.status = payload.status;
  }
  if (payload.patientName != null && payload.patientName !== "") {
    body.patientName = payload.patientName;
  }
  if (payload.departmentName != null && payload.departmentName !== "") {
    body.departmentName = payload.departmentName;
  }
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/treatment-results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const env = await readEnvelope(res);
  if (!res.ok || env.success === false) {
    throw new Error(env.message ?? `처치 결과 등록 실패 (${res.status})`);
  }
}
