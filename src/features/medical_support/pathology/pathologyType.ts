export interface PathologyExam {
  pathologyExamId: string | number;
  testExecutionId?: string | number | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  specimenId?: string | number | null;
  resultSummary?: string | null;
  reportDocId?: string | number | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  reexamYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PathologyExamCreatePayload {
  testExecutionId?: string | number | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  specimenId?: string | number | null;
  resultSummary?: string | null;
  reportDocId?: string | number | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  reexamYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface PathologyExamUpdatePayload {
  testExecutionId?: string | number | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  specimenId?: string | number | null;
  resultSummary?: string | null;
  reportDocId?: string | number | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  reexamYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}