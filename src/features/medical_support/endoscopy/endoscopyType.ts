export interface EndoscopyExam {
  endoscopyExamId: string | number;
  testExecutionId?: string | number | null;
  detailCode?: string | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  procedureRoom?: string | null;
  equipment?: string | null;
  sedationYn?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  procedureAt?: string | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EndoscopyExamCreatePayload {
  testExecutionId?: string | number | null;
  detailCode?: string | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  procedureRoom?: string | null;
  equipment?: string | null;
  sedationYn?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  procedureAt?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface EndoscopyExamUpdatePayload {
  testExecutionId?: string | number | null;
  detailCode?: string | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  procedureRoom?: string | null;
  equipment?: string | null;
  sedationYn?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  procedureAt?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface EndoscopySearchParams {
  patientName?: string;
  departmentName?: string;
  sedationYn?: string;
  progressStatus?: string;
  startDate?: string;
  endDate?: string;
}
