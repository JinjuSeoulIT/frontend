const CHOSEONG_ORDER = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

const CHOSEONG_SET = new Set<string>(CHOSEONG_ORDER);

export function isChoseongOnlyQuery(text: string): boolean {
  if (!text) return false;
  for (const ch of text) {
    if (!CHOSEONG_SET.has(ch)) return false;
  }
  return true;
}

export function getChoseongString(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code == null) continue;
    if (code >= 0xac00 && code <= 0xd7a3) {
      const si = Math.floor((code - 0xac00) / 588);
      const jamo = CHOSEONG_ORDER[si];
      if (jamo) out += jamo;
    }
  }
  return out;
}

export function choseongToRepresentativeSyllable(cho: string): string {
  const idx = CHOSEONG_ORDER.indexOf(cho as (typeof CHOSEONG_ORDER)[number]);
  if (idx < 0) return cho;
  return String.fromCodePoint(0xac00 + idx * 588);
}

const JUNGSEONG_COUNT = 21;

export function choseongLeadToSyllablePrefixes(cho: string): string[] {
  const idx = CHOSEONG_ORDER.indexOf(cho as (typeof CHOSEONG_ORDER)[number]);
  if (idx < 0) return [cho];
  const out: string[] = [];
  for (let v = 0; v < JUNGSEONG_COUNT; v++) {
    out.push(String.fromCodePoint(0xac00 + idx * 588 + v * 28));
  }
  return out;
}
