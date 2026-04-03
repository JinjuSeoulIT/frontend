export interface RecordFormType {
  recordId: string;
  nursingId: string;
  visitId: string;
  recordedAt: string;
  systolicBp: string;
  diastolicBp: string;
  pulse: string;
  respiration: string;
  temperature: string;
  spo2: string;
  observation: string;
  painScore: string;
  consciousnessLevel: string;
  initialAssessment: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  patientName?: string;
  nurseName?: string;
  departmentName?: string;
  heightCm?: string | number;
  weightKg?: string | number;
}