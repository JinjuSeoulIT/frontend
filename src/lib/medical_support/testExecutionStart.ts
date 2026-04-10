import { TEST_EXECUTION_TYPE_OPTIONS } from "@/features/medical_support/testExecution/testExecutionType";

const TEST_EXECUTION_START_LIST_PATHS = {
  SPECIMEN: "/medical_support/specimen/list",
  IMAGING: "/medical_support/imaging/list",
  PATHOLOGY: "/medical_support/pathology/list",
  ENDOSCOPY: "/medical_support/endoscopy/list",
  PHYSIOLOGICAL: "/medical_support/physiological/list",
} as const;

export type SupportedTestExecutionType =
  (typeof TEST_EXECUTION_TYPE_OPTIONS)[number];

const supportedExecutionTypes = new Set<string>(TEST_EXECUTION_TYPE_OPTIONS);

export const normalizeTestExecutionType = (
  value?: string | null
): SupportedTestExecutionType | null => {
  const normalized = value?.trim().toUpperCase() ?? "";

  if (!supportedExecutionTypes.has(normalized)) {
    return null;
  }

  return normalized as SupportedTestExecutionType;
};

export const getTestExecutionStartListPath = (value?: string | null) => {
  const normalized = normalizeTestExecutionType(value);

  if (!normalized) {
    return null;
  }

  return TEST_EXECUTION_START_LIST_PATHS[normalized];
};
