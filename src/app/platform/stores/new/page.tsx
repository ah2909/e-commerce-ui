import { CreateStore } from "@/components/create-store";
import { platformHost } from "@/lib/server/platform";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const metadata = { title: "Tạo cửa hàng mới", robots: { index: false, follow: false } };

export default async function NewStorePage() {
  const h = await headers();
  let host: string;
  try {
    host = platformHost(h.get("host"));
  } catch {
    notFound();
  }
  const baseDomain = process.env.TENANT_BASE_DOMAIN || "example.test";
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const protocol =
    process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true"
      ? "https"
      : "http";
  return <CreateStore domain={baseDomain} port={port} protocol={protocol} />;
}
