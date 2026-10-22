import type { Schema } from "@/lib/api/client";
import { upstream } from "@/lib/server/bridge";
import { platformHost } from "@/lib/server/platform";
import { trustedClientIP, validMutation } from "@/lib/server/security";
import { NextRequest, NextResponse } from "next/server";

const responseHeaders = { "Cache-Control": "private, no-store", Vary: "Host" };
function problem(status: number, code: string) {
  return NextResponse.json({ code }, { status, headers: responseHeaders });
}

export async function POST(request: NextRequest) {
  let host: string;
  try {
    host = platformHost(request.headers.get("host"));
  } catch {
    return problem(404, "invalid_host");
  }
  if (!validMutation(request, host)) return problem(403, "csrf_rejected");
  const authorization = request.headers.get("authorization") || "";
  if (!/^Bearer [^\s]{1,4096}$/.test(authorization))
    return problem(401, "platform_unauthenticated");
  let ip: string | undefined;
  try {
    ip = trustedClientIP(request);
  } catch {
    return problem(503, "ingress_unavailable");
  }
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return problem(415, "invalid_request");
  let text = "";
  let size = 0;
  const reader = request.body?.getReader();
  if (!reader) return problem(400, "invalid_request");
  try {
    const decoder = new TextDecoder();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 16_384) {
        await reader.cancel();
        return problem(413, "request_too_large");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } catch {
    return problem(400, "invalid_request");
  } finally {
    reader.releaseLock();
  }
  let body: Schema["OnboardStore"];
  try {
    body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body))
      return problem(400, "invalid_request");
  } catch {
    return problem(400, "invalid_request");
  }
  try {
    const result = await upstream(host, "/api/v1/onboarding/stores", "POST", JSON.stringify(body), {
      Authorization: authorization,
      ...(ip ? { "X-Forwarded-For": ip } : {}),
    });
    if (result.status !== 201) {
      return NextResponse.json(
        {
          code:
            result.status === 409
              ? "onboarding_conflict"
              : result.status === 401
                ? "platform_unauthenticated"
                : result.status === 400
                  ? "invalid_onboarding"
                  : result.status === 429
                    ? "rate_limited"
                    : "onboarding_unavailable",
        },
        {
          status: result.status >= 400 && result.status <= 599 ? result.status : 502,
          headers: {
            ...responseHeaders,
            ...(result.retryAfter ? { "Retry-After": result.retryAfter } : {}),
          },
        },
      );
    }
    const data = JSON.parse(result.body);
    if (
      typeof data.subdomain !== "string" ||
      !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(data.subdomain)
    )
      return problem(502, "result_unknown");
    return NextResponse.json(
      { subdomain: data.subdomain },
      { status: 201, headers: responseHeaders },
    );
  } catch {
    return problem(502, "result_unknown");
  }
}
