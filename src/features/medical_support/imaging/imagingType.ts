export interface ImagingExam {
  imagingExamId: string | number;
  testExecutionId?: string | number | null;
  imagingType?: string | null;
  examStatusYn?: string | null;
  examAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ImagingExamCreatePayload {
  testExecutionId?: string | number | null;
  imagingType?: string | null;
  examStatusYn?: string | null;
  examAt?: string | null;
}

export interface ImagingExamUpdatePayload {
  testExecutionId?: string | number | null;
  imagingType?: string | null;
  examStatusYn?: string | null;
  examAt?: string | null;
}