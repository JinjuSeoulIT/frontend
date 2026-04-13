import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "his_access_token";
const FORCE_PASSWORD_COOKIE_NAME = "his_force_password_change";

type SessionCookiePayload = {
  accessToken?: string;
  passwordChangeRequired?: boolean;
  maxAgeSeconds?: number;
};

const toCookieOptions = (maxAgeSeconds?: number) => ({
  path: "/",
  sameSite: "lax" as const,
  ...(typeof maxAgeSeconds === "number" && maxAgeSeconds > 0
    ? { maxAge: Math.floor(maxAgeSeconds) }
    : {}),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SessionCookiePayload;
    const accessToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";
    const passwordChangeRequired = body.passwordChangeRequired === true;
    const response = NextResponse.json({ success: true });

    if (!accessToken) {
      response.cookies.set(AUTH_COOKIE_NAME, "", {
        path: "/",
        sameSite: "lax",
        maxAge: 0,
      });
    } else {
      response.cookies.set(
        AUTH_COOKIE_NAME,
        accessToken,
        toCookieOptions(body.maxAgeSeconds)
      );
    }

    response.cookies.set(
      FORCE_PASSWORD_COOKIE_NAME,
      passwordChangeRequired ? "1" : "0",
      toCookieOptions(body.maxAgeSeconds)
    );

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "인증 쿠키를 생성하지 못했습니다.",
      },
      { status: 400 }
    );
  }
}
