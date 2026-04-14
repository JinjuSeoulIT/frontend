export type SessionUser = {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  departmentId: string | null;
  departmentName: string | null;
};

const TOKEN_KEY = "his.accessToken";
const USER_KEY = "his.user";
const PASSWORD_CHANGE_REQUIRED_KEY = "his.passwordChangeRequired";
const FORCE_PASSWORD_COOKIE_KEY = "his_force_password_change";
const DEV_BYPASS_COOKIE_KEY = "his_dev_bypass";
const CSRF_COOKIE_KEY = "XSRF-TOKEN";
const AUTH_COOKIE_KEY = "his_access_token";
const SESSION_CHANGED_EVENT = "his:session-changed";

const readStored = (key: string): string | null => {
  const sessionValue = sessionStorage.getItem(key);
  if (sessionValue !== null) return sessionValue;
  return localStorage.getItem(key);
};

const writeStored = (key: string, value: string, persist: boolean) => {
  if (persist) {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
    return;
  }

  sessionStorage.setItem(key, value);
  localStorage.removeItem(key);
};

const removeStored = (key: string) => {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

const writeCookie = (name: string, value: string, options?: { maxAge?: number }) => {
  const maxAge = typeof options?.maxAge === "number" ? `; Max-Age=${options.maxAge}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${maxAge}`;
};

const clearCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const emitSessionChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
};

export const getSessionChangedEventName = () => SESSION_CHANGED_EVENT;

const normalizeSessionUser = (
  value: Partial<SessionUser> & { staffId?: number | string }
): SessionUser | null => {
  const userId =
    typeof value.userId === "string" && value.userId.trim().length > 0
      ? value.userId.trim()
      : value.staffId != null
      ? String(value.staffId)
      : "";

  if (!userId || !value.username || !value.fullName || !value.role) {
    return null;
  }

  return {
    userId,
    username: value.username,
    fullName: value.fullName,
    role: value.role,
    departmentId:
      typeof value.departmentId === "string" && value.departmentId.trim().length > 0
        ? value.departmentId.trim()
        : null,
    departmentName:
      typeof value.departmentName === "string" && value.departmentName.trim().length > 0
        ? value.departmentName.trim()
        : null,
  };
};

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return readStored(TOKEN_KEY);
};

export const saveAccessToken = (token: string, persist = false) => {
  if (typeof window === "undefined") return;
  if (!token) {
    removeStored(TOKEN_KEY);
    clearCookie(AUTH_COOKIE_KEY);
    emitSessionChanged();
    return;
  }

  writeStored(TOKEN_KEY, token, persist);
  writeCookie(AUTH_COOKIE_KEY, token);
  emitSessionChanged();
};

export const getSessionUser = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  const raw = readStored(USER_KEY);
  if (!raw) return null;

  try {
    return normalizeSessionUser(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const setPasswordChangeRequired = (required: boolean, persist = false) => {
  if (typeof window === "undefined") return;
  writeStored(PASSWORD_CHANGE_REQUIRED_KEY, required ? "1" : "0", persist);
  writeCookie(FORCE_PASSWORD_COOKIE_KEY, required ? "1" : "0");
};

export const isPasswordChangeRequired = (): boolean => {
  if (typeof window === "undefined") return false;
  return readStored(PASSWORD_CHANGE_REQUIRED_KEY) === "1";
};

export const saveSession = (
  token: string,
  user: SessionUser,
  options?: { passwordChangeRequired?: boolean; persist?: boolean; tokenMaxAgeSeconds?: number }
) => {
  if (typeof window === "undefined") return;

  const persist = Boolean(options?.persist);
  if (token) {
    writeStored(TOKEN_KEY, token, persist);
    writeCookie(
      AUTH_COOKIE_KEY,
      token,
      persist && typeof options?.tokenMaxAgeSeconds === "number"
        ? { maxAge: options.tokenMaxAgeSeconds }
        : undefined
    );
  } else {
    removeStored(TOKEN_KEY);
    clearCookie(AUTH_COOKIE_KEY);
  }

  writeStored(USER_KEY, JSON.stringify(user), persist);
  setPasswordChangeRequired(false, persist);
  emitSessionChanged();
};

const getExistingPersistPreference = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TOKEN_KEY) !== null || localStorage.getItem(USER_KEY) !== null;
};

export const saveSessionUserOnly = (
  user: SessionUser,
  options?: { passwordChangeRequired?: boolean; persist?: boolean }
) => {
  if (typeof window === "undefined") return;

  const persist = options?.persist ?? getExistingPersistPreference();
  writeStored(USER_KEY, JSON.stringify(user), persist);
  setPasswordChangeRequired(Boolean(options?.passwordChangeRequired), persist);
  emitSessionChanged();
};

export const setDevBypassCookie = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  if (enabled) {
    writeCookie(DEV_BYPASS_COOKIE_KEY, "1");
    return;
  }
  clearCookie(DEV_BYPASS_COOKIE_KEY);
};

export const isDevBypassEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  return getCookieValue(DEV_BYPASS_COOKIE_KEY) === "1";
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  removeStored(TOKEN_KEY);
  removeStored(USER_KEY);
  removeStored(PASSWORD_CHANGE_REQUIRED_KEY);
  clearCookie(FORCE_PASSWORD_COOKIE_KEY);
  clearCookie(DEV_BYPASS_COOKIE_KEY);
  clearCookie(AUTH_COOKIE_KEY);
  clearCookie(CSRF_COOKIE_KEY);
  emitSessionChanged();
};

export const getCookieValue = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const target = `${name}=`;
  const pieces = document.cookie.split(";");
  for (const piece of pieces) {
    const trimmed = piece.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.substring(target.length));
    }
  }
  return null;
};

export const getCsrfToken = (): string | null => getCookieValue(CSRF_COOKIE_KEY);
