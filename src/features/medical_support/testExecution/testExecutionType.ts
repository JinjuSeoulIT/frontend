export interface TestExecution {
  testExecutionId: string | number;
  orderItemId?: string | number | null;
  executionType?: string | null;
  progressStatus?: string | null;
  retryNo?: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
  performerId?: string | number | null;
  updatedAt?: string | null;
}