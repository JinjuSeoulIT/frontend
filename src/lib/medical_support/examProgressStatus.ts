/**
 * 검사 수행·5종 검사 상세에서 진행상태 드롭다운 잠금 규칙을 공통으로 쓴다.
 * WAITING만 사용자가 드롭다운으로 변경 가능.
 */

export function normalizeExamProgressStatus(status: string | undefined | null): string {
  return (status ?? "").trim().toUpperCase();
}

/** WAITING이 아니면 드롭다운 전체 비활성화 */
export function isExamProgressDropdownLocked(status: string | undefined | null): boolean {
  return normalizeExamProgressStatus(status) !== "WAITING";
}

/** TestExecutionForm 과 동일한 라벨 */
export const EXAM_PROGRESS_STATUS_MENU_OPTIONS = [
  { value: "WAITING", label: "대기중" },
  { value: "IN_PROGRESS", label: "검사중" },
  { value: "COMPLETED", label: "검사완료" },
  { value: "CANCELLED", label: "취소" },
] as const;

/**
 * 전체 select가 열려 있고 현재 WAITING일 때, 완료·취소 행만 비활성(버튼으로만 처리).
 */
export function isExamProgressTerminalMenuItemDisabled(
  formProgressStatus: string | undefined | null,
  optionValue: string
): boolean {
  if (isExamProgressDropdownLocked(formProgressStatus)) {
    return false;
  }
  if (normalizeExamProgressStatus(formProgressStatus) !== "WAITING") {
    return false;
  }
  const v = optionValue.trim().toUpperCase();
  return v === "COMPLETED" || v === "CANCELLED";
}
