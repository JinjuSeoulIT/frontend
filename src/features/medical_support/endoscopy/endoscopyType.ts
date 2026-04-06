export interface EndoscopyExam {
  endoscopyExamId: string | number;
  testExecutionId?: string | number | null;
  procedureRoom?: string | null;
  equipment?: string | null;
  sedationYn?: string | null;
  operationId?: string | number | null;
  procedureAt?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EndoscopyExamCreatePayload {
  testExecutionId?: string | number | null;
  procedureRoom?: string | null;
  equipment?: string | null;
  sedationYn?: string | null;
  operationId?: string | number | null;
  procedureAt?: string | null;
  status?: string | null;
}

export interface EndoscopyExamUpdatePayload {
  testExecutionId?: string | number | null;
  procedureRoom?: string | null;
  equipment?: string | null;
  sedationYn?: string | null;
  operationId?: string | number | null;
  procedureAt?: string | null;
  status?: string | null;
}