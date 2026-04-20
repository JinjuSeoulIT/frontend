import axios from "axios";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { AUTH_API_BASE_URL } from "@/lib/common/env";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
  data?: T;
};

type AdminPasswordResetResultRaw = Partial<{
  userId: string | null;
  loginId: string | null;
  temporaryPassword: string | null;
}>;

export type AdminPasswordResetResult = {
  userId: string | null;
  loginId: string | null;
  temporaryPassword: string | null;
};

const api = axios.create({
  baseURL: AUTH_API_BASE_URL,
});

applyAuthInterceptors(api, { redirectOn401: false });

const PASSWORD_RESET_MESSAGE_MAP: Record<string, string> = {
  AUTH_USER_IDENTIFIER_REQUIRED: "사용자 식별자가 필요합니다.",
  AUTH_ACCOUNT_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  AUTH_BIRTH_DATE_REQUIRED: "생년월일 정보가 없어 비밀번호를 초기화할 수 없습니다.",
  AUTH_PASSWORD_RESET_TO_BIRTH_DATE: "비밀번호가 생년월일로 초기화되었습니다.",
};

const toNullableString = (value: unknown) => {
  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

const extractApiMessage = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const responseData = error.response?.data;
  if (!responseData || typeof responseData !== "object") {
    return null;
  }

  const apiMessage = (responseData as Record<string, unknown>).message;
  return typeof apiMessage === "string" ? apiMessage : null;
};

const resolvePasswordResetMessage = (
  codeOrMessage: string | null | undefined,
  fallbackMessage: string
) => {
  const normalized = (codeOrMessage ?? "").trim();
  if (!normalized) {
    return fallbackMessage;
  }

  return PASSWORD_RESET_MESSAGE_MAP[normalized] ?? normalized;
};

const normalizeResult = (
  raw: AdminPasswordResetResultRaw | null | undefined
): AdminPasswordResetResult | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  return {
    userId: toNullableString(raw.userId),
    loginId: toNullableString(raw.loginId),
    temporaryPassword: toNullableString(raw.temporaryPassword),
  };
};

export const resetAdminUserPasswordToBirthDateApi = async (
  userIdentifier: string
): Promise<{
  message: string;
  result: AdminPasswordResetResult;
}> => {
  const normalizedIdentifier = userIdentifier.trim();
  if (!normalizedIdentifier) {
    throw new Error(PASSWORD_RESET_MESSAGE_MAP.AUTH_USER_IDENTIFIER_REQUIRED);
  }

  try {
    const res = await api.post<ApiResponse<AdminPasswordResetResultRaw>>(
      `/api/admin/permissions/users/${encodeURIComponent(normalizedIdentifier)}/password/reset`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "비밀번호 초기화에 실패했습니다.");
    }

    const result = normalizeResult(res.data.result ?? res.data.data);
    if (!result) {
      throw new Error("비밀번호 초기화 결과를 확인할 수 없습니다.");
    }

    return {
      message: resolvePasswordResetMessage(
        res.data.message,
        PASSWORD_RESET_MESSAGE_MAP.AUTH_PASSWORD_RESET_TO_BIRTH_DATE
      ),
      result,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("로그인 정보가 만료되었습니다.");
      }

      if (error.response?.status === 403) {
        throw new Error("관리자 권한이 필요합니다.");
      }

      if (error.response?.status === 404) {
        throw new Error(PASSWORD_RESET_MESSAGE_MAP.AUTH_ACCOUNT_NOT_FOUND);
      }
    }

    throw new Error(
      resolvePasswordResetMessage(
        extractApiMessage(error) ?? (error instanceof Error ? error.message : null),
        "비밀번호 초기화에 실패했습니다."
      )
    );
  }
};
