export interface ImagingExam {
  imagingExamId: string | number;
  testExecutionId?: string | number | null;
  imagingType?: string | null;
  performerId?: string | number | null;
  progressStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ImagingExamCreatePayload {
  testExecutionId?: string | number | null;
  imagingType?: string | null;
  performerId?: string | number | null;
  progressStatus?: string | null;
  status?: string | null;
}

export interface ImagingExamUpdatePayload {
  testExecutionId?: string | number | null;
  imagingType?: string | null;
  performerId?: string | number | null;
  progressStatus?: string | null;
  status?: string | null;
}
