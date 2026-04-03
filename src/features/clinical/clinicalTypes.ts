import type { Patient } from "@/features/patients/patientTypes";
import type { ClinicalRes, ReceptionQueueItem } from "@/lib/clinical/visitApi";

export type { Patient, ClinicalRes, ReceptionQueueItem };

export type VisitNotePersistPayload = {
  visitId: number;
  chiefComplaint: string;
  presentIllness: string;
  clinicalMemo: string;
};

export type ClinicalState = {
  patients: Patient[];
  clinicals: ClinicalRes[];
  receptions: ReceptionQueueItem[];
  bootstrapLoading: boolean;
  receptionLoading: boolean;
  errorMessage: string | null;
  noteSaveInflight: number;
  persistNoteError: string | null;
  startVisitPhase: "idle" | "loading" | "success" | "error";
  startVisitError: string | null;
  endVisitPhase: "idle" | "loading" | "success" | "error";
  endVisitError: string | null;
};
