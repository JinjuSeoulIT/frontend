export const normalizeRole = (role?: string | null) => {
  const normalized = (role || "").toUpperCase();
  if (normalized.includes("ADMIN") || normalized.includes("관리자")) return "ADMIN";
  if (normalized.includes("DOCTOR") || normalized.includes("의사")) return "DOCTOR";
  if (normalized.includes("NURSE") || normalized.includes("간호")) return "NURSE";
  if (normalized.includes("RECEPTION") || normalized.includes("원무")) return "RECEPTION";
  if (normalized.includes("STAFF") || normalized.includes("직원") || normalized.includes("스탭")) return "STAFF";
  return "UNKNOWN";
};

export const getDefaultPathByRole = (role?: string | null) => {
  const normalized = normalizeRole(role);
  if (normalized === "ADMIN") return "/";
  if (normalized === "DOCTOR") return "/doctor";
  if (normalized === "NURSE") return "/nurse";
  if (normalized === "STAFF") return "/board/notices";
  if (normalized === "RECEPTION") return "/reception";
  return "/reception";
};

const ACCESS_RULES: Record<string, string[]> = {
  ADMIN: ["*"],
  DOCTOR: ["/", "/doctor", "/doctor/*", "/patients", "/patients/*", "/consents", "/consents/*", "/insurances", "/insurances/*", "/display", "/board", "/board/notices", "/board/schedule", "/board/events", "/board/docs", "/board/leave", "/board/shifts", "/board/shifts/*", "/board/training", "/board/handover", "/board/meetings", "/my_account"],
  NURSE: ["/", "/nurse", "/nurse/*", "/patients", "/patients/*", "/display", "/board", "/board/notices", "/board/schedule", "/board/events", "/board/docs", "/board/leave", "/board/shifts", "/board/shifts/*", "/board/training", "/board/handover", "/board/meetings", "/my_account"],
  RECEPTION: ["/", "/reception", "/reception/*", "/patients", "/patients/*", "/consents", "/consents/*", "/insurances", "/insurances/*", "/display", "/board", "/board/notices", "/board/schedule", "/board/events", "/board/docs", "/board/leave", "/board/shifts", "/board/shifts/*", "/board/training", "/board/handover", "/board/meetings", "/my_account"],
  STAFF: ["/", "/board", "/board/notices", "/board/schedule", "/board/events", "/board/docs", "/board/leave", "/board/shifts", "/board/shifts/*", "/board/training", "/board/handover", "/board/meetings", "/my_account"],
  UNKNOWN: ["/", "/reception", "/board", "/my_account"],
};

export const canAccessPath = (role: string | null | undefined, pathname: string) => {
  const normalized = normalizeRole(role);
  const rules = ACCESS_RULES[normalized] ?? ACCESS_RULES.UNKNOWN;
  if (rules.includes("*")) return true;

  return rules.some((base) => {
    if (base.endsWith("/*")) {
      const prefix = base.slice(0, -2);
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    }
    return pathname === base;
  });
};

export const getVisibleModulesByRole = (role?: string | null) => {
  const normalized = normalizeRole(role);
  if (normalized === "ADMIN") return ["reception", "board", "doctor", "nurse", "admin"];
  if (normalized === "DOCTOR") return ["board", "doctor"];
  if (normalized === "NURSE") return ["board", "nurse"];
  if (normalized === "RECEPTION") return ["reception", "board"];
  if (normalized === "STAFF") return ["board"];
  return ["board", "reception"];
};

export const deriveOperationalRole = (
  authRole?: string | null,
  domainRole?: string | null,
  positionName?: string | null,
  departmentName?: string | null
) => {
  const base = normalizeRole(authRole);
  if (base !== "STAFF") return base;

  const fromDomain = normalizeRole(domainRole);
  if (fromDomain !== "STAFF" && fromDomain !== "UNKNOWN") return fromDomain;

  const position = (positionName || "").toLowerCase();
  if (position.includes("의사") || position.includes("doctor")) return "DOCTOR";
  if (position.includes("간호") || position.includes("nurse")) return "NURSE";
  if (
    position.includes("원무") ||
    position.includes("접수") ||
    position.includes("reception")
  ) {
    return "RECEPTION";
  }

  const department = (departmentName || "").toLowerCase();
  if (department.includes("진료") || department.includes("의국") || department.includes("doctor")) {
    return "DOCTOR";
  }
  if (department.includes("간호") || department.includes("nurse")) {
    return "NURSE";
  }
  if (department.includes("원무") || department.includes("접수") || department.includes("reception")) {
    return "RECEPTION";
  }

  return "STAFF";
};
