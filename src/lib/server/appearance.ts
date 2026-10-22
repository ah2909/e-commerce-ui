import { upstream } from "./bridge";
import { trustedClientIP, validateHost } from "./security";
import type { Appearance } from "@/lib/appearance";
import { headers } from "next/headers";
import { cache } from "react";
export const loadAppearance = cache(async (): Promise<Appearance | null> => {
  const h = await headers();
  try {
    const host = validateHost(h.get("host"));
    const ip = trustedClientIP(new Request("http://localhost", { headers: h }));
    const result = await upstream(
      host,
      "/api/v1/storefront",
      "GET",
      undefined,
      ip ? { "X-Forwarded-For": ip } : {},
    );
    return result.status === 200 ? (JSON.parse(result.body) as Appearance) : null;
  } catch {
    return null;
  }
});
