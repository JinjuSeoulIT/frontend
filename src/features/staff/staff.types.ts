

export type PatientItem = {
  receptionId: string | number;
  receptionNo?: string | null;
  patientName: string;
  visitType?: string | null;
  status?: string | null;
};

export type PatientSummary = {
  total: number;
  waiting: number;
  treating: number;
  done: number;
};
