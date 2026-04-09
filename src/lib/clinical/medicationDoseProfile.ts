export type MedicationDoseProfile = {
  doseUnit: string;
  doseNumber: number;
};

export function inferMedicationDoseProfile(itemName: string): MedicationDoseProfile {
  const n = itemName.trim();
  if (!n) {
    return { doseUnit: "회", doseNumber: 1 };
  }

  if (
    /수액|수화액|링거|Ringers?|생리식염|식염수|포도당수액|덱스트로(?:스)?수액|D\/W|D5W|D10W|영양수액|혼합수액|만니톨|하이톤|NS액|DNS|알부민액|전해질액|정맥수액|점적/i.test(
      n
    )
  ) {
    return { doseUnit: "ml", doseNumber: 1 };
  }

  if (/주사|앰플|바이알|프리필|주입|\bIV\b|\.v\.|정맥/i.test(n)) {
    return { doseUnit: "ml", doseNumber: 1 };
  }
  if (/시럽|현탁액|액제|내복액|드링크|용액|내용액|혼합액/i.test(n)) {
    return { doseUnit: "ml", doseNumber: 1 };
  }
  if (/연고|크림|겔|패치|점안|안약|로션|파스|도포|외용|겔제|박리|테이프/i.test(n)) {
    return { doseUnit: "g", doseNumber: 1 };
  }
  if (/정|캡슐|필름|서방|연질|구강붕해|필름코팅|정제|나정/i.test(n)) {
    return { doseUnit: "정", doseNumber: 1 };
  }
  if (/산제|분말|흡입|인헤|에어로솔|흡입제/i.test(n)) {
    return { doseUnit: "회", doseNumber: 1 };
  }

  return { doseUnit: "회", doseNumber: 1 };
}

export function parsePositiveDoseAmount(text: string): number | null {
  const t = text.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
