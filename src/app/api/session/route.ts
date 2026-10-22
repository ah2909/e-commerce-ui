import { cookieName, validateHost } from "@/lib/server/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    validateHost(request.headers.get("host"));
  } catch {
    return NextResponse.json(
      { code: "invalid_host" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      kind: request.cookies.get(cookieName("kind"))?.value || "anonymous",
      session: request.cookies.get(cookieName("session"))?.value || null,
      ...(request.nextUrl.searchParams.has("order_id")
        ? {
            order_access_available:
              /^[a-zA-Z0-9_-]{1,80}$/.test(request.nextUrl.searchParams.get("order_id") || "") &&
              request.cookies.has(
                cookieName(`order-${request.nextUrl.searchParams.get("order_id")}`),
              ),
          }
        : {}),
    },
    { headers: { "Cache-Control": "private, no-store", Vary: "Cookie, Host" } },
  );
}
