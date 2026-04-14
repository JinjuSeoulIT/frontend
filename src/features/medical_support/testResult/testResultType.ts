export type TestResultTypeCode =
  | "IMAGING"
  | "SPECIMEN"
  | "PATHOLOGY"
  | "ENDOSCOPY"
  | "PHYSIOLOGICAL"
  | string;

export type TestResultStatus = "ACTIVE" | "INACTIVE" | string;

export type TestResultDetailValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export interface BaseTestResultDetailData {
  resultSummary?: string | null;
  [key: string]: TestResultDetailValue;
}

export interface ImagingTestResultDetailData extends BaseTestResultDetailData {
  readingDetail?: string | null;
}

export interface SpecimenTestResultDetailData extends BaseTestResultDetailData {
  resultItemCode?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
  judgement?: string | null;
}

export interface PathologyTestResultDetailData extends BaseTestResultDetailData {
  judgedAt?: string | null;
  readerId?: string | null;
  diagnosisName?: string | null;
  tissueStatus?: string | null;
  collectionMethod?: string | null;
  tissueSite?: string | null;
  tissueType?: string | null;
  collectedAt?: string | null;
  reexamYn?: string | null;
}

export interface EndoscopyTestResultDetailData extends BaseTestResultDetailData {
  biopsyYn?: string | null;
  readerId?: string | null;
}

export interface PhysiologicalTestResultDetailData
  extends BaseTestResultDetailData {
  report?: string | null;
  measuredItemCode?: string | null;
  examEquipmentId?: string | null;
  rawData?: string | null;
  reportDocId?: string | null;
}

export type TestResultDetailData =
  | ImagingTestResultDetailData
  | SpecimenTestResultDetailData
  | PathologyTestResultDetailData
  | EndoscopyTestResultDetailData
  | PhysiologicalTestResultDetailData
  | BaseTestResultDetailData;

export interface TestResultDetailRequestPayload {
  resultType: string;
  resultId: string | number;
}

export interface TestResultUpdatePayload {
  status?: string;
  confirmedAt?: string;
  resultManagerId?: string | number | null;
  resultManagerName?: string | null;
  detail?: TestResultDetailData;
}

export interface TestResultUpdateRequestPayload
  extends TestResultDetailRequestPayload {
  form: TestResultUpdatePayload;
}

export interface TestResult {
  resultType?: TestResultTypeCode | null;
  resultTypeName?: string | null;
  resultId?: string | number | null;
  examId?: string | number | null;
  testExecutionId?: string | number | null;
  detailCode?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  departmentName?: string | null;
  performerId?: string | number | null;
  performerName?: string | null;
  resultManagerId?: string | number | null;
  resultManagerName?: string | null;
  summary?: string | null;
  resultAt?: string | null;
  status?: TestResultStatus | null;
  createdAt?: string | null;
  detail?: TestResultDetailData | null;
}

export interface TestResultSearchParams {
  resultType?: string;
  patientName?: string;
  detailCode?: string;
  departmentName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  includeInactive?: boolean;
}

export const TEST_RESULT_TYPE_OPTIONS = [
  { value: "IMAGING", label: "\uC601\uC0C1\uAC80\uC0AC" },
  { value: "SPECIMEN", label: "\uAC80\uCCB4\uAC80\uC0AC" },
  { value: "PATHOLOGY", label: "\uBCD1\uB9AC\uAC80\uC0AC" },
  { value: "ENDOSCOPY", label: "\uB0B4\uC2DC\uACBD\uAC80\uC0AC" },
  { value: "PHYSIOLOGICAL", label: "\uC0DD\uB9AC\uAE30\uB2A5\uAC80\uC0AC" },
] as const;

export const TEST_RESULT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "\uD65C\uC131" },
  { value: "INACTIVE", label: "\uBE44\uD65C\uC131" },
] as const;
