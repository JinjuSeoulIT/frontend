import { loginApi } from "@/lib/auth/authApi";
import { saveSession } from "@/lib/auth/session";

export type LoginDispatchResult =
  | { type: "success"; redirectTo: string }
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

const toLoginErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("AUTH_PENDING_APPROVAL")) {
    return "가입 승인 대기 상태입니다. 관리자 확인 후 로그인할 수 있습니다.";
  }
  if (message.includes("AUTH_INACTIVE_ACCOUNT")) {
    return "비활성 계정입니다. 관리자에게 문의해주세요.";
  }
  return "로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.";
};

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
    });

    const params = new URLSearchParams(window.location.search);
    return { type: "success", redirectTo: getSafeNextPath(params.get("next")) };
  } catch (error) {
    return { type: "error", message: toLoginErrorMessage(error) };
  }
};
