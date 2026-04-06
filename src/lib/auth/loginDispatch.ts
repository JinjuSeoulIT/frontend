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
  return value;
};

const toLoginErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("AUTH_PENDING_APPROVAL")) {
    return "가입 승인 대기 상태입니다. 관리자 승인 후 로그인할 수 있습니다.";
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
    //
    const result = await loginApi({ username, password });

    if (rememberUsername) {
      window.localStorage.setItem(savedUsernameKey, username.trim());
    } else {
      window.localStorage.removeItem(savedUsernameKey);
    }

    window.localStorage.setItem(rememberLoginKey, rememberLogin ? "1" : "0");

    saveSession(
      result.accessToken
      ,result.user
      , 
      {
      passwordChangeRequired: result.passwordChangeRequired,
      persist: rememberLogin,
    });

    // 비번 1111 로 발급되는데, 기본 비번(1111)로 초기화된 사용자는 비밀번호 변경페이지로 이동시키기 위함.
    if (result.passwordChangeRequired) {
      return { type: "success", redirectTo: "/my_account?forcePasswordChange=1" };
    }

    //window.location.search 는 URL요청에 같이 전달되는 파라미터가 저장되어있음.
    const params = new URLSearchParams(window.location.search);

    // 계속 가려던 경로의 정보로 이동하기 위함.
    return { type: "success", redirectTo: getSafeNextPath(params.get("next")) };
  }
   catch (error) 
   {
    // 3가지 오류사항에 대한 메시지 틔어주고 끝.
    return { type: "error", message: toLoginErrorMessage(error) };
  }
};

/*
기본 폼 로그인(필수값만 사용) 예시:



export const dispatchBasicFormLogin = async ({username,password}): Promise<LoginDispatchResult> => {
  try {
    const result = await loginApi({ username, password });

    // 기본 저장 정책: 로그인 유지 OFF (세션 스토리지 저장)
    saveSession(result.accessToken, result.user, 
    {
      passwordChangeRequired: result.passwordChangeRequired,
      persist: false,
    });

    if (result.passwordChangeRequired) 
    {
      return { type: "success", redirectTo: "/my_account?forcePasswordChange=1" };
    }

    const params = new URLSearchParams(window.location.search);
    return { type: "success", redirectTo: getSafeNextPath(params.get("next")) };
  } catch (error) {
    return { type: "error", message: toLoginErrorMessage(error) };
  }
};
*/
