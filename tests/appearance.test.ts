import { canKeepAppearance, safeImageURL } from "@/lib/appearance";
import { describe, expect, it } from "vitest";
describe("merchant image URL policy", () => {
  it("permits HTTPS while rejecting executable, credentialed and malformed URLs", () => {
    expect(safeImageURL("https://cdn.example.com/image.png")).toBe(
      "https://cdn.example.com/image.png",
    );
    for (const value of [
      "javascript:alert(1)",
      "data:image/svg+xml,test",
      "http://example.com/image",
      "https://user:pass@example.com/a",
      "https://example.com/a#fragment",
      "https://example.com/a b",
    ])
      expect(safeImageURL(value)).toBeUndefined();
  });
});

import { ApiError } from "@/lib/api/client";
it("retains cached appearance only for transient failures", () => {
  for (const status of [401, 403, 404, 400])
    expect(canKeepAppearance(new ApiError(status, {}))).toBe(false);
  for (const status of [408, 429, 500, 503])
    expect(canKeepAppearance(new ApiError(status, {}))).toBe(true);
  expect(canKeepAppearance(new TypeError("Network unavailable"))).toBe(true);
});
