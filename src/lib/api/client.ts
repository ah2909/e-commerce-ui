import type { components, paths } from "./schema";
import createClient from "openapi-fetch";

export type Schema = components["schemas"];
export class ApiError extends Error {
  constructor(
    public status: number,
    public problem: Partial<Schema["Problem"]>,
  ) {
    super(problem.message || "Không thể hoàn tất yêu cầu. Vui lòng thử lại.");
  }
}

let refreshFlight: Promise<"anonymous" | "refreshed" | "expired"> | undefined;
async function refresh() {
  const session = await fetch("/api/session", { cache: "no-store" }).then((r) => r.json());
  if (session.kind === "anonymous") return "anonymous";
  const path =
    session.kind === "user" ? "/api/v1/auth/sessions/refresh" : "/api/v1/guest-sessions/refresh";
  return (await fetch(path, { method: "POST", headers: { "X-Commerce-CSRF": "1" } })).ok
    ? "refreshed"
    : "expired";
}

export async function commerceFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const request = new Request(
    input instanceof Request ? input : new URL(String(input), window.location.origin),
    init,
  );
  request.headers.set("X-Commerce-CSRF", "1");
  const retry = request.clone();
  const response = await fetch(request);
  const path = new URL(request.url).pathname;
  if (response.status !== 401 || /auth\/sessions|auth\/registrations|guest-sessions/.test(path))
    return response;
  refreshFlight ??= refresh().finally(() => {
    refreshFlight = undefined;
  });
  const refreshed = await refreshFlight;
  if (refreshed === "refreshed") return fetch(retry);
  if (refreshed === "expired") window.dispatchEvent(new Event("commerce-session-change"));
  return response;
}

export const api = createClient<paths>({ fetch: commerceFetch });

export async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  key?: string,
): Promise<T> {
  const response = await commerceFetch(path, {
    method,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? undefined : await response.json();
  if (!response.ok) throw new ApiError(response.status, data || {});
  return data as T;
}

export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (!result.response.ok || result.data === undefined)
    throw new ApiError(result.response.status, (result.error || {}) as Partial<Schema["Problem"]>);
  return result.data;
}
