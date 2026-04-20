import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { AUTH_API_BASE_URL, AUTH_SERVER_ORIGIN } from "@/lib/common/env";

type LoginRequest = {
  username: string;
  password: string;
};

type RegisterRequest = {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  emailVerificationToken?: string;
  phoneVerificationToken?: string;
  naverVerifyToken?: string;
  socialVerifyToken?: string;
};

type EmailSendRequest = {
  email: string;
};

type EmailVerifyRequest = {
  email: string;
  code: string;
};

type PasswordResetPrepareRequest = {
  userIdentifier: string;
  name: string;
};

type PasswordResetConfirmRequest = {
  userIdentifier: string;
  phone: string;
};

type SyncAuthSessionCookieRequest = {
  accessToken: string;
  passwordChangeRequired: boolean;
  maxAgeSeconds?: number;
};

export type AuthUser = {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  authRole?: string | null;
  departmentId: string | null;
  departmentName: string | null;
};

export type LoginResult = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
  passwordChangeRequired: boolean;
};

export type PasswordResetPrepareResult = {
  userId: string;
  loginId: string;
  maskedPhone: string;
};

const api = axios.create({
  // In the browser we go through Next rewrites so auth cookies are issued for the app origin.
  baseURL: typeof window === "undefined" ? AUTH_API_BASE_URL : "",
});

applyAuthInterceptors(api, {
  skipRedirectPaths: [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/oauth",
    "/api/auth/email",
    "/api/auth/phone",
    "/api/auth/password/reset/prepare",
    "/api/auth/password/reset/confirm",
  ],
});

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

const PASSWORD_CHANGE_MESSAGE_MAP: Record<string, string> = {
  AUTH_CURRENT_PASSWORD_INVALID: "현재 비밀번호가 올바르지 않습니다.",
  AUTH_PASSWORD_SAME_AS_CURRENT: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
  AUTH_PASSWORD_TOO_SHORT: "새 비밀번호는 8자 이상이어야 합니다.",
  AUTH_CURRENT_PASSWORD_REQUIRED: "현재 비밀번호를 입력해 주세요.",
  AUTH_NEW_PASSWORD_REQUIRED: "새 비밀번호를 입력해 주세요.",
  AUTH_PASSWORD_CHANGED: "비밀번호가 변경되었습니다.",
};

const resolvePasswordChangeMessage = (
  codeOrMessage: string | null | undefined,
  fallbackMessage: string
) => {
  const normalized = (codeOrMessage ?? "").trim();
  if (!normalized) {
    return fallbackMessage;
  }

  return PASSWORD_CHANGE_MESSAGE_MAP[normalized] ?? normalized;
};

const normalizeApiError = (error: unknown, fallbackMessage: string) => {
  const apiMessage = extractApiMessage(error);
  if (apiMessage) {
    return new Error(apiMessage);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
};

export const loginApi = async (payload: LoginRequest): Promise<LoginResult> => {
  const res = await api.post<ApiResponse<LoginResult>>("/api/auth/login", payload);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "로그인에 실패했습니다.");
  }
  return res.data.result;
};

export const registerApi = async (payload: RegisterRequest): Promise<void> => {
  const res = await api.post<ApiResponse<void>>("/api/auth/register", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "가입 신청에 실패했습니다.");
  }
};

export const getMeApi = async (): Promise<AuthUser> => {
  const res = await api.get<ApiResponse<AuthUser>>("/api/auth/me");
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "인증 정보가 유효하지 않습니다.");
  }
  return res.data.result;
};

export const changeMyPasswordApi = async (
  currentPassword: string,
  newPassword: string
): Promise<string> => {
  try {
    const res = await api.patch<ApiResponse<void>>("/api/auth/me/password", {
      currentPassword,
      newPassword,
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "비밀번호 변경에 실패했습니다.");
    }

    return resolvePasswordChangeMessage(
      res.data.message,
      "비밀번호가 변경되었습니다."
    );
  } catch (error) {
    throw new Error(
      resolvePasswordChangeMessage(
        extractApiMessage(error) ?? (error instanceof Error ? error.message : null),
        "비밀번호 변경에 실패했습니다."
      )
    );
  }
};

export const logoutApi = async (): Promise<void> => {
  await api.post("/api/auth/logout");
};

export const syncAuthSessionCookieApi = async (payload: SyncAuthSessionCookieRequest): Promise<void> => {
  const res = await fetch("/api/session/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("인증 쿠키 동기화에 실패했습니다.");
  }
};

export const getOAuthLoginUrl = (provider: "google" | "naver") => {
  return `${AUTH_SERVER_ORIGIN}/oauth2/authorization/${provider}`;
};

