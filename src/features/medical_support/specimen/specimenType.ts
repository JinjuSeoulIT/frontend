export interface SpecimenExam {
  specimenExamId: string | number;
  testExecutionId?: string | number | null;
  specimenType?: string | null;
  specimenStatus?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  collectionSite?: string | null;
  recollectionYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SpecimenExamCreatePayload {
  testExecutionId?: string | number | null;
  specimenType?: string | null;
  specimenStatus?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  collectionSite?: string | null;
  recollectionYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface SpecimenExamUpdatePayload {
  testExecutionId?: string | number | null;
  specimenType?: string | null;
  specimenStatus?: string | null;
  collectedAt?: string | null;
  performerId?: string | number | null;
  collectionSite?: string | null;
  recollectionYn?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}
