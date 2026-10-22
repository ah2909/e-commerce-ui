import {
  allowedRoute,
  cookieName,
  redactCredentials,
  secureCookies,
  trustedClientIP,
  validMutation,
  validateHost,
} from "./security";
import { NextRequest, NextResponse } from "next/server";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

type Json = Record<string, unknown>;
const responseHeaders = { "Cache-Control": "private, no-store", Vary: "Cookie, Host" };

function problem(status: number, code: string) {
  return NextResponse.json(
    {
      code,
      message:
        code === "backend_unavailable"
          ? "Không thể kết nối cửa hàng. Vui lòng thử lại."
          : "Yêu cầu không được chấp nhận.",
    },
    { status, headers: responseHeaders },
  );
}

async function boundedBody(request: Request): Promise<string> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 1_000_000) {
        await reader.cancel();
        throw new Error("request_too_large");
      }
      chunks.push(decoder.decode(chunk.value, { stream: true }));
    }
    chunks.push(decoder.decode());
    return chunks.join("");
  } finally {
    reader.releaseLock();
  }
}

export async function upstream(
  host: string,
  path: string,
  method: string,
  body: string | undefined,
  headers: Record<string, string>,
) {
  const origin = new URL(process.env.GO_API_ORIGIN || "http://127.0.0.1:8080");
  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/"
  )
    throw new Error("invalid_origin");
  return new Promise<{ status: number; body: string; retryAfter?: string }>((resolve, reject) => {
    const run = origin.protocol === "https:" ? httpsRequest : httpRequest;
    const req = run(
      origin,
      {
        method,
        path,
        headers: {
          ...headers,
          Host: host,
          Accept: "application/json",
          ...(body
            ? {
                "Content-Type": "application/json",
                "Content-Length": String(Buffer.byteLength(body)),
              }
            : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > 4_000_000) res.destroy(new Error("response_too_large"));
          else chunks.push(chunk);
        });
        res.on("end", () =>
          resolve({
            status: res.statusCode || 502,
            body: Buffer.concat(chunks).toString("utf8"),
            retryAfter: res.headers["retry-after"],
          }),
        );
        res.on("error", reject);
      },
    );
    req.setTimeout(45_000, () => req.destroy(new Error("upstream_timeout")));
    req.on("error", reject);
    req.end(body);
  });
}

function sessionCookies(response: NextResponse, data: Json, kind: string) {
  const expires = new Date(String(data.session_expires_at));
  if (
    !Number.isFinite(expires.getTime()) ||
    typeof data.access_token !== "string" ||
    typeof data.refresh_token !== "string"
  )
    throw new Error("invalid_session");
  for (const [suffix, value] of Object.entries({
    access: data.access_token,
    refresh: data.refresh_token,
    kind,
    session: data.session_id,
  })) {
    response.cookies.set(cookieName(suffix), String(value), {
      httpOnly: true,
      secure: secureCookies(),
      sameSite: "strict",
      path: "/",
      expires,
    });
  }
}

function clearCredentials(request: NextRequest, response: NextResponse) {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith(cookieName("")))
      response.cookies.set(cookie.name, "", {
        httpOnly: true,
        secure: secureCookies(),
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
  }
}

