export function platformHost(host: string | null): string {
  const expected = process.env.PLATFORM_HOST || process.env.TENANT_BASE_DOMAIN || "example.test";
  if (
    !host ||
    !/^[a-z0-9.-]+(?::[0-9]{1,5})?$/i.test(host) ||
    host.split(":")[0].toLowerCase() !== expected.toLowerCase()
  ) {
    throw new Error("invalid_host");
  }
  return host.toLowerCase();
}
