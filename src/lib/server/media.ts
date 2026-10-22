export function mediaURL(objectKey: string): string | undefined {
  const base = process.env.MEDIA_BASE_URL;
  if (
    !base ||
    objectKey.startsWith("/") ||
    objectKey.split("/").some((p) => p === ".." || p === ".")
  )
    return;
  try {
    const url = new URL(base.endsWith("/") ? base : `${base}/`);
    if (
      url.protocol !== "https:" &&
      !(process.env.NODE_ENV !== "production" && url.protocol === "http:")
    )
      return;
    if (url.username || url.password) return;
    return new URL(objectKey.split("/").map(encodeURIComponent).join("/"), url).href;
  } catch {
    return;
  }
}
