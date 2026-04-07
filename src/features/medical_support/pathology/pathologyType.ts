export interface PathologyExam {
  pathologyExamId: string | number;
  testExecutionId?: string | number | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  reexamYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PathologyExamCreatePayload {
  testExecutionId?: string | number | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  reexamYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface PathologyExamUpdatePayload {
  testExecutionId?: string | number | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  reexamYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}
