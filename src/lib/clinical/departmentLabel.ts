const DEPARTMENT_BY_ID: Record<number, string> = {
  1: "내과",
  2: "외과",
  3: "정형외과",
  4: "신경외과",
};

const DEPARTMENT_BY_NAME: Record<string, string> = {
  emergency: "응급의학과",
  "internal medicine": "응급의학과",
  surgery: "외과",
  orthopedics: "정형외과",
  neurosurgery: "신경외과",
};

export function formatDepartmentName(
  departmentName?: string | null,
  departmentId?: number | null
): string {
  const trimmed = departmentName?.trim();
  if (trimmed) {
    const mapped = DEPARTMENT_BY_NAME[trimmed.toLowerCase()];
    return mapped ?? trimmed;
  }
  if (departmentId != null) {
    return DEPARTMENT_BY_ID[departmentId] ?? `진료과 ${departmentId}`;
  }
  return "-";
}
