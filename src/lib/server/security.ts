import routes from "@/lib/api/routes.json";
import { isIP } from "node:net";

export function trustedClientIP(request: Request): string | undefined {
  const header = process.env.TRUSTED_CLIENT_IP_HEADER;
  if (!header) {
    if (process.env.NODE_ENV === "production") throw new Error("ingress_not_configured");
    return;
  }
  const value = request.headers.get(header)?.trim();
  if (!value || !isIP(value)) throw new Error("invalid_client_identity");
  return value;
}

export function validateHost(host: string | null): string {
  if (!host || !/^[a-z0-9.-]+(?::[0-9]{1,5})?$/i.test(host)) throw new Error("invalid_host");
  const normalized = host.toLowerCase();
  const name = normalized.split(":")[0];
  const base = process.env.TENANT_BASE_DOMAIN || "example.test";
  const single = process.env.SINGLE_STORE_HOST;
  if (
    name === (process.env.PLATFORM_HOST || base) ||
    name === (process.env.AUTH_HOST || `auth.${base}`)
  ) {
    throw new Error("invalid_host");
  }
  if (
    single
      ? name !== single
      : !new RegExp(`^[a-z0-9]+(?:-[a-z0-9]+)*\\.${base.replaceAll(".", "\\.")}$`).test(name)
  ) {
    throw new Error("invalid_host");
  }
  return normalized;
}

export function allowedRoute(path: string, method: string): boolean {
  if (!path.startsWith("/api/v1/") || /[%\\?#]/.test(path)) return false;
  if (/onboarding|payment-webhooks|auth\/social/.test(path)) return false;
  return routes.some(
    (route) =>
      route.method === method &&
      new RegExp(`^${route.path.replace(/\{[^}]+\}/g, "[a-zA-Z0-9_-]+")}$`).test(path),
  );
}

export function validMutation(request: Request, host: string): boolean {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("x-commerce-csrf") !== "1") return false;
  try {
    const parsed = new URL(origin);
    const expected = secureCookies() ? "https:" : "http:";
    return parsed.host === host && parsed.protocol === expected;
  } catch {
    return false;
  }
}

export function secureCookies(): boolean {
  return process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
}

export function cookieName(suffix: string): string {
  return `${secureCookies() ? "__Host-" : ""}commerce-${suffix}`;
}

export function redactCredentials(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactCredentials);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !["access_token", "refresh_token", "order_access_token"].includes(key))
      .map(([key, item]) => [key, redactCredentials(item)]),
  );
}
