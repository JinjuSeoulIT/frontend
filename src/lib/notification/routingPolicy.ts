import type { NotificationItem } from "@/lib/notification/types";

type NotificationDomain =
  | "PATIENT_REGISTERED"
  | "RECEPTION_REGISTERED"
  | "STAFF_REGISTERED"
  | "CLINICAL_RECORDED"
  | "MEDSUPPORT_RECORDED"
  | "BILLING_REGISTERED";

type NotificationRole =
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "RECEPTION"
  | "STAFF"
  | "RADIOLOGY_TECH"
  | "CLINICAL_LAB_TECH"
  | "PATHOLOGY_COORDINATOR"
  | "ENDOSCOPY_COORDINATOR"
  | "PHYSIOLOGY_TEST_COORDINATOR"
  | "UNKNOWN";

const domainTokens: Record<NotificationDomain, string[]> = {
  PATIENT_REGISTERED: [
    "PATIENT_REGISTERED",
    "PATIENT_REGISTER",
    "PATIENT_CREATED",
    "PATIENT.REGISTERED",
    "PATIENT.CREATED",
  ],
  RECEPTION_REGISTERED: [
    "RECEPTION_REGISTERED",
    "RECEPTION_REGISTER",
    "RECEPTION_CREATED",
    "RECEPTION.REGISTERED",
    "RECEPTION.CREATED",
  ],
  STAFF_REGISTERED: [
    "STAFF_REGISTERED",
    "STAFF_REGISTER",
    "STAFF_CREATED",
    "STAFF.REGISTERED",
    "STAFF.CREATED",
  ],
  CLINICAL_RECORDED: [
    "CLINICAL_RECORDED",
    "CLINICAL_REGISTERED",
    "CLINICAL.RECORDED",
    "CLINICAL.CREATED",
    "ENCOUNTER_CREATED",
    "ENCOUNTER.RECORDED",
  ],
  MEDSUPPORT_RECORDED: [
    "MEDSUPPORT_RECORDED",
    "MEDSUPPORT_REGISTERED",
    "MEDSUPPORT.RECORDED",
    "MEDICAL_SUPPORT_RECORDED",
    "MEDICAL_SUPPORT.REGISTERED",
    "TESTEXECUTION",
    "PATHOLOGY",
    "ENDOSCOPY",
    "PHYSIOLOGICAL",
    "IMAGING",
  ],
  BILLING_REGISTERED: [
    "BILLING_REGISTERED",
    "BILLING_REGISTER",
    "BILLING_CREATED",
    "BILLING.REGISTERED",
    "BILLING.CREATED",
    "PAYMENT_CREATED",
    "PAYMENT.REGISTERED",
  ],
};

const roleDomainPolicy: Record<NotificationRole, Set<NotificationDomain>> = {
  ADMIN: new Set<NotificationDomain>([
    "PATIENT_REGISTERED",
    "RECEPTION_REGISTERED",
    "STAFF_REGISTERED",
    "CLINICAL_RECORDED",
    "MEDSUPPORT_RECORDED",
    "BILLING_REGISTERED",
  ]),
  DOCTOR: new Set<NotificationDomain>(["RECEPTION_REGISTERED", "CLINICAL_RECORDED", "MEDSUPPORT_RECORDED"]),
  NURSE: new Set<NotificationDomain>([
    "PATIENT_REGISTERED",
    "RECEPTION_REGISTERED",
    "CLINICAL_RECORDED",
    "MEDSUPPORT_RECORDED",
  ]),
  RECEPTION: new Set<NotificationDomain>(["PATIENT_REGISTERED", "RECEPTION_REGISTERED", "STAFF_REGISTERED", "BILLING_REGISTERED"]),
  STAFF: new Set<NotificationDomain>(["STAFF_REGISTERED"]),
  RADIOLOGY_TECH: new Set<NotificationDomain>(["RECEPTION_REGISTERED", "MEDSUPPORT_RECORDED"]),
  CLINICAL_LAB_TECH: new Set<NotificationDomain>(["RECEPTION_REGISTERED", "MEDSUPPORT_RECORDED"]),
  PATHOLOGY_COORDINATOR: new Set<NotificationDomain>(["RECEPTION_REGISTERED", "MEDSUPPORT_RECORDED"]),
  ENDOSCOPY_COORDINATOR: new Set<NotificationDomain>(["RECEPTION_REGISTERED", "MEDSUPPORT_RECORDED"]),
  PHYSIOLOGY_TEST_COORDINATOR: new Set<NotificationDomain>(["RECEPTION_REGISTERED", "MEDSUPPORT_RECORDED"]),
  UNKNOWN: new Set<NotificationDomain>(),
};

const normalizeRole = (role: string | null | undefined): NotificationRole => {
  if (!role) return "UNKNOWN";

  const upper = role.trim().toUpperCase();
  if (upper.includes("ADMIN")) return "ADMIN";
  if (upper.includes("DOCTOR")) return "DOCTOR";
  if (upper.includes("NURSE")) return "NURSE";
  if (upper.includes("RECEPTION")) return "RECEPTION";
  if (upper.includes("STAFF")) return "STAFF";
  if (upper.includes("RADIOLOGY")) return "RADIOLOGY_TECH";
  if (upper.includes("CLINICAL_LAB")) return "CLINICAL_LAB_TECH";
  if (upper.includes("PATHOLOGY")) return "PATHOLOGY_COORDINATOR";
  if (upper.includes("ENDOSCOPY")) return "ENDOSCOPY_COORDINATOR";
  if (upper.includes("PHYSIOLOGY")) return "PHYSIOLOGY_TEST_COORDINATOR";
  return "UNKNOWN";
};

const classifyDomain = (item: NotificationItem): NotificationDomain | null => {
  const source = (item.source ?? "").toUpperCase();
  const eventType = (item.eventType ?? "").toUpperCase();
  const title = item.title.toUpperCase();
  const message = item.message.toUpperCase();
  const haystack = `${source} ${eventType} ${title} ${message}`;

  for (const [domain, tokens] of Object.entries(domainTokens) as Array<[NotificationDomain, string[]]>) {
    if (tokens.some((token) => haystack.includes(token))) {
      return domain;
    }
  }
  return null;
};

export const isNotificationVisibleForRole = (role: string | null | undefined, item: NotificationItem): boolean => {
  const normalizedRole = normalizeRole(role);
  const domain = classifyDomain(item);
  if (!domain) return normalizedRole === "ADMIN";
  return roleDomainPolicy[normalizedRole].has(domain);
};

