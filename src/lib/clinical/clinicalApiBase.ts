const DEFAULT_CLINICAL_API_BASE = "http://192.168.1.70:8090";

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, "");
}

const fromEnv = (process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "").trim();

export const CLINICAL_API_BASE =
  fromEnv.length > 0 ? normalizeBase(fromEnv) : DEFAULT_CLINICAL_API_BASE;
