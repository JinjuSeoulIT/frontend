export interface PhysiologicalExam {
  physiologicalExamId: string | number;
  testExecutionId?: string | number | null;
  examEquipmentId?: string | number | null;
  rawData?: string | null;
  reportDocId?: string | number | null;
  performerId?: string | number | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PhysiologicalExamCreatePayload {
  testExecutionId?: string | number | null;
  examEquipmentId?: string | number | null;
  rawData?: string | null;
  reportDocId?: string | number | null;
  performerId?: string | number | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface PhysiologicalExamUpdatePayload {
  testExecutionId?: string | number | null;
  examEquipmentId?: string | number | null;
  rawData?: string | null;
  reportDocId?: string | number | null;
  performerId?: string | number | null;
  progressStatus?: string | null;
  status?: string | null;
}
