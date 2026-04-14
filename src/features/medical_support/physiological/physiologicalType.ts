export interface PhysiologicalExam {
  physiologicalExamId: string | number;
  testExecutionId?: string | number | null;
  detailCode?: string | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  examEquipmentId?: string | number | null;
  rawData?: string | null;
  reportDocId?: string | number | null;
  performerId?: string | number | null;
  performerName?: string | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PhysiologicalExamCreatePayload {
  testExecutionId?: string | number | null;
  detailCode?: string | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  examEquipmentId?: string | number | null;
  rawData?: string | null;
  reportDocId?: string | number | null;
  performerId?: string | number | null;
  performerName?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface PhysiologicalExamUpdatePayload {
  testExecutionId?: string | number | null;
  detailCode?: string | null;
  patientId?: string | number | null;
  patientName?: string | null;
  departmentName?: string | null;
  examEquipmentId?: string | number | null;
  rawData?: string | null;
  reportDocId?: string | number | null;
  performerId?: string | number | null;
  performerName?: string | null;
  progressStatus?: string | null;
  status?: string | null;
}
