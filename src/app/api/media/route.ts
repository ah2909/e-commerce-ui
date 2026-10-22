import { mediaURL } from "@/lib/server/media";
import { validateHost } from "@/lib/server/security";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    validateHost(request.headers.get("host"));
  } catch {
    return new Response(null, { status: 404 });
  }
  const key = request.nextUrl.searchParams.get("key") || "";
  const url = key.length <= 512 ? mediaURL(key) : undefined;
  if (!url) return new Response(null, { status: 404 });
  return Response.redirect(url, 307);
}
