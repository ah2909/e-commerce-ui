import { commerceFetch } from "@/lib/api/client";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

it("returns anonymous denial without resetting the session and remounting queries", async () => {
  const dispatchEvent = vi.fn();
  vi.stubGlobal("window", { location: { origin: "http://shop.example.test" }, dispatchEvent });
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("{}", { status: 401 }))
    .mockResolvedValueOnce(Response.json({ kind: "anonymous" }));
  vi.stubGlobal("fetch", fetch);
  expect((await commerceFetch("/api/v1/orders/unknown")).status).toBe(401);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(dispatchEvent).not.toHaveBeenCalled();
});

it("signals a session change once after refresh credentials are rejected", async () => {
  const dispatchEvent = vi.fn();
  vi.stubGlobal("window", { location: { origin: "http://shop.example.test" }, dispatchEvent });
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("{}", { status: 401 }))
    .mockResolvedValueOnce(Response.json({ kind: "user" }))
    .mockResolvedValueOnce(new Response("{}", { status: 401 }));
  vi.stubGlobal("fetch", fetch);
  expect((await commerceFetch("/api/v1/customer/profile")).status).toBe(401);
  expect(dispatchEvent).toHaveBeenCalledTimes(1);
});
