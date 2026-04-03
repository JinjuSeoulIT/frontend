import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "his_access_token";
const SERVER_BOOT_COOKIE_NAME = "his_server_boot";
const AUTH_ME_PATH = "/api/auth/me";
const SERVER_BOOT_ID = Date.now().toString();

const getAuthToken = (request: NextRequest) =>
  request.cookies.get(AUTH_COOKIE_NAME)?.value;

const toLoginRedirect = (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(SERVER_BOOT_COOKIE_NAME, SERVER_BOOT_ID, {
    path: "/",
    sameSite: "lax",
  });
  return response;
};

const validateAuthToken = async (request: NextRequest, token: string) => {
  try {
    const authCheckUrl = new URL(AUTH_ME_PATH, request.url);
    const authCheckRes = await fetch(authCheckUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    return authCheckRes.ok;
  } catch {
    return false;
  }
};

export async function proxy(request: NextRequest) {
  const token = getAuthToken(request);
  if (!token) {
    return toLoginRedirect(request);
  }

  const isValid = await validateAuthToken(request, token);
  if (!isValid) {
    return toLoginRedirect(request);
  }

  const response = NextResponse.next();
  response.cookies.set(SERVER_BOOT_COOKIE_NAME, SERVER_BOOT_ID, {
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/reception/:path*",
    "/billing/:path*",
    "/treat/:path*",
    "/medical_support/:path*",
    "/receipt/:path*",
    "/patient/:path*",
    "/staff/:path*",
    "/",
  ],
};
