export interface TestExecution {
  testExecutionId: string | number;
  orderItemId?: string | number | null;
  executionType?: string | null;
  progressStatus?: string | null;
  retryNo?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  performerId?: string | number | null;
}

export type TestExecutionSearchType = "executionType";

export const TEST_EXECUTION_TYPE_OPTIONS = [
  "SPECIMEN",
  "IMAGING",
  "PATHOLOGY",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
] as const;
