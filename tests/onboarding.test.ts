import { POST } from "@/app/api/platform/stores/route";
import { upstream } from "@/lib/server/bridge";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/bridge", () => ({ upstream: vi.fn() }));
const call = vi.mocked(upstream);
function request({
  host = "example.test",
  origin = "http://example.test",
  token = "Bearer sample-platform",
  csrf = "1",
  body = JSON.stringify({
    subdomain: "moc-studio",
    store_name: "Mộc Studio",
    email: "owner@example.com",
    password: "owner-password-123",
  }),
} = {}) {
  return new NextRequest(`http://${host}/api/platform/stores`, {
    method: "POST",
    headers: {
      host,
      origin,
      authorization: token,
      "x-commerce-csrf": csrf,
      "content-type": "application/json",
    },
    body,
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  process.env.PLATFORM_HOST = "example.test";
  process.env.COOKIE_SECURE = "false";
  delete process.env.TRUSTED_CLIENT_IP_HEADER;
});
describe("platform onboarding boundary", () => {
  it("denies tenant hosts, cross-origin requests, missing CSRF and missing platform credentials", async () => {
    expect((await POST(request({ host: "shop.example.test" }))).status).toBe(404);
    expect((await POST(request({ origin: "http://other.example.test" }))).status).toBe(403);
    expect((await POST(request({ csrf: "" }))).status).toBe(403);
    expect((await POST(request({ token: "" }))).status).toBe(401);
    expect(call).not.toHaveBeenCalled();
  });
  it("forwards the validated platform host and explicit credential without returning credentials", async () => {
    call.mockResolvedValue({
      status: 201,
      body: JSON.stringify({
        subdomain: "moc-studio",
        store_id: "store-a",
        owner_user_id: "owner-a",
        access_token: "must-not-escape",
      }),
    });
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ subdomain: "moc-studio" });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(call).toHaveBeenCalledWith(
      "example.test",
      "/api/v1/onboarding/stores",
      "POST",
      expect.any(String),
      { Authorization: "Bearer sample-platform" },
    );
  });
  it("rejects malformed and oversized streamed bodies before calling the backend", async () => {
    expect((await POST(request({ body: "invalid" }))).status).toBe(400);
    expect((await POST(request({ body: "x".repeat(17000) }))).status).toBe(413);
    expect(call).not.toHaveBeenCalled();
  });
  it("preserves rate limits and conflict status without leaking backend details", async () => {
    call.mockResolvedValueOnce({ status: 429, body: "private details", retryAfter: "60" });
    const limited = await POST(request());
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("60");
    call.mockResolvedValueOnce({ status: 409, body: "private details" });
    const conflict = await POST(request());
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toEqual({ code: "onboarding_conflict" });
  });
  it("reports uncertain upstream results without retrying creation", async () => {
    call.mockRejectedValue(new Error("timeout"));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "result_unknown" });
    expect(call).toHaveBeenCalledTimes(1);
  });
  it("forwards only the configured trusted ingress identity", async () => {
    process.env.TRUSTED_CLIENT_IP_HEADER = "x-commerce-client-ip";
    const input = request();
    expect((await POST(input)).status).toBe(503);
    const trusted = request();
    trusted.headers.set("x-commerce-client-ip", "192.0.2.50");
    trusted.headers.set("x-forwarded-for", "192.0.2.99");
    call.mockResolvedValue({ status: 201, body: '{"subdomain":"moc-studio"}' });
    expect((await POST(trusted)).status).toBe(201);
    expect(call).toHaveBeenCalledWith(
      "example.test",
      expect.any(String),
      "POST",
      expect.any(String),
      { Authorization: "Bearer sample-platform", "X-Forwarded-For": "192.0.2.50" },
    );
  });
});
