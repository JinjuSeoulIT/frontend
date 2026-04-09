import { fetchCodesApi } from "@/lib/admin/codeApi";
import type { LabOrderType } from "./clinicalOrderApi";

export type ExamCodeOption = {
  code: string;
  codeName: string;
};

const DEFAULT_GROUP: Partial<Record<LabOrderType, string>> = {
  IMAGING: "IMAGING",
  PATHOLOGY: "PATHOLOGY",
  SPECIMEN: "SPECIMEN",
  ENDOSCOPY: "ENDOSCOPY",
  PHYSIOLOGICAL: "PHYSIOLOGY",
};

function envGroup(orderType: LabOrderType): string | undefined {
  switch (orderType) {
    case "IMAGING":
      return process.env.NEXT_PUBLIC_EXAM_CODE_GROUP_IMAGING?.trim();
    case "PATHOLOGY":
      return process.env.NEXT_PUBLIC_EXAM_CODE_GROUP_PATHOLOGY?.trim();
    case "SPECIMEN":
      return process.env.NEXT_PUBLIC_EXAM_CODE_GROUP_SPECIMEN?.trim();
    case "ENDOSCOPY":
      return process.env.NEXT_PUBLIC_EXAM_CODE_GROUP_ENDOSCOPY?.trim();
    case "PHYSIOLOGICAL":
      return process.env.NEXT_PUBLIC_EXAM_CODE_GROUP_PHYSIOLOGICAL?.trim();
    default:
      return undefined;
  }
}

export function examCodeGroupForOrderType(orderType: LabOrderType): string | null {
  const e = envGroup(orderType);
  if (e) return e;
  const d = DEFAULT_GROUP[orderType];
  return d && d.length > 0 ? d : null;
}

export async function fetchExamCodesForOrderType(orderType: LabOrderType): Promise<ExamCodeOption[]> {
  const group = examCodeGroupForOrderType(orderType);
  if (!group) return [];
  const rows = await fetchCodesApi(group);
  return rows
    .filter((r) => r.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => {
      const code = (r.code ?? "").trim();
      const name = (r.name ?? "").trim();
      return { code, codeName: name.length > 0 ? name : code };
    })
    .filter((r) => r.code.length > 0);
}
