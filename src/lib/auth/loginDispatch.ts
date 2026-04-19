import axios from "axios";
import { loginApi } from "@/lib/auth/authApi";
import { saveSession } from "@/lib/auth/session";

export type LoginDispatchResult =
  | {
      type: "success";
      redirectTo: string;
      accessToken: string;
      expiresIn: number;
      passwordChangeRequired: boolean;
    }
  | { type: "error"; message: string };

type DispatchLoginParams = {
  username: string;
  password: string;
  rememberUsername: boolean;
  rememberLogin: boolean;
  savedUsernameKey: string;
  rememberLoginKey: string;
};

const getSafeNextPath = (value: string | null): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return "/";
  }
  if (value.includes("forcePasswordChange=1") || value.startsWith("/my_account/password")) {
    return "/";
  }
  return value;
};

const LOGIN_ERROR_MESSAGE_MAP: Record<string, string> = {
  AUTH_PENDING_APPROVAL: "가입 승인 대기 상태입니다. 관리자 확인 후 로그인할 수 있습니다.",
  AUTH_INACTIVE_ACCOUNT: "비활성 계정입니다. 관리자에게 문의해 주세요.",
  AUTH_ACCOUNT_NOT_FOUND: "입력한 아이디가 존재하지 않습니다.",
  AUTH_USER_NOT_FOUND: "입력한 아이디가 존재하지 않습니다.",
  AUTH_USERNAME_NOT_FOUND: "입력한 아이디가 존재하지 않습니다.",
  AUTH_LOGIN_ID_NOT_FOUND: "입력한 아이디가 존재하지 않습니다.",
  AUTH_CURRENT_PASSWORD_REQUIRED: "비밀번호를 입력해 주세요.",
  AUTH_PASSWORD_REQUIRED: "비밀번호를 입력해 주세요.",
  AUTH_NEW_PASSWORD_REQUIRED: "비밀번호를 입력해 주세요.",
  AUTH_LOGIN_PASSWORD_REQUIRED: "비밀번호를 입력해 주세요.",
  AUTH_USERNAME_REQUIRED: "아이디를 입력해 주세요.",
  AUTH_LOGIN_ID_REQUIRED: "아이디를 입력해 주세요.",
  AUTH_INVALID_CREDENTIALS: "비밀번호가 올바르지 않습니다.",
  AUTH_PASSWORD_INVALID: "비밀번호가 올바르지 않습니다.",
  AUTH_INVALID_PASSWORD: "비밀번호가 올바르지 않습니다.",
  AUTH_PASSWORD_MISMATCH: "비밀번호가 올바르지 않습니다.",
  AUTH_BAD_CREDENTIALS: "비밀번호가 올바르지 않습니다.",
};

const extractLoginErrorCode = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    if (responseData && typeof responseData === "object") {
      const apiMessage = (responseData as Record<string, unknown>).message;
      if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
        return apiMessage.trim();
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return "";
};

const resolveLoginErrorMessage = (codeOrMessage: string) => {
  const normalized = codeOrMessage.trim();
  if (!normalized) {
    return "로그인에 실패했습니다. 다시 시도해 주세요.";
  }

  if (LOGIN_ERROR_MESSAGE_MAP[normalized]) {
    return LOGIN_ERROR_MESSAGE_MAP[normalized];
  }

  if (
    normalized.includes("AUTH_ACCOUNT_NOT_FOUND") ||
    normalized.includes("AUTH_USER_NOT_FOUND") ||
    normalized.includes("AUTH_USERNAME_NOT_FOUND") ||
    normalized.includes("AUTH_LOGIN_ID_NOT_FOUND")
  ) {
    return "입력한 아이디가 존재하지 않습니다.";
  }

  if (
    normalized.includes("AUTH_PASSWORD_REQUIRED") ||
    normalized.includes("AUTH_LOGIN_PASSWORD_REQUIRED") ||
    normalized.includes("AUTH_NEW_PASSWORD_REQUIRED")
  ) {
    return "비밀번호를 입력해 주세요.";
  }

  if (
    normalized.includes("AUTH_USERNAME_REQUIRED") ||
    normalized.includes("AUTH_LOGIN_ID_REQUIRED")
  ) {
    return "아이디를 입력해 주세요.";
  }

  if (
    normalized.includes("AUTH_PASSWORD_INVALID") ||
    normalized.includes("AUTH_INVALID_CREDENTIALS") ||
    normalized.includes("AUTH_INVALID_PASSWORD") ||
    normalized.includes("AUTH_PASSWORD_MISMATCH") ||
    normalized.includes("AUTH_BAD_CREDENTIALS") ||
    normalized.toLowerCase().includes("bad credentials")
  ) {
    return "비밀번호가 올바르지 않습니다.";
  }

  if (
    normalized.toLowerCase().includes("not found") &&
    (
      normalized.toLowerCase().includes("account") ||
      normalized.toLowerCase().includes("user") ||
      normalized.toLowerCase().includes("username") ||
      normalized.toLowerCase().includes("login id")
    )
  ) {
    return "입력한 아이디가 존재하지 않습니다.";
  }

  return "로그인에 실패했습니다. 다시 시도해 주세요.";
};

const toLoginErrorMessage = (error: unknown) =>
  resolveLoginErrorMessage(extractLoginErrorCode(error));

export const dispatchLogin = async ({
  username,
  password,
  rememberUsername,
  rememberLogin,
  savedUsernameKey,
  rememberLoginKey,
}: DispatchLoginParams): Promise<LoginDispatchResult> => {
  try {
    const result = await loginApi({ username, password });

    if (rememberUsername) {
      window.localStorage.setItem(savedUsernameKey, username.trim());
    } else {
      window.localStorage.removeItem(savedUsernameKey);
    }

    window.localStorage.setItem(rememberLoginKey, rememberLogin ? "1" : "0");

    saveSession(result.accessToken, result.user, {
      passwordChangeRequired: false,
      persist: rememberLogin,
      tokenMaxAgeSeconds: rememberLogin ? result.expiresIn : undefined,
    });

    const params = new URLSearchParams(window.location.search);

    return {
      type: "success",
      redirectTo: getSafeNextPath(params.get("next")),
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      passwordChangeRequired: result.passwordChangeRequired,
    };
  } catch (error) {
    return { type: "error", message: toLoginErrorMessage(error) };
  }
};
