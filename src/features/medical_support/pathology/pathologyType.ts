export interface PathologyExam {
  pathologyExamId: string | number;
  testExecutionId?: string | number | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  collectedById?: string | number | null;
  reexamYn?: string | null;
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
  collectedById?: string | number | null;
  reexamYn?: string | null;
  status?: string | null;
}

export interface PathologyExamUpdatePayload {
  testExecutionId?: string | number | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  collectedById?: string | number | null;
  reexamYn?: string | null;
  status?: string | null;
}