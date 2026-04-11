export interface ImagingExam {
  imagingExamId: string | number;
  testExecutionId?: string | number | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ImagingExamCreatePayload {
  testExecutionId?: string | number | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface ImagingExamUpdatePayload {
  testExecutionId?: string | number | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}