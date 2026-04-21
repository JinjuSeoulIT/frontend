/** DB에 bill_id 없이, 메모 첫 줄에 내부 태그로 청구 연결 */
const DEPOSIT_BILL_TAG = /^__BILL__\|(\d+)(\r?\n)?/;

export function parseDepositLinkedBillId(
  memo: string | null | undefined
): number | null {
  if (!memo) return null;
  const m = memo.match(DEPOSIT_BILL_TAG);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function stripDepositBillTag(memo: string | null | undefined): string {
  if (!memo) return "";
  return memo.replace(DEPOSIT_BILL_TAG, "").trimStart();
}

export function withDepositBillTag(billId: number, userMemo: string): string {
  const trimmed = userMemo.trim();
  const tag = `__BILL__|${billId}`;
  return trimmed ? `${tag}\n${trimmed}` : tag;
}
