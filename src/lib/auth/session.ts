export type SessionUser = {
  staffId: number;
  username: string;
  fullName: string;
  role: string;
};

const TOKEN_KEY = "his.accessToken";
const USER_KEY = "his.user";
const PASSWORD_CHANGE_REQUIRED_KEY = "his.passwordChangeRequired";
const FORCE_PASSWORD_COOKIE_KEY = "his_force_password_change";
const CSRF_COOKIE_KEY = "XSRF-TOKEN";
const AUTH_COOKIE_KEY = "his_access_token";

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

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return readStored(TOKEN_KEY);
};

export const saveAccessToken = (token: string, persist = false) => {
  if (typeof window === "undefined") return;
  if (!token) {
    removeStored(TOKEN_KEY);
    return;
  }
  writeStored(TOKEN_KEY, token, persist);
};

export const getSessionUser = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  const raw = readStored(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

export const setPasswordChangeRequired = (required: boolean, persist = false) => {
  if (typeof window === "undefined") return;
  writeStored(PASSWORD_CHANGE_REQUIRED_KEY, required ? "1" : "0", persist);
  document.cookie = `${FORCE_PASSWORD_COOKIE_KEY}=${required ? "1" : "0"}; Path=/; SameSite=Lax`;
};

export const isPasswordChangeRequired = (): boolean => {
  if (typeof window === "undefined") return false;
  return readStored(PASSWORD_CHANGE_REQUIRED_KEY) === "1";
};

export const saveSession = (
  token: string,
  user: SessionUser,
  options?: { passwordChangeRequired?: boolean; persist?: boolean }
) => {
  if (typeof window === "undefined") return;
  const persist = Boolean(options?.persist);
  if (token) {
    writeStored(TOKEN_KEY, token, persist);
  } else {
    removeStored(TOKEN_KEY);
  }
  writeStored(USER_KEY, JSON.stringify(user), persist);
  setPasswordChangeRequired(Boolean(options?.passwordChangeRequired), persist);
};

export const saveSessionUserOnly = (user: SessionUser, options?: { passwordChangeRequired?: boolean }) => {
  saveSession("", user, options);
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  removeStored(TOKEN_KEY);
  removeStored(USER_KEY);
  removeStored(PASSWORD_CHANGE_REQUIRED_KEY);
  document.cookie = `${FORCE_PASSWORD_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${AUTH_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${CSRF_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const getCookieValue = (name: string): string | null => {
  // 브라우저 환경의 요청이 아니라면은 아무일도 안함.
  if (typeof window === "undefined") 
    return null;

  const target = `${name}=`; // XSRF-TOKEN=  << 이라는 조건식을 만들어놔버림.
  const pieces = document.cookie.split(";");
  // "a=1; token=abc; theme=dark" ==> ["a=1", " token=abc", " theme=dark"]

  for (const piece of pieces) {
    const trimmed = piece.trim();
    if (trimmed.startsWith(target)) 
      {
      return decodeURIComponent(trimmed.substring(target.length));
    }
  }
  return null;
};

export const getCsrfToken = (): string | null => {
  return getCookieValue(CSRF_COOKIE_KEY); // XSRF-TOKEN
};