export const getRegisterSocialVerifyUrl = (provider: "naver" | "google") => {
  return `${AUTH_SERVER_ORIGIN}/api/auth/oauth/${provider}/register/start`;
};

export const sendVerificationEmailApi = async (payload: EmailSendRequest): Promise<void> => {
  const res = await api.post<ApiResponse<string>>("/api/auth/email/send", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "이메일 발송에 실패했습니다.");
  }
};

export const verifyEmailCodeApi = async (payload: EmailVerifyRequest): Promise<boolean> => {
  const res = await api.post<ApiResponse<boolean>>("/api/auth/email/verify", payload);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "이메일 인증 확인에 실패했습니다.");
  }
  return true;
};

export const preparePasswordReset = async (
  userIdentifier: string,
  name: string
): Promise<PasswordResetPrepareResult> => {
  const payload: PasswordResetPrepareRequest = {
    userIdentifier: userIdentifier.trim(),
    name: name.trim(),
  };

  try {
    const res = await api.post<ApiResponse<PasswordResetPrepareResult>>(
      "/api/auth/password/reset/prepare",
      payload
    );

    if (!res.data.success || !res.data.result) {
      throw new Error(res.data.message || "비밀번호 초기화 준비에 실패했습니다.");
    }

    return res.data.result;
  } catch (error) {
    throw normalizeApiError(error, "비밀번호 초기화 준비에 실패했습니다.");
  }
};

export const confirmPasswordReset = async (
  userIdentifier: string,
  phone: string
): Promise<void> => {
  const payload: PasswordResetConfirmRequest = {
    userIdentifier: userIdentifier.trim(),
    phone: phone.trim(),
  };

  try {
    const res = await api.post<ApiResponse<unknown>>(
      "/api/auth/password/reset/confirm",
      payload
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "비밀번호 초기화에 실패했습니다.");
    }
  } catch (error) {
    throw normalizeApiError(error, "비밀번호 초기화에 실패했습니다.");
  }
};

export const approveRegisterRequestApi = async (staffId: number): Promise<void> => {
  const res = await api.post<ApiResponse<void>>(`/api/auth/register-requests/${staffId}/approve`);
  if (!res.data.success) {
    throw new Error(res.data.message || "가입 승인 처리에 실패했습니다.");
  }
};

export const rejectRegisterRequestApi = async (staffId: number): Promise<void> => {
  const res = await api.post<ApiResponse<void>>(`/api/auth/register-requests/${staffId}/reject`);
  if (!res.data.success) {
    throw new Error(res.data.message || "가입 반려 처리에 실패했습니다.");
  }
};

export const checkUsernameAvailabilityApi = async (username: string): Promise<boolean> => {
  const res = await api.get<ApiResponse<boolean>>("/api/auth/register/check-username", { params: { username } });
  if (!res.data.success || typeof res.data.result !== "boolean") {
    throw new Error(res.data.message || "아이디 중복 확인에 실패했습니다.");
  }
  return res.data.result;
};

export const sendRegisterEmailCodeApi = async (email: string): Promise<string> => {
  const res = await api.post<ApiResponse<void>>("/api/auth/register/email/send", { value: email });
  if (!res.data.success) {
    throw new Error(res.data.message || "이메일 인증코드 발송에 실패했습니다.");
  }
  return res.data.message || "인증코드를 발송했습니다.";
};

export const verifyRegisterEmailCodeApi = async (email: string, code: string): Promise<string> => {
  const res = await api.post<ApiResponse<{ verificationToken: string }>>("/api/auth/register/email/verify", { value: email, code });
  if (!res.data.success || !res.data.result?.verificationToken) {
    throw new Error(res.data.message || "이메일 인증 확인에 실패했습니다.");
  }
  return res.data.result.verificationToken;
};

export const sendRegisterPhoneCodeApi = async (phone: string): Promise<string> => {
  const res = await api.post<ApiResponse<void>>("/api/auth/register/phone/send", { value: phone });
  if (!res.data.success) {
    throw new Error(res.data.message || "문자 인증코드 발송에 실패했습니다.");
  }
  return res.data.message || "인증코드를 발송했습니다.";
};

export const verifyRegisterPhoneCodeApi = async (phone: string, code: string): Promise<string> => {
  const res = await api.post<ApiResponse<{ verificationToken: string }>>("/api/auth/register/phone/verify", { value: phone, code });
  if (!res.data.success || !res.data.result?.verificationToken) {
    throw new Error(res.data.message || "문자 인증 확인에 실패했습니다.");
  }
  return res.data.result.verificationToken;
};
