import { dateTimeInstant, localDateTime } from "@/lib/commerce";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllEnvs());

it("displays local price schedules while preserving unchanged instants and precision", () => {
  vi.stubEnv("TZ", "Asia/Ho_Chi_Minh");
  const prior = "2026-10-03T12:00:32.123456Z";
  expect(localDateTime(prior)).toBe("2026-10-03T19:00");
  expect(dateTimeInstant("2026-10-03T19:00", prior)).toBe(prior);
  expect(dateTimeInstant("2026-10-03T20:00", prior)).toBe("2026-10-03T13:00:00.000Z");
});
