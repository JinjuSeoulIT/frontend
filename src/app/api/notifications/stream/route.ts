import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const DEFAULT_NOTIFICATION_API_BASE_URL = "http://192.168.1.67:5555";
const ACCESS_TOKEN_COOKIE_NAME = "his_access_token";

const resolveNotificationBaseUrl = () => {
  const envBase =
    process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL?.trim() ||
    DEFAULT_NOTIFICATION_API_BASE_URL;
  return envBase.endsWith("/") ? envBase.slice(0, -1) : envBase;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value?.trim() ?? "";

  if (!accessToken) {
    return new Response(null, { status: 401 });
  }

  const baseUrl = resolveNotificationBaseUrl();
  const query = request.nextUrl.search ?? "";
  const upstreamUrl = `${baseUrl}/api/notifications/stream${query}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        },
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: "notification stream upstream error",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

