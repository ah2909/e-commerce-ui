import { money } from "@/lib/commerce";
import { bridge } from "@/lib/server/bridge";
import { cookieName } from "@/lib/server/security";
import { NextRequest } from "next/server";
import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let server: Server;
const seen: Array<{
  host: string;
  path: string;
  authorization?: string;
  key?: string;
  clientIP?: string;
}> = [];

beforeAll(async () => {
  process.env.TENANT_BASE_DOMAIN = "example.test";
  process.env.PLATFORM_HOST = "example.test";
  process.env.AUTH_HOST = "auth.example.test";
  process.env.COOKIE_SECURE = "false";
  server = createServer((request, response) => {
    seen.push({
      host: request.headers.host || "",
      path: request.url || "",
      authorization: request.headers.authorization,
      key: request.headers["idempotency-key"] as string,
      clientIP: request.headers["x-forwarded-for"] as string,
    });
    response.setHeader("Content-Type", "application/json");
    if (request.url === "/api/v1/auth/sessions") {
      response.end(
        JSON.stringify({
          access_token: "sample-access",
          refresh_token: "sample-refresh",
          session_id: "session-a",
          session_expires_at: "2030-01-01T00:00:00Z",
          access_expires_at: "2030-01-01T00:00:00Z",
          user_id: "user-a",
          store_id: "store-a",
        }),
      );
    } else if (request.url === "/api/v1/auth/sessions/refresh") {
      response.statusCode = 401;
      response.end(JSON.stringify({ code: "invalid_session" }));
    } else if (request.url === "/api/v1/checkout") {
      response.statusCode = 201;
      response.end(
        JSON.stringify({
          order: { order_id: "order-a", order_number: "ORD-000000000001" },
          order_access_token: "sample-grant",
        }),
      );
    } else if (request.url?.includes("/orders/")) {
      if (
        request.headers.host === "other.example.test" ||
        request.headers.authorization !== "Bearer sample-grant"
      ) {
        response.statusCode = 404;
        response.end(JSON.stringify({ code: "not_found", message: "Not found" }));
      } else response.end(JSON.stringify({ order_id: "order-a" }));
    } else response.end(JSON.stringify({ ok: true }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("server_address_missing");
  process.env.GO_API_ORIGIN = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

function browserRequest(
  host: string,
  path: string,
  method = "GET",
  body?: unknown,
  cookies = "",
  extra: Record<string, string> = {},
) {
  return new NextRequest(`http://${host}${path}`, {
    method,
    headers: {
      host,
      origin: `http://${host}`,
      "x-commerce-csrf": "1",
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookies ? { cookie: cookies } : {}),
      ...extra,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("host-preserving API bridge", () => {
  it("rejects invalid hosts, tenant selectors, and cross-origin mutations before forwarding", async () => {
    const count = seen.length;
    expect((await bridge(browserRequest("example.test", "/api/v1/catalog/products"))).status).toBe(
      404,
    );
    expect(
      (await bridge(browserRequest("shop.example.test", "/api/v1/catalog/products?store_id=other")))
        .status,
    ).toBe(400);
    expect(
      (
        await bridge(
          browserRequest("shop.example.test", "/api/v1/cart", "POST", {}, "", {
            origin: "http://other.example.test",
          }),
        )
      ).status,
    ).toBe(403);
    expect(seen).toHaveLength(count);
  });

  it("forwards the validated host and stores login credentials only in HTTP-only cookies", async () => {
    const response = await bridge(
      browserRequest(
        "shop.example.test",
        "/api/v1/auth/sessions",
        "POST",
        { email: "test@example.test", password: "sample-password" },
        "",
        { "x-forwarded-host": "other.example.test" },
      ),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).not.toHaveProperty("access_token");
    expect(response.cookies.get(cookieName("access"))?.value).toBe("sample-access");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(seen.at(-1)?.host).toBe("shop.example.test");
  });

  it("rejects non-object JSON and clears credentials after a rejected refresh", async () => {
    expect(
      (await bridge(browserRequest("shop.example.test", "/api/v1/cart", "POST", "unexpected")))
        .status,
    ).toBe(400);
    const response = await bridge(
      browserRequest(
        "shop.example.test",
        "/api/v1/auth/sessions/refresh",
        "POST",
        undefined,
        `${cookieName("kind")}=user; ${cookieName("access")}=expired; ${cookieName("refresh")}=revoked`,
      ),
    );
    expect(response.status).toBe(401);
    expect(response.cookies.get(cookieName("access"))?.value).toBe("");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("forwards only a configured ingress identity and rejects missing or malformed addresses", async () => {
    await bridge(
      browserRequest("shop.example.test", "/api/v1/catalog/products", "GET", undefined, "", {
        "x-forwarded-for": "198.51.100.99",
      }),
    );
    expect(seen.at(-1)?.clientIP).toBeUndefined();
    process.env.TRUSTED_CLIENT_IP_HEADER = "x-commerce-client-ip";
    try {
      const count = seen.length;
      expect(
        (await bridge(browserRequest("shop.example.test", "/api/v1/catalog/products"))).status,
      ).toBe(400);
      expect(
        (
          await bridge(
            browserRequest("shop.example.test", "/api/v1/catalog/products", "GET", undefined, "", {
              "x-commerce-client-ip": "198.51.100.1, 198.51.100.2",
            }),
          )
        ).status,
      ).toBe(400);
      expect(seen).toHaveLength(count);
      for (const address of ["198.51.100.1", "2001:db8::2"]) {
        await bridge(
          browserRequest("shop.example.test", "/api/v1/catalog/products", "GET", undefined, "", {
            "x-commerce-client-ip": address,
            "x-forwarded-for": "forged",
          }),
        );
        expect(seen.at(-1)?.clientIP).toBe(address);
      }
    } finally {
      delete process.env.TRUSTED_CLIENT_IP_HEADER;
    }
  });

  it("cancels an oversized streamed body before forwarding or consuming the full stream", async () => {
    let pulled = 0;
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled++;
        controller.enqueue(new Uint8Array(400_000));
        if (pulled === 10) controller.close();
      },
      cancel() {
        cancelled = true;
      },
    });
    const count = seen.length;
    const request = new NextRequest("http://shop.example.test/api/v1/auth/sessions", {
      method: "POST",
      headers: {
        host: "shop.example.test",
        origin: "http://shop.example.test",
        "x-commerce-csrf": "1",
        "content-type": "application/json",
      },
      body: stream,
      duplex: "half",
    } as NonNullable<ConstructorParameters<typeof NextRequest>[1]> & { duplex: "half" });
    expect((await bridge(request)).status).toBe(413);
    expect(cancelled).toBe(true);
    expect(pulled).toBeLessThan(10);
    expect(seen).toHaveLength(count);
  });

  it("keeps the order grant private and lets the backend deny access on another store", async () => {
    const checkout = await bridge(
      browserRequest(
        "shop.example.test",
        "/api/v1/checkout",
        "POST",
        { cart_version: 1, payment_provider: "vietqr" },
        `${cookieName("kind")}=guest; ${cookieName("access")}=sample-guest`,
        { "idempotency-key": "same-operation" },
      ),
    );
    expect(checkout.status).toBe(201);
    expect(await checkout.json()).not.toHaveProperty("order_access_token");
    expect(checkout.cookies.get(cookieName("order-order-a"))?.value).toBe("sample-grant");
    expect(seen.at(-1)?.key).toBe("same-operation");
    const grant = `${cookieName("kind")}=guest; ${cookieName("order-order-a")}=sample-grant`;
    expect(
      (
        await bridge(
          browserRequest("shop.example.test", "/api/v1/orders/order-a", "GET", undefined, grant),
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await bridge(
          browserRequest("other.example.test", "/api/v1/orders/order-a", "GET", undefined, grant),
        )
      ).status,
    ).toBe(404);
  });
});

it("formats VND from integer minor units", () => {
  expect(money(1290000)).toContain("1.290.000");
  expect(() => money(1.5)).toThrow("invalid_money");
});