export async function bridge(request: NextRequest) {
  let host: string;
  try {
    host = validateHost(request.headers.get("host"));
  } catch {
    return problem(404, "invalid_host");
  }
  const path = request.nextUrl.pathname;
  if (!allowedRoute(path, request.method)) return problem(404, "unsupported_route");
  if (request.method !== "GET" && !validMutation(request, host))
    return problem(403, "csrf_rejected");
  let clientIP: string | undefined;
  try {
    clientIP = trustedClientIP(request);
  } catch (error) {
    const code = error instanceof Error ? error.message : "invalid_client_identity";
    return problem(code === "ingress_not_configured" ? 503 : 400, code);
  }
  const query = request.nextUrl.search;
  if (request.nextUrl.searchParams.has("store_id")) return problem(400, "invalid_tenant_selector");
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 1_000_000) return problem(413, "request_too_large");
  let body: string | undefined;
  let payload: Json | undefined;
  try {
    if (request.method !== "GET") {
      const raw = await boundedBody(request);
      if (raw) {
        if (!request.headers.get("content-type")?.startsWith("application/json"))
          return problem(415, "json_required");
        payload = JSON.parse(raw);
        if (!payload || typeof payload !== "object" || Array.isArray(payload))
          return problem(400, "invalid_json");
        body = JSON.stringify(payload);
      }
    }
  } catch (error) {
    return problem(
      error instanceof Error && error.message === "request_too_large" ? 413 : 400,
      error instanceof Error && error.message === "request_too_large"
        ? "request_too_large"
        : "invalid_json",
    );
  }
  if (payload && ("store_id" in payload || "access_token" in payload || "refresh_token" in payload))
    return problem(400, "invalid_credentials");
  const isUserStart = path === "/api/v1/auth/sessions" || path === "/api/v1/auth/registrations";
  const isGuestStart = path === "/api/v1/guest-sessions";
  const isRefresh = path.endsWith("/refresh");
  const isLogout = path.endsWith("/current") && request.method === "DELETE";
  const kind = request.cookies.get(cookieName("kind"))?.value;
  if (isGuestStart && request.cookies.has(cookieName("access")))
    return problem(409, "session_exists");
  if (isRefresh) {
    const refresh = request.cookies.get(cookieName("refresh"))?.value;
    if (!refresh || (path.startsWith("/api/v1/auth/") ? kind !== "user" : kind !== "guest"))
      return problem(401, "session_required");
    body = JSON.stringify({ refresh_token: refresh });
  }
  const orderID = path.match(/^\/api\/v1\/orders\/([a-zA-Z0-9_-]+)/)?.[1];
  const access =
    orderID && kind !== "user"
      ? request.cookies.get(cookieName(`order-${orderID}`))?.value
      : undefined;
  const bearer = access || request.cookies.get(cookieName("access"))?.value;
  const headers: Record<string, string> = {};
  if (clientIP) headers["X-Forwarded-For"] = clientIP;
  if (bearer && !isUserStart && !isGuestStart && !isRefresh)
    headers.Authorization = `Bearer ${bearer}`;
  const key = request.headers.get("idempotency-key");
  if (key) headers["Idempotency-Key"] = key;
  try {
    const result = await upstream(host, path + query, request.method, body, headers);
    const data: Json = result.body ? JSON.parse(result.body) : {};
    const response =
      result.status === 204
        ? new NextResponse(null, { status: 204, headers: responseHeaders })
        : NextResponse.json(redactCredentials(data), {
            status: result.status,
            headers: responseHeaders,
          });
    if (result.retryAfter) response.headers.set("Retry-After", result.retryAfter);
    if (result.status < 300 && (isUserStart || isGuestStart || isRefresh)) {
      if (!isRefresh) clearCredentials(request, response);
      sessionCookies(
        response,
        data,
        isUserStart ? "user" : isGuestStart ? "guest" : kind || "user",
      );
    }
    if (
      result.status < 300 &&
      path === "/api/v1/checkout" &&
      typeof data.order_access_token === "string"
    ) {
      const order = data.order as Json;
      response.cookies.set(cookieName(`order-${String(order.order_id)}`), data.order_access_token, {
        httpOnly: true,
        secure: secureCookies(),
        sameSite: "strict",
        path: "/",
        maxAge: 30 * 86400,
      });
    }
    if (isLogout && (result.status < 300 || result.status === 401))
      clearCredentials(request, response);
    if (isRefresh && result.status === 401) clearCredentials(request, response);
    return response;
  } catch {
    return problem(502, "backend_unavailable");
  }
}
