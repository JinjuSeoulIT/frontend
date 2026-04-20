const LEGACY_PATH_MAP: Record<string, string> = {
  "/reception": "/reception/dashboard",
  "/reception/reservations": "/reservations",
  "/reception/emergency": "/emergency-receptions",
  "/reception/inpatient": "/inpatient-receptions",
  "/reception/history": "/receptions/canceled",
  "/receptions": "/reception/outpatient/list",
  "/reservations": "/reception/reservation/list",
  "/emergency-receptions": "/reception/emergency/list",
  "/inpatient-receptions": "/reception/inpatient/list",
  "/receptions/canceled": "/reception/dashboard",
  "/reception/edi-items": "/reception/dashboard",
  "/consents": "/patient/consent/list",
  "/insurances": "/patient/insurance/list",
  "/patients": "/patient/list",
  "/doctor": "/clinical",
  "/doctor/encounters": "/clinical",
  "/nurse/reception": "/medical_support/dashboard",
  "/nurse/support": "/medical_support/dashboard",
  "/display": "/clinical",
  "/staff/list": "/staff",
  "/staff/setting": "/staff",
  "/staff/members": "/staff",
  "/staff/Basiclnfo": "/staff",
  "/staff/Basiclnfo/list": "/staff",
  "/staff/basicinfo": "/staff",
  "/staff/basic-info": "/staff",
  "/staff/department": "/staff/departments",
  "/staff/department/list": "/staff/departments",
  "/staff/departments": "/staff/departments",
  "/staff/positions": "/staff/position",
  "/staff/position/list": "/staff/position",
  "/staff/position": "/staff/position",
  "/board": "/admin",
  "/board/notices": "/admin",
  "/board/schedule": "/admin",
  "/board/events": "/admin",
  "/board/docs": "/admin",
  "/board/leave": "/admin",
  "/board/shifts": "/admin",
  "/board/shifts/weekly": "/admin",
  "/board/shifts/daily": "/admin",
  "/board/training": "/admin",
  "/board/handover": "/admin",
  "/board/meetings": "/admin",
};

const normalizeRawPath = (path: string) => {
  const trimmed = path.trim();
  if (!trimmed) {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")
      ? withLeadingSlash.slice(0, -1)
      : withLeadingSlash;

  return withoutTrailingSlash || "/";
};

export const normalizeMenuPath = (path?: string | null) => {
  if (!path) {
    return path ?? null;
  }

  let nextPath = normalizeRawPath(path);
  const visitedPaths = new Set<string>();

  while (LEGACY_PATH_MAP[nextPath] && !visitedPaths.has(nextPath)) {
    visitedPaths.add(nextPath);
    nextPath = normalizeRawPath(LEGACY_PATH_MAP[nextPath]);
  }

  return nextPath;
};

export const splitPathSegments = (path: string) =>
  normalizeMenuPath(path)
    ?.split("/")
    .filter(Boolean) ?? [];

export const joinPathSegments = (segments: string[]) =>
  segments.length ? `/${segments.join("/")}` : "/";
